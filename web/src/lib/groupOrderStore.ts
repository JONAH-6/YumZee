// web/src/lib/groupOrderStore.ts — simple YZ group order for checkout popup (local + Firestore for cross-phone)
import { Product } from 'src/lib/orderStore'
import { db } from 'src/lib/firebase'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

export type GroupOrderStatus = 'active' | 'checkout' | 'completed' | 'expired'

export interface GroupMember {
  userId: string
  name: string
  role: 'host' | 'joiner'
}

export interface GroupItem {
  id: string
  productId: number
  productName: string
  productImage: string
  price: number
  quantity: number
  addedByUserId: string
  addedByName: string
}

export interface GroupOrder {
  id: string
  code: string // YZ-XXXX-XXXX group/session ID (internal, for joining group)
  productSelectionCode?: string // product numbers + quantities, e.g., "5", "5x3", "3x2,7x1,12x3" — what user shares
  hiddenAlphabets?: string // legacy product hidden letters
  status: GroupOrderStatus
  hostUserId: string
  members: GroupMember[]
  items: GroupItem[]
  createdAt: string
  expiresAt: string
}

const STORAGE_KEY = 'yumzee_group_orders_yz'
const EVENT = 'yumzee_group_update'
const BASE_FEE = 500
const DISCOUNT = 0.3
const EXPIRY = 60 * 60 * 1000

function dispatch() { if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT)) }
export const subscribeGroupStore = (cb: () => void) => {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
export function generateGroupCode(): string {
  const chars = 'BCDFGHJKLMNPQRSTUVWXYZ23456789'
  let p = ''
  for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)]
  return `YZ-${p.slice(0, 4)}-${p.slice(4, 8)}`
}
export function generateProductSelectionCode(items: { product: Product; quantity: number }[]): string {
  // e.g., [ {product:{id:5}, qty:1}, {product:{id:3}, qty:2} ] → "5,3x2" or "5x1,3x2" — we preserve qty>1 as x, qty=1 as just number
  return items.map(it => it.quantity > 1 ? `${it.product.id}x${it.quantity}` : `${it.product.id}`).join(',')
}
export function parseProductSelectionCode(code: string): { productId: number; quantity: number }[] | null {
  const s = code.trim()
  if (!s) return null
  const parts = s.split(',').map(p => p.trim()).filter(Boolean)
  if (parts.length === 0) return null
  const result: { productId: number; quantity: number }[] = []
  for (const part of parts) {
    const m = part.replace(/×/g, 'x').toLowerCase().match(/^(\d+)\s*(?:x\s*(\d+))?$/)
    if (!m) return null
    const id = parseInt(m[1], 10)
    const qty = m[2] ? parseInt(m[2], 10) : 1
    if (id < 1 || id > 15 || qty < 1 || qty > 99) return null
    // Do not create duplicate product entries — quantity already captures count
    const existing = result.find(r => r.productId === id)
    if (existing) existing.quantity += qty
    else result.push({ productId: id, quantity: qty })
  }
  return result
}
const genId = (pre: string) => `${pre}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
function loadAll(): GroupOrder[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const arr: GroupOrder[] = raw ? JSON.parse(raw) : []
    const now = Date.now()
    let changed = false
    const fixed = arr.map(g => {
      // migrate old groups without productSelectionCode — generate from items
      if (!g.productSelectionCode && g.items && g.items.length) {
        const code = g.items.map((it: any) => it.quantity > 1 ? `${it.productId}x${it.quantity}` : `${it.productId}`).join(',')
        g.productSelectionCode = code
        changed = true
      }
      if (g.status === 'active' && new Date(g.expiresAt).getTime() < now) { changed = true; return { ...g, status: 'expired' as GroupOrderStatus } }
      return g
    })
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(fixed))
    return fixed
  } catch { return [] }
}
function saveAll(a: GroupOrder[]) { if (typeof window === 'undefined') return; localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); dispatch() }
export function calculateDeliveryFee(count: number) { return count >= 2 ? Math.round(BASE_FEE * (1 - DISCOUNT)) : BASE_FEE }
export function calculateGroupTotal(g: GroupOrder) {
  const memberTotals = g.members.map(m => ({ userId: m.userId, name: m.name, role: m.role, total: g.items.filter(i => i.addedByUserId === m.userId).reduce((s, i) => s + i.price * i.quantity, 0) }))
  const subtotal = memberTotals.reduce((s, m) => s + m.total, 0)
  const deliveryFee = calculateDeliveryFee(g.members.length)
  return { memberTotals, subtotal, deliveryFee, grandTotal: subtotal + deliveryFee, baseFee: BASE_FEE }
}
// Firestore helpers — fire-and-forget, fallback to local
async function firestoreSave(g: GroupOrder) {
  try { await setDoc(doc(db, 'groupOrders', g.code), g, { merge: true }) } catch {}
}
async function firestoreGet(code: string): Promise<GroupOrder | null> {
  try {
    const snap = await getDoc(doc(db, 'groupOrders', code.toUpperCase()))
    if (snap.exists()) return snap.data() as GroupOrder
  } catch {}
  return null
}
  // Helper to normalize product selection code for comparison (e.g., "5" vs "5x1" same, order matters but we sort)
  function normalizeProductCode(code: string): string | null {
    const parsed = parseProductSelectionCode(code)
    if (!parsed) return null
    // sort by productId for canonical comparison, keep qty
    parsed.sort((a,b)=>a.productId-b.productId)
    return parsed.map(p=> p.quantity>1 ? `${p.productId}x${p.quantity}` : `${p.productId}`).join(',').toUpperCase()
  }
export const GroupOrderStore = {
  getAll() { return loadAll() },
  getByCode(code: string) {
    const up = code.trim().toUpperCase().replace(/\s+/g, '')
    const normInput = normalizeProductCode(code)
    return loadAll().find(g => {
      if (g.code.toUpperCase() === up) return true
      if (g.hiddenAlphabets && g.hiddenAlphabets.toUpperCase() === up) return true
      if (g.productSelectionCode) {
        const normStored = normalizeProductCode(g.productSelectionCode)
        if (normStored && normInput && normStored === normInput) return true
        if (g.productSelectionCode.toUpperCase().replace(/\s+/g, '') === up) return true
      }
      return false
    })
  },
  async getByCodeAsync(code: string): Promise<GroupOrder | null> {
    const up = code.trim().toUpperCase().replace(/\s+/g, '')
    const local = loadAll().find(g => g.code.toUpperCase() === up || (g.hiddenAlphabets && g.hiddenAlphabets.toUpperCase() === up))
    if (local) return local
    const remote = await firestoreGet(code)
    if (remote) { saveAll([remote, ...loadAll()]); return remote }
    // also try hiddenAlphabets search in Firestore via getAll
    try {
      const snap = await getDoc(doc(db, 'groupOrders', up))
      if (snap.exists()) return snap.data() as GroupOrder
    } catch {}
    return null
  },
  getActiveForUser(uid: string) { return loadAll().find(g => g.status === 'active' && g.members.some(m => m.userId === uid)) },
  // Legacy YZ code — now also stores productSelectionCode (e.g., "5", "5x3", "3x2,7x1,12x3")
  createGroupOrder(params: { hostUserId: string; hostName: string; items: { product: Product; quantity: number }[] }): GroupOrder {
    let code = generateGroupCode()
    if (loadAll().some(g => g.code === code)) code = generateGroupCode()
    const now = new Date()
    const hiddenAlphabets = params.items.map(it => (it.product as any).hiddenAlphabet || String.fromCharCode(65 + (it.product.id % 26))).join('')
    const productSelectionCode = generateProductSelectionCode(params.items)
    const g: GroupOrder = {
      id: genId('grp'), code, productSelectionCode, hiddenAlphabets, status: 'active', hostUserId: params.hostUserId,
      members: [{ userId: params.hostUserId, name: params.hostName, role: 'host' }],
      items: params.items.map(it => ({ id: genId('item'), productId: it.product.id, productName: it.product.name, productImage: it.product.image, price: it.product.price, quantity: it.quantity, addedByUserId: params.hostUserId, addedByName: params.hostName })),
      createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + EXPIRY).toISOString(),
    }
    saveAll([g, ...loadAll()])
    firestoreSave(g)
    return g
  },
  // New product hidden alphabet: code is hidden alphabets string like DZR
  createGroupOrderByAlphabets(params: { hostUserId: string; hostName: string; items: { product: Product; quantity: number }[] }): GroupOrder {
    const hiddenAlphabets = params.items.map(it => (it.product as any).hiddenAlphabet || String.fromCharCode(65 + (it.product.id % 26))).join('').toUpperCase()
    const code = hiddenAlphabets || generateGroupCode()
    const existing = loadAll().find(g => g.code.toUpperCase() === code || (g.hiddenAlphabets && g.hiddenAlphabets.toUpperCase() === code))
    if (existing && existing.status === 'active') return existing
    const now = new Date()
    const g: GroupOrder = {
      id: genId('grp'), code, hiddenAlphabets, status: 'active', hostUserId: params.hostUserId,
      members: [{ userId: params.hostUserId, name: params.hostName, role: 'host' }],
      items: params.items.map(it => ({ id: genId('item'), productId: it.product.id, productName: it.product.name, productImage: it.product.image, price: it.product.price, quantity: it.quantity, addedByUserId: params.hostUserId, addedByName: params.hostName })),
      createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + EXPIRY).toISOString(),
    }
    saveAll([g, ...loadAll()])
    firestoreSave(g)
    return g
  },
  async joinGroupOrderAsync(code: string, user: { userId: string; name: string }): Promise<GroupOrder> {
    const up = code.trim().toUpperCase()
    let g = await firestoreGet(up)
    if (g) {
      if (g.status !== 'active') throw new Error('Group not active — create new via INVITE')
      if (new Date(g.expiresAt).getTime() < Date.now()) throw new Error('Code expired after 1 hour')
      if (g.members.some(m => m.userId === user.userId)) throw new Error('Already joined')
      g.members.push({ userId: user.userId, name: user.name, role: 'joiner' })
      try { await updateDoc(doc(db, 'groupOrders', up), { members: g.members }) } catch { await setDoc(doc(db, 'groupOrders', up), g) }
      saveAll([g, ...loadAll().filter(x => x.code !== up)])
      return g
    }
    // fallback local
    return GroupOrderStore.joinGroupOrder(code, user)
  },
  joinGroupOrder(code: string, user: { userId: string; name: string }) {
    const all = loadAll()
    const idx = all.findIndex(g => g.code.toUpperCase() === code.trim().toUpperCase())
    if (idx === -1) throw new Error('No group found for ' + code.toUpperCase() + ' — click INVITE to create one')
    const g = all[idx]
    if (new Date(g.expiresAt).getTime() < Date.now()) { g.status = 'expired'; saveAll(all); throw new Error('Code expired after 1 hour — ask host to INVITE again') }
    if (g.status !== 'active') throw new Error('Group not active — create new via INVITE')
    if (g.members.some(m => m.userId === user.userId)) throw new Error('Already joined')
    g.members.push({ userId: user.userId, name: user.name, role: 'joiner' })
    saveAll(all)
    firestoreSave(g)
    return g
  },
  addItem(code: string, userId: string, product: Product, qty: number) {
    const all = loadAll(); const g = all.find(x => x.code.toUpperCase() === code.toUpperCase())
    if (!g || g.status !== 'active') throw new Error('Group not active')
    const m = g.members.find(x => x.userId === userId); if (!m) throw new Error('Join first')
    const ex = g.items.find(i => i.productId === product.id && i.addedByUserId === userId)
    if (ex) ex.quantity += qty; else g.items.push({ id: genId('item'), productId: product.id, productName: product.name, productImage: product.image, price: product.price, quantity: qty, addedByUserId: userId, addedByName: m.name })
    saveAll(all); return g
  },
  lockForCheckout(code: string, uid: string) {
    const all = loadAll(); const g = all.find(x => x.code.toUpperCase() === code.toUpperCase())
    if (!g) throw new Error('Not found'); if (g.hostUserId !== uid) throw new Error('Only host can pay'); if (g.status !== 'active') throw new Error('Not active')
    g.status = 'checkout'; saveAll(all); return g
  },
  complete(code: string) { const all = loadAll(); const g = all.find(x => x.code.toUpperCase()===code.toUpperCase()); if (g) { g.status='completed'; saveAll(all)} return g }
}
