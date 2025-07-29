import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }
      state.itemCount += 1
      state.total += action.payload.price
    },
    removeFromCart: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload)
      if (item) {
        state.total -= item.price * item.quantity
        state.itemCount -= item.quantity
        state.items = state.items.filter((item) => item.id !== action.payload)
      }
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload.id)
      if (item) {
        const diff = action.payload.quantity - item.quantity
        item.quantity = action.payload.quantity
        state.itemCount += diff
        state.total += item.price * diff
      }
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity } = cartSlice.actions
export default cartSlice.reducer
