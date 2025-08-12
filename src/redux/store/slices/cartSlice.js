import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* ============ Helpers ============ */
const apiBase = process.env.REACT_APP_API_BASE || "";

const authHeaders = () => {
  try {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

const optionKeyOf = (selectedOptions = []) => {
  const arr = Array.isArray(selectedOptions) ? selectedOptions : [];
  const ids = arr.map((o) => (o?._id || o?.id || o)).filter(Boolean);
  return ids.sort().join(",");
};

const keyOf = ({ menuId, selectedOptions = [] }) =>
  `${menuId}|${optionKeyOf(selectedOptions)}`;

const getPrice = (item) => {
  const p =
    item?.price ??
    item?.menu?.price ??
    item?.menuItem?.price ??
    item?.menu?.unitPrice ??
    0;
  const n = Number(p);
  return Number.isFinite(n) ? n : 0;
};

const recomputeTotals = (state) => {
  state.itemCount = state.items.reduce((s, it) => s + Number(it.quantity || 0), 0);
  state.totalAmount = state.items.reduce((s, it) => s + getPrice(it) * Number(it.quantity || 0), 0);
};

// chuẩn hoá item trả về từ server
const normalizeServerItem = (sv) => {
  const id = sv?.id || sv?._id;
  const menuId = sv?.menuItem?._id || sv?.menuItem || sv?.menu_id || sv?.menuId;
  const selectedOptions = sv?.selectedOptions || [];
  return {
    ...sv,
    id,
    _clientKey: keyOf({ menuId, selectedOptions }),
    isTemporary: false,
    price: getPrice(sv),
  };
};

/* ============ Async thunks (API) ============ */
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${apiBase}/carts/me`, {
        headers: authHeaders(),
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi tải giỏ hàng");
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${apiBase}/cart_items/me`, {
        headers: authHeaders(),
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi tải sản phẩm trong giỏ");
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ menuId, quantity = 1, selectedOptions = [] }, { rejectWithValue }) => {
    try {
      const body = { items: [{ menuItem: menuId, quantity, selectedOptions }] };
      const response = await axios.post(`${apiBase}/cart_items/me`, body, {
        headers: authHeaders(),
      });
      return response.data?.data ?? response.data; // array or single
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng"
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${apiBase}/cart_items/me/${itemId}`,
        { quantity },
        { headers: authHeaders() }
      );
      return response.data?.data ?? response.data; // array or single
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi cập nhật giỏ hàng"
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { rejectWithValue }) => {
    try {
      await axios.delete(`${apiBase}/cart_items/me/${itemId}`, {
        headers: authHeaders(),
      });
      return itemId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi xóa khỏi giỏ hàng");
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete(`${apiBase}/carts/me`, { headers: authHeaders() });
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi xóa giỏ hàng");
    }
  }
);

/* ============ State ============ */
const initialState = {
  items: [],
  cart: null,
  itemCount: 0,
  totalAmount: 0,
  loading: false,
  error: null,
  lastAddedItem: null,
};

/* ============ Slice ============ */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastAddedItem: (state) => {
      state.lastAddedItem = null;
    },

    /* Optimistic add (local) */
    optimisticAddToCart: (state, action) => {
      const { menu, quantity = 1, notes = "", selectedOptions = [] } = action.payload;
      const menuId = menu?.id || menu?._id || action.payload?.menuId;
      if (!menuId) return;

      const k = keyOf({ menuId, selectedOptions });
      const existing =
        state.items.find((it) => (it._clientKey || it._clientKey === k) && it._clientKey === k) ||
        state.items.find(
          (it) =>
            (it.menu_id === menuId || it.menuId === menuId) &&
            (it._clientKey === k || it._clientKey == null) &&
            optionKeyOf(it.selectedOptions || []) === optionKeyOf(selectedOptions)
        );

      if (existing) {
        existing.quantity = Number(existing.quantity || 0) + Number(quantity || 0);
        existing.notes = notes ?? existing.notes ?? "";
        existing.selectedOptions = selectedOptions;
        existing._clientKey = k;
      } else {
        state.items.push({
          id: `temp_${Date.now()}`,
          menu_id: menuId,
          menu,
          quantity: Number(quantity || 1),
          notes,
          price: menu?.price ?? 0,
          selectedOptions,
          isTemporary: true,
          _clientKey: k,
        });
      }
      recomputeTotals(state);
    },

    /* Rollback when API fails */
    rollbackOptimisticAdd: (state, action) => {
      const { menu, quantity = 1, selectedOptions = [] } = action.payload || {};
      const menuId = menu?.id || menu?._id || action.payload?.menuId;
      if (!menuId) return;

      const k = keyOf({ menuId, selectedOptions });
      const idx = state.items.findIndex((it) => it._clientKey === k || it.menu_id === menuId);
      if (idx >= 0) {
        state.items[idx].quantity = Number(state.items[idx].quantity || 0) - Number(quantity || 0);
        if (state.items[idx].quantity <= 0) {
          state.items.splice(idx, 1);
        }
      }
      state.items = state.items.filter((it) => !(it.isTemporary && it.quantity <= 0));
      recomputeTotals(state);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch cart items
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        const arr = Array.isArray(action.payload) ? action.payload : [];
        state.items = arr.map(normalizeServerItem);
        recomputeTotals(state);
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add to cart (server)
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        if (Array.isArray(payload)) {
          state.items = payload.map(normalizeServerItem);
        } else if (payload) {
          const u = normalizeServerItem(payload);
          const idx = state.items.findIndex((it) => it.id === u.id);
          if (idx >= 0) state.items[idx] = u;
          else state.items.push(u);
        }

        recomputeTotals(state);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update cart item
      .addCase(updateCartItem.pending, (state, action) => {
        // Optimistic: update ngay
        const { itemId, quantity } = action.meta.arg || {};
        if (!itemId || !Number.isFinite(quantity)) return;
        const i = state.items.findIndex((it) => (it.id || it._id) === itemId);
        if (i >= 0 && quantity > 0) state.items[i].quantity = quantity;
        if (i >= 0 && quantity <= 0) state.items.splice(i, 1);
        recomputeTotals(state);
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.items = payload.map(normalizeServerItem);
        } else if (payload) {
          const u = normalizeServerItem(payload);
          const idx = state.items.findIndex((it) => it.id === u.id);
          if (idx >= 0) state.items[idx] = u;
          else state.items.push(u);
        }
        recomputeTotals(state);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload || "Lỗi khi cập nhật giỏ hàng";
        // Có thể fetch lại nếu muốn rollback cứng
      })

      // Remove from cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const itemId = action.payload;
        state.items = state.items.filter((it) => (it.id || it._id) !== itemId);
        recomputeTotals(state);
      })

      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.cart = null;
        state.itemCount = 0;
        state.totalAmount = 0;
      });
  },
});

/* ============ Thunk wrapper: optimistic flow ============ */
export const addToCartOptimistic =
  ({ menu, quantity = 1, selectedOptions = [] }) =>
  async (dispatch) => {
    const menuId = menu?.id || menu?._id;
    dispatch(cartSlice.actions.optimisticAddToCart({ menu, quantity, selectedOptions }));

    try {
      await dispatch(addToCart({ menuId, quantity, selectedOptions })).unwrap();
      // đồng bộ lại
      await dispatch(fetchCartItems());
    } catch (e) {
      dispatch(cartSlice.actions.rollbackOptimisticAdd({ menu, quantity, selectedOptions }));
      throw e;
    }
  };

export const {
  clearError,
  clearLastAddedItem,
  optimisticAddToCart,
  rollbackOptimisticAdd,
} = cartSlice.actions;

export default cartSlice.reducer;
