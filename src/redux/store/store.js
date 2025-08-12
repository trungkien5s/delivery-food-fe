import { configureStore } from "@reduxjs/toolkit"
import cartSlice from "./slices/cartSlice"
import userSlice from "./slices/userSlice"
import productsSlice from "./slices/productsSlice"
import { useDispatch, useSelector } from "react-redux"
import ordersSlice from "./slices/ordersSlice";
export const store = configureStore({
  reducer: {
    cart: cartSlice,
    user: userSlice,
    products: productsSlice,
    orders: ordersSlice,
  },
})
export const useAppDispatch = () => useDispatch()
export const useAppSelector = () => useSelector()