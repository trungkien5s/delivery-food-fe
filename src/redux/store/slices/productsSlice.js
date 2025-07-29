import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  items: [],
  categories: ["Rau củ", "Trái cây", "Thịt", "Trứng", "Đồ uống", "Bánh và sữa", "Hải sản", "Bánh mì", "Salad"],
  loading: false,
}

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setProducts, setLoading } = productsSlice.actions
export default productsSlice.reducer
