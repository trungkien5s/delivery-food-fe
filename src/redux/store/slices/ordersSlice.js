import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const apiBase = process.env.REACT_APP_API_BASE || "";

const authHeaders = () => {
  try {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

// Async thunks for orders
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${apiBase}/orders`, orderData, { headers: authHeaders() });
      return res.data?.data || res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi tạo đơn hàng");
    }
  }
);

export const createOrderFromRestaurant = createAsyncThunk(
  "orders/createOrderFromRestaurant",
  async ({ restaurantId, orderData }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${apiBase}/orders/restaurant/${restaurantId}`,
        orderData,
        { headers: authHeaders() }
      );
      return res.data?.data || res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi tạo đơn hàng từ nhà hàng");
    }
  }
);

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${apiBase}/orders`, { headers: authHeaders() });
      return res.data?.data || res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi tải danh sách đơn hàng");
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMyOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${apiBase}/orders/me`, { headers: authHeaders() });
      return res.data?.data || res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi tải đơn hàng của tôi");
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${apiBase}/orders/${orderId}`, { headers: authHeaders() });
      return res.data?.data || res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi tải chi tiết đơn hàng");
    }
  }
);

const initialState = {
  orders: [],
  myOrders: [],
  currentOrder: null,
  loading: false,
  error: null,
  createOrderLoading: false,
  createOrderError: null,
  lastCreatedOrder: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createOrderError = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearLastCreatedOrder: (state) => {
      state.lastCreatedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.createOrderLoading = true;
        state.createOrderError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createOrderLoading = false;
        state.lastCreatedOrder = action.payload;
        state.myOrders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createOrderLoading = false;
        state.createOrderError = action.payload;
      })

      // Create order from restaurant
      .addCase(createOrderFromRestaurant.pending, (state) => {
        state.createOrderLoading = true;
        state.createOrderError = null;
      })
      .addCase(createOrderFromRestaurant.fulfilled, (state, action) => {
        state.createOrderLoading = false;
        state.lastCreatedOrder = action.payload;
        state.myOrders.unshift(action.payload);
      })
      .addCase(createOrderFromRestaurant.rejected, (state, action) => {
        state.createOrderLoading = false;
        state.createOrderError = action.payload;
      })

      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch my orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentOrder, clearLastCreatedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
