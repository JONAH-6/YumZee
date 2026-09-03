// web/src/lib/groupCodeUtils.ts - Simplified ID & Quantity Code System

// Generate code from cart: [{id: 1, quantity: 3}, {id: 5, quantity: 2}] -> "1×3,5×2"
export function generateGroupCode(cart: { id: number; quantity: number }[]) {
  return cart.map((item) => `${item.id}×${item.quantity}`).join(',')
}

// Parse code and return products with quantities: "1×3,5×2" -> [{id: 1, quantity: 3}, {id: 5, quantity: 2}]
export function parseGroupCode(code: string) {
  const segments = code.split(',').map((s) => s.trim()).filter(Boolean)
  const itemsToAdd: { id: number; quantity: number }[] = []

  for (const segment of segments) {
    // Use x, X, or × as the separator
    const parts = segment.split(/[xX×]/).map((s) => s.trim())

    // If no "x", quantity is 1
    if (parts.length === 1) {
      const id = parseInt(parts[0], 10)
      if (id >= 1 && id <= 15) itemsToAdd.push({ id, quantity: 1 })
    }
    // If "x" is present, parse both id and quantity
    else if (parts.length === 2) {
      const id = parseInt(parts[0], 10)
      const quantity = parseInt(parts[1], 10)
      if (id >= 1 && id <= 15 && quantity > 0) itemsToAdd.push({ id, quantity })
    }
  }

  return itemsToAdd
}
