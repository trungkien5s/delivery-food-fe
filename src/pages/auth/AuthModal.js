import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

// You must implement these hooks and actions for your React + Redux setup
import { useDispatch, useSelector } from "react-redux"
import { login, setAuthMode, setError, setLoading, setShowAuthModal } from "../../redux/store/slices/userSlice";
import axios from "axios"; // Ensure you have axios installed for API requests

function AuthModal() {
const dispatch = useDispatch();
const { showAuthModal, authMode, loading, error } = useSelector(
  (state) => state.user
);
const [showPassword, setShowPassword] = useState(false);
const [formData, setFormData] = useState({
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
});

if (!showAuthModal) return null;

const handleClose = () => {
  dispatch(setShowAuthModal(false));
  setFormData({ email: "", password: "", confirmPassword: "", name: "" });
};

const handleTabChange = (mode) => {
  dispatch(setAuthMode(mode));
  setFormData({ email: "", password: "", confirmPassword: "", name: "" });
};

const handleInputChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

// Helper function to save authentication data
const saveAuthData = (token, user, refreshToken = null) => {
  try { 

    // Save to localStorage
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    // Set default authorization header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Optionally save token expiration time if provided
    if (user.tokenExpiration) {
      localStorage.setItem('tokenExpiration', user.tokenExpiration.toString());
    }

    console.log('✅ Auth data saved successfully');
  } catch (error) {
    console.error('❌ Error saving auth data:', error);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    if (authMode === "register") {
      if (formData.password !== formData.confirmPassword) {
        dispatch(setError("Mật khẩu xác nhận không khớp"));
        dispatch(setLoading(false));
        return;
      }

      if (formData.password.length < 6) {
        dispatch(setError("Mật khẩu phải có ít nhất 6 ký tự"));
        dispatch(setLoading(false));
        return;
      }

      // Gửi request đăng ký
      const response = await axios.post(`${process.env.REACT_APP_API_BASE}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log('Register Response:', response.data);

      // Kiểm tra statusCode
      if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
        const registerMessage = response.data.message || response.data.error || "Đăng ký thất bại";
        dispatch(setError(registerMessage));
        dispatch(setLoading(false));
        return;
      }

      // Handle backend response structure for register
      const { data } = response.data;

      if (data.access_token && data.user) {
        // Tự động đăng nhập sau đăng ký
        const { user, access_token, refresh_token } = data;
        saveAuthData(access_token, user, refresh_token);
        dispatch(login({
          user,
          token: access_token,
          refreshToken: refresh_token,
          isAuthenticated: true
        }));
        // Thông báo đăng ký thành công
        alert("Đăng ký thành công! Bạn đã được đăng nhập tự động.");
      } else if (data._id) {
        // Đăng ký thành công nhưng chưa có token, chuyển sang login
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        dispatch(setError("Đăng ký thành công! Vui lòng đăng nhập."));
        dispatch(setAuthMode("login")); // Switch to login mode
        dispatch(setLoading(false));
        return;
      } else {
        dispatch(setError("Phản hồi từ server không hợp lệ"));
        dispatch(setLoading(false));
        return;
      }
    } else {
      // Gửi request đăng nhập
      const response = await axios.post(`${process.env.REACT_APP_API_BASE}/auth/login`, {
        username: formData.email,
        password: formData.password,
      });

      console.log('🔐 Login Response:', response.data);

      // Kiểm tra statusCode
      if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
        const loginMessage = response.data.message || response.data.error || "Đăng nhập thất bại";
        dispatch(setError(loginMessage));
        dispatch(setLoading(false));
        return;
      }

      // Handle backend response structure: { statusCode, message, data: { user, access_token, refresh_token } }
      const { data } = response.data;
      const { user, access_token, refresh_token } = data;

      if (access_token && user) {
        saveAuthData(access_token, user, refresh_token);
        dispatch(login({
          user,
          token: access_token,
          refreshToken: refresh_token,
          isAuthenticated: true
        }));
      } else {
        dispatch(setError("Phản hồi từ server không hợp lệ"));
        dispatch(setLoading(false));
        return;
      }
    }

    dispatch(setShowAuthModal(false));

    // Reset form data after successful authentication
    setFormData({ email: "", password: "", confirmPassword: "", name: "" });

  } catch (err) {
    console.error(' Authentication Error:', err);
    console.error('- Response:', err.response?.data);
    console.error('- Status:', err.response?.status);

    const message =
      err.response?.data?.message || 
      err.response?.data?.error ||
      "Đã có lỗi xảy ra. Vui lòng thử lại.";
    dispatch(setError(message));
  } finally {
    dispatch(setLoading(false));
  }
};

const handleSocialLogin = async (provider) => {
  dispatch(setLoading(true));

  try {
    // In a real app, you would redirect to OAuth provider or use their SDK
    // This is just a mock implementation
    const response = await axios.post(`${process.env.REACT_APP_API_BASE}/auth/social`, {
      provider: provider.toLowerCase(),
      // Include any additional data from social login (access token, etc.)
    });

    console.log(' Social Login Response:', response.data);

    // Kiểm tra statusCode
    if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
      const socialMessage = response.data.message || response.data.error || "Đăng nhập qua mạng xã hội thất bại";
      dispatch(setError(socialMessage));
      dispatch(setLoading(false));
      return;
    }

    // Handle backend response structure: { statusCode, message, data: { user, access_token, refresh_token } }
    const { data } = response.data;
    const { user, access_token, refresh_token } = data;

    if (access_token && user) {
      saveAuthData(access_token, user, refresh_token);
      dispatch(login({
        user,
        token: access_token,
        refreshToken: refresh_token,
        isAuthenticated: true
      }));
      dispatch(setShowAuthModal(false));
    } else {
      dispatch(setError("Đăng nhập qua mạng xã hội thất bại"));
    }
  } catch (err) {
    console.error(' Social Login Error:', err);
    const message =
      err.response?.data?.message || 
      "Đăng nhập qua mạng xã hội thất bại";
    dispatch(setError(message));
  } finally {
    dispatch(setLoading(false));
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex space-x-8">
            <button
              onClick={() => handleTabChange("login")}
              className={`pb-2 font-medium transition-colors ${
                authMode === "login"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ĐĂNG NHẬP
            </button>
            <button
              onClick={() => handleTabChange("register")}
              className={`pb-2 font-medium transition-colors ${
                authMode === "register"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ĐĂNG KÝ
            </button>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            {authMode === "login" ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "register" && (
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Họ và tên"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {authMode === "register" && (
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading
                ? "Đang xử lý..."
                : authMode === "login"
                ? "Đăng nhập"
                : "Đăng ký"}
            </button>
          </form>

          {authMode === "login" && (
            <div className="text-center mt-4">
              <button className="text-green-600 hover:text-green-700 text-sm">
                Quên mật khẩu
              </button>
            </div>
          )}

          <div className="mt-6">
            <div className="text-center text-gray-500 text-sm mb-4">
              Hoặc {authMode === "login" ? "đăng nhập" : "đăng ký"} bằng
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleSocialLogin("Facebook")}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <span className="text-sm font-medium">Facebook</span>
              </button>
              <button
                onClick={() => handleSocialLogin("Google")}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <span className="text-sm font-medium">Google</span>
              </button>
            </div>
          </div>

          {authMode === "login" ? (
            <div className="text-center mt-6 text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <button
                onClick={() => handleTabChange("register")}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Đăng ký ngay
              </button>
            </div>
          ) : (
            <div className="text-center mt-6 text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <button
                onClick={() => handleTabChange("login")}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;