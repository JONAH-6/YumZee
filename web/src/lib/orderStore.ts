// web/src/lib/orderStore.ts — Product catalog (15 products) + minimal OrderStore for checkout

export interface Product {
  id: number
  name: string
  category: string
  sellerName: string
  price: number
  image: string
  description?: string
  rating?: number
  isPopular?: boolean
  prepTimeMinutes?: number
  hiddenAlphabet?: string
}

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  category: string
}

export type OrderStatus = 'created' | 'payment_confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'

export interface EligibleLocation {
  id: string
  name: string
  active: boolean
}

export interface GroupOrderRules {
  maxParticipants: number
  deadlineMinutes: number
  eligibleLocations: EligibleLocation[]
}

export interface GroupParticipant {
  userId: string
  name: string
  role: 'host' | 'joiner'
  items: { productId: number; name: string; price: number; quantity: number; image: string }[]
  subtotal: number
}

export interface GroupOrder {
  id: string
  groupCode: string
  hostUserId: string
  hostName: string
  participants: GroupParticipant[]
  status: 'active' | 'locked' | 'expired' | 'completed'
  deadline: string
  createdAt: string
  subtotal: number
  deliveryFee: number
  serviceFee: number
  totalAmount: number
}

export interface SingleOrder {
  id: string
  customerName: string
  customerPhone: string
  deliveryType: string
  hostelAddress: string
  deliveryAddress: string
  roomNumber: string
  deliveryInstructions: string
  items: { productId: number; name: string; price: number; quantity: number; image: string }[]
  foodSubtotal: number
  foodTotal: number
  deliveryFee: number
  serviceFee: number
  totalAmount: number
  grandTotal: number
  status: OrderStatus
  createdAt: string
}

export const DEFAULT_GROUP_RULES: GroupOrderRules = {
  maxParticipants: 10,
  deadlineMinutes: 30,
  eligibleLocations: [
    { id: 'hostel_a', name: 'Hostel A', active: true },
    { id: 'hostel_b', name: 'Hostel B', active: true },
    { id: 'hostel_c', name: 'Hostel C', active: true },
    { id: 'campus_main', name: 'Main Campus', active: true },
  ],
}

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Shawarma (Chicken)', category: 'Savory Snacks', sellerName: 'Campus Grill Hub', price: 1200, image: '/shawarma.jpg' },
  { id: 2, name: 'Fried Plantain (Dodo)', category: 'Savory Snacks', sellerName: 'Mama Chisom Kitchen', price: 400, image: '/plantain.jpg' },
  { id: 3, name: 'Puff Puff (6 pcs)', category: 'Pastries', sellerName: 'Campus Bites', price: 300, image: '/puffpuff.jpg' },
  { id: 4, name: 'Chapman Drink (500ml)', category: 'Drinks', sellerName: 'Campus Bites', price: 500, image: '/chapman.jpg' },
  { id: 5, name: 'Moi Moi (2 wraps)', category: 'Savory Snacks', sellerName: 'Naija Pot', price: 500, image: '/moimoi.jpg' },
  { id: 6, name: 'Zobo Drink (500ml)', category: 'Drinks', sellerName: 'Campus Bites', price: 300, image: '/zobo.jpg' },
  { id: 7, name: 'Akara (Bean Cake) x5', category: 'Savory Snacks', sellerName: 'Hostel Kitchen Co.', price: 250, image: '/akara.jpg' },
  { id: 8, name: 'Suya (100g)', category: 'Savory Snacks', sellerName: 'Campus Grill Hub', price: 800, image: '/suya.jpg' },
  { id: 9, name: 'Meat Pie (Large)', category: 'Savory Snacks', sellerName: 'Campus Bites', price: 650, image: '/meatpie.jpg' },
  { id: 10, name: 'Sausage Roll (2 pcs)', category: 'Pastries', sellerName: 'Campus Bites', price: 700, image: '/sausage.jpg' },
  { id: 11, name: 'Chicken Sandwich', category: 'Pastries', sellerName: 'Hostel Kitchen Co.', price: 1200, image: '/sandwich.jpg' },
  { id: 12, name: 'Chocolate Cake Slice', category: 'Cakes & Desserts', sellerName: 'Sweet Tooth', price: 1000, image: '/cake.jpg' },
  { id: 13, name: 'Cupcake (2 pcs)', category: 'Cakes & Desserts', sellerName: 'Sweet Tooth', price: 800, image: '/cupcake.jpg' },
  { id: 14, name: 'Fruit Cup (Mixed)', category: 'Healthy Bites', sellerName: 'Healthy Bites Co.', price: 600, image: '/fruit.jpg' },
  { id: 15, name: 'Greek Yogurt Parfait', category: 'Healthy Bites', sellerName: 'Healthy Bites Co.', price: 900, image: '/yogurt.jpg' },
]

const ORDERS_KEY = 'yumzee_orders'
const RULES_KEY = 'yumzee_rules'

function loadOrders(): SingleOrder[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') } catch { return [] }
}
function saveOrders(orders: SingleOrder[]) {
  if (typeof window !== 'undefined') localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}
function loadRules(): GroupOrderRules {
  if (typeof window === 'undefined') return DEFAULT_GROUP_RULES
  try { return JSON.parse(localStorage.getItem(RULES_KEY) || 'null') || DEFAULT_GROUP_RULES } catch { return DEFAULT_GROUP_RULES }
}
function generateId() { return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }

export const OrderStore = {
  getRules(): GroupOrderRules { return loadRules() },
  saveRules(rules: GroupOrderRules) { if (typeof window !== 'undefined') localStorage.setItem(RULES_KEY, JSON.stringify(rules)) },

  getSingleOrders(): SingleOrder[] { return loadOrders() },
  getGroupOrders(): GroupOrder[] { return [] },
  getGroupOrderByCode(code: string): GroupOrder | null { return null },

  createSingleOrder(params: Omit<SingleOrder, 'id' | 'status' | 'createdAt'>): SingleOrder {
    const order: SingleOrder = { ...params, id: generateId(), status: 'created', createdAt: new Date().toISOString() }
    saveOrders([...loadOrders(), order])
    return order
  },

  updateOrderStatus(id: string, status: OrderStatus) {
    const orders = loadOrders()
    const idx = orders.findIndex(o => o.id === id)
    if (idx >= 0) { orders[idx].status = status; saveOrders(orders) }
  },

  getUserProfile() { return null },
  saveUserProfile(_profile: any) {},
}
