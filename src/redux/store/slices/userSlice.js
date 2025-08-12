import { createSlice } from "@reduxjs/toolkit";

// Helper functions để work với localStorage cho user data
const loadUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error loading user from storage:', error);
    return null;
  }
};

const saveUserToStorage = (user) => {
  try {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  } catch (error) {
    console.error('Error saving user to storage:', error);
  }
};

// Helper function để kiểm tra token có hợp lệ không
const isTokenValid = () => {
  try {
    const token = localStorage.getItem('access_token');
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    
    if (!token) {
      console.log('❌ No token found');
      return false;
    }
    
    // Nếu không có tokenExpiration, coi như token vẫn hợp lệ
    if (!tokenExpiration) {
      console.log('⚠️ No token expiration found, assuming valid');
      return true;
    }
    
    const expirationTime = parseInt(tokenExpiration, 10);
    const currentTime = Date.now();
    
    const isValid = currentTime < expirationTime;
    console.log(`🔍 Token validation: ${isValid ? 'VALID' : 'EXPIRED'}`, {
      currentTime: new Date(currentTime).toISOString(),
      expirationTime: new Date(expirationTime).toISOString(),
    });
    
    return isValid;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

// Initial state - load từ localStorage nếu có và token còn hợp lệ
const storedUser = loadUserFromStorage();
const tokenValid = isTokenValid();
const hasToken = !!localStorage.getItem('access_token');

console.log('🚀 Initial state check:', { 
  storedUser: !!storedUser, 
  tokenValid, 
  hasToken,
  shouldBeLoggedIn: !!(storedUser && hasToken)
});

const initialState = {
  isLoggedIn: !!(storedUser && hasToken), // Chỉ cần token và user data
  user: (storedUser && hasToken) ? storedUser : null,
  showAuthModal: false,
  authMode: "login", // "login" or "register"
  loading: false,
  error: null,
};

// Nếu có user data nhưng token không hợp lệ, xóa data cũ (chỉ khi có expiration)
if (storedUser && !hasToken) {
  console.log('🧹 Cleaning up invalid session');
  localStorage.removeItem('user');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('tokenExpiration');
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Login action - chỉ lưu user data, tokens sẽ được handle bởi AuthModal
    login: (state, action) => {
      console.log('✅ Login action dispatched:', action.payload);
      
      state.isLoggedIn = true;
      state.user = action.payload;
      state.error = null;
      state.loading = false;
      state.showAuthModal = false;
      
      // Lưu user data vào localStorage
      saveUserToStorage(action.payload);
    },
    
    // Logout action - clear user data
    logout: (state) => {
      console.log('🚪 Logout action dispatched');
      
      state.isLoggedIn = false;
      state.user = null;
      state.error = null;
      state.loading = false;
      state.showAuthModal = false;
      
      // Xóa tất cả data khỏi localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("tokenExpiration");
      localStorage.removeItem("user");
      
      console.log('🧹 All auth data cleared from localStorage');
    },
    
    // Update user profile
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      
      // Update localStorage
      saveUserToStorage(state.user);
    },
    
    setShowAuthModal: (state, action) => {
      state.showAuthModal = action.payload;
      if (!action.payload) {
        state.error = null;
      }
    },
    
    setAuthMode: (state, action) => {
      state.authMode = action.payload;
      state.error = null;
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Action để restore user từ localStorage - với validation token
    restoreUser: (state) => {
      console.log('🔄 Restoring user from localStorage');
      
      const storedUser = loadUserFromStorage();
      const hasToken = !!localStorage.getItem('access_token');
      
      console.log('🔍 Restore check:', { 
        hasStoredUser: !!storedUser, 
        hasToken 
      });
      
      if (storedUser && hasToken) {
        console.log('✅ Restoring user session');
        state.isLoggedIn = true;
        state.user = storedUser;
      } else {
        console.log('❌ No valid session to restore, clearing data');
        // Nếu không có session hợp lệ, clear data
        state.isLoggedIn = false;
        state.user = null;
        
        // Clean up localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("tokenExpiration");
      }
    },
    
    // Action để start login process
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // Action để start register process
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // Action khi login/register thất bại
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isLoggedIn = false;
      state.user = null;
    },
    
    // Action mới để handle token expiration
    tokenExpired: (state) => {
      console.log('⏰ Token expired, logging out user');
      
      state.isLoggedIn = false;
      state.user = null;
      state.error = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      
      // Clear all stored data
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("tokenExpiration");
    },
    
    // Action để validate token hiện tại
    validateToken: (state) => {
      const hasToken = !!localStorage.getItem('access_token');
      const tokenValid = isTokenValid();
      
      console.log('🔐 Token validation:', { hasToken, tokenValid, currentlyLoggedIn: state.isLoggedIn });
      
      if (!hasToken && state.isLoggedIn) {
        console.log('❌ No token but user logged in - logging out');
        // Không có token nhưng user vẫn logged in
        state.isLoggedIn = false;
        state.user = null;
        state.error = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        
        // Clear all stored data
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("tokenExpiration");
      } else if (hasToken && tokenValid && !state.isLoggedIn) {
        console.log('✅ Valid token found but user not logged in - restoring session');
        // Có token hợp lệ nhưng user chưa logged in, restore session
        const storedUser = loadUserFromStorage();
        if (storedUser) {
          state.isLoggedIn = true;
          state.user = storedUser;
          state.error = null;
        }
      }
    },
  },
});

export const {
  login,
  logout,
  updateUser,
  setShowAuthModal,
  setAuthMode,
  setLoading,
  setError,
  clearError,
  restoreUser,
  loginStart,
  registerStart,
  authFailure,
  tokenExpired,
  validateToken,
} = userSlice.actions;

export default userSlice.reducer;