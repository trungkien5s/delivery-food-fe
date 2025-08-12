import { Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store, useAppDispatch } from "./redux/store/store";
import SocketTester from "./pages/SocketTester";
import HomePage from "./pages/homepage/HomePage";
import { IntroPage } from "./pages/IntroPage/IntroPage";
import  MenuPage  from "./pages/menuPage/MenuPage";
import RestaurantsPage from "./pages/restaurantsPage/RestaurantsPage";
import RestaurantDetailPage from "./pages/restaurantsPage/RestaurantDetailPage";
import MenuDetailPage from "./pages/menuPage/MenuDetailPage";
import { restoreUser, validateToken } from "./redux/store/slices/userSlice";
import { useEffect } from "react";
import axios from "axios";
import CartPage from "./pages/cartPage/CartPage";
import  CheckOutPage  from "./pages/checkout/CheckOutPage";
import OrderPage  from "./pages/orderPage/OrderPage";
import  CategoryPage  from "./pages/categoriesPage/CategoryPage";

function App() {
 const dispatch = useDispatch();

  useEffect(() => {
 
    
    // Khôi phục session khi app load
    dispatch(restoreUser());
    
    // Thiết lập axios interceptor để tự động thêm token vào headers
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Authorization header set for axios');
    }
    
    // Axios interceptor để handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('🚫 Received 401, token might be expired');
          // Dispatch token expired action
          dispatch({ type: 'user/tokenExpired' });
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor when component unmounts
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [dispatch]);

    return (
        <Provider store={store}>
            <Routes>
                {/*<Route path="/" element={<SocketTester />} />*/}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<IntroPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/categories/:id" element={<CategoryPage />} />
                <Route path="/checkout" element={<CheckOutPage />} />
                <Route path="/orders" element={<OrderPage />} />
                <Route path="/menu/:id" element={<MenuDetailPage />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
            </Routes>
        </Provider>
    );
}

export default App;