import React, { useState } from "react";
import { X, Eye, EyeOff, ArrowLeft } from "lucide-react";

// You must implement these hooks and actions for your React + Redux setup
import { useDispatch, useSelector } from "react-redux"
import { login, setAuthMode, setError, setLoading, setShowAuthModal } from "../../redux/store/slices/userSlice";
import axios from "axios"; 
import api from "../../api/api";

function AuthModal() {
    const dispatch = useDispatch();
    const { showAuthModal, authMode, loading, error } = useSelector(
        (state) => state.user
    );
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email' | 'verifyCode' | 'newPassword'
    const [resetToken, setResetToken] = useState('');
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        resetCode: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    if (!showAuthModal) return null;

    const handleClose = () => {
        dispatch(setShowAuthModal(false));
        setFormData({ email: "", password: "", confirmPassword: "", name: "", resetCode: "", newPassword: "", confirmNewPassword: "" });
        setForgotPasswordStep('email');
        setResetToken('');
    };

    const handleTabChange = (mode) => {
        dispatch(setAuthMode(mode));
        setFormData({ email: "", password: "", confirmPassword: "", name: "", resetCode: "", newPassword: "", confirmNewPassword: "" });
        setForgotPasswordStep('email');
        setResetToken('');
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };


const saveAuthData = (token, user, refreshToken = null) => {
    try {
        console.log('Saving auth data:', { 
            hasToken: !!token, 
            hasUser: !!user, 
            hasRefreshToken: !!refreshToken 
        });
        
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));

        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        let expirationTime;
        
        if (user.tokenExpiration) {
            expirationTime = user.tokenExpiration;
        } else {
            // Mặc định token hết hạn sau 24 giờ
            expirationTime = Date.now() + (24 * 60 * 60 * 1000);
        }
        
        localStorage.setItem('tokenExpiration', expirationTime.toString());
        
        console.log('✅ Auth data saved successfully', {
            tokenExpiration: new Date(expirationTime).toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error saving auth data:', error);
    }
};

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            if (forgotPasswordStep === 'email') {
                // Step 1: Send password reset request
                const response = await api.post(`${process.env.REACT_APP_API_BASE}/accounts/password-reset-request`, {
                    email: formData.email,
                });

                console.log('Password Reset Request Response:', response.data);

                if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
                    const message = response.data.message || response.data.error || "Gửi email đặt lại mật khẩu thất bại";
                    dispatch(setError(message));
                    dispatch(setLoading(false));
                    return;
                }

                // Move to verification step
                setForgotPasswordStep('verifyCode');
                // Using a custom modal/toast is better than alert() in a real app
                alert("Mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư và nhập mã xác nhận.");

            } else if (forgotPasswordStep === 'verifyCode') {
                // Step 2: Verify reset code
                if (!formData.resetCode || formData.resetCode.trim() === '') {
                    dispatch(setError("Vui lòng nhập mã xác nhận"));
                    dispatch(setLoading(false));
                    return;
                }

                const response = await api.post(`${process.env.REACT_APP_API_BASE}/accounts/verify-reset-code`, {
                    email: formData.email,
                    code: formData.resetCode,
                });

                console.log('Verify Code Response:', response.data);

                if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
                    const message = response.data.message || response.data.error || "Mã xác nhận không hợp lệ hoặc đã hết hạn";
                    dispatch(setError(message));
                    dispatch(setLoading(false));
                    return;
                }

                // Success → Move to new password step
                setForgotPasswordStep('newPassword');
                alert("Mã xác nhận hợp lệ! Vui lòng nhập mật khẩu mới.");

            } else if (forgotPasswordStep === 'newPassword') {
                // Step 3: Reset password - validate inputs
                if (!formData.resetCode || formData.resetCode.trim() === '') {
                    dispatch(setError("Vui lòng nhập mã xác nhận"));
                    dispatch(setLoading(false));
                    return;
                }

                if (!formData.newPassword || formData.newPassword.trim() === '') {
                    dispatch(setError("Vui lòng nhập mật khẩu mới"));
                    dispatch(setLoading(false));
                    return;
                }

                if (formData.newPassword !== formData.confirmNewPassword) {
                    dispatch(setError("Mật khẩu xác nhận không khớp"));
                    dispatch(setLoading(false));
                    return;
                }

                if (formData.newPassword.length < 6) {
                    dispatch(setError("Mật khẩu phải có ít nhất 6 ký tự"));
                    dispatch(setLoading(false));
                    return;
                }

                const response = await api.post(`${process.env.REACT_APP_API_BASE}/accounts/reset-password`, {
                    resetCode: formData.resetCode, // Send resetCode instead of email
                    newPassword: formData.newPassword,
                });

                console.log('Reset Password Response:', response.data);

                if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
                    const message = response.data.message || response.data.error || "Đặt lại mật khẩu thất bại";
                    dispatch(setError(message));
                    dispatch(setLoading(false));
                    return;
                }

                // Success - switch back to login
                alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.");
                dispatch(setAuthMode("login"));
                setForgotPasswordStep('email');
                setFormData({ email: formData.email, password: "", confirmPassword: "", name: "", resetCode: "", newPassword: "", confirmNewPassword: "" });
            }

        } catch (err) {
            console.error('❌ Forgot Password Error:', err);
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Đã có lỗi xảy ra. Vui lòng thử lại.";
            dispatch(setError(message));
        } finally {
            dispatch(setLoading(false));
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

                const response = await api.post(`${process.env.REACT_APP_API_BASE}/auth/register`, {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                });

                console.log('Register Response:', response.data);

                if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
                    const registerMessage = response.data.message || response.data.error || "Đăng ký thất bại";
                    dispatch(setError(registerMessage));
                    dispatch(setLoading(false));
                    return;
                }

                const { data } = response.data;

                if (data.access_token && data.user) {
                    const { user, access_token, refresh_token } = data;
                    saveAuthData(access_token, user, refresh_token);
                    
          
                    dispatch(login(user));
                    
    
                    
                    alert("Đăng ký thành công! Bạn đã được đăng nhập tự động.");
                } else if (data._id) {
                    alert("Đăng ký thành công! Vui lòng đăng nhập.");
                    dispatch(setError("Đăng ký thành công! Vui lòng đăng nhập."));
                    dispatch(setAuthMode("login"));
                    dispatch(setLoading(false));
                    return;
                } else {
                    dispatch(setError("Phản hồi từ server không hợp lệ"));
                    dispatch(setLoading(false));
                    return;
                }
            } else {
                const response = await api.post(`${process.env.REACT_APP_API_BASE}/auth/login`, {
                    username: formData.email,
                    password: formData.password,
                });

                console.log('🔐 Login Response:', response.data);

                if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
                    const loginMessage = response.data.message || response.data.error || "Đăng nhập thất bại";
                    dispatch(setError(loginMessage));
                    dispatch(setLoading(false));
                    return;
                }

                const { data } = response.data;
                const { user, access_token, refresh_token } = data;

                if (access_token && user) {
                    saveAuthData(access_token, user, refresh_token);
    
                    dispatch(login(user));
                } else {
                    dispatch(setError("Phản hồi từ server không hợp lệ"));
                    dispatch(setLoading(false));
                    return;
                }
            }

            dispatch(setShowAuthModal(false));
            setFormData({ email: "", password: "", confirmPassword: "", name: "", resetCode: "", newPassword: "", confirmNewPassword: "" });

        } catch (err) {
            console.error('❌ Authentication Error:', err);
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
            // This is a mock implementation
            const response = await api.post(`${process.env.REACT_APP_API_BASE}/auth/social`, {
                provider: provider.toLowerCase(),
            });

            console.log('🔗 Social Login Response:', response.data);

            if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
                const socialMessage = response.data.message || response.data.error || "Đăng nhập qua mạng xã hội thất bại";
                dispatch(setError(socialMessage));
                dispatch(setLoading(false));
                return;
            }

            const { data } = response.data;
            const { user, access_token, refresh_token } = data;

            if (access_token && user) {
                saveAuthData(access_token, user, refresh_token);

                // ================= FIX HERE =================
                // Dispatch only the user object as the payload
                dispatch(login(user));
                // ============================================

                dispatch(setShowAuthModal(false));
            } else {
                dispatch(setError("Đăng nhập qua mạng xã hội thất bại"));
            }
        } catch (err) {
            console.error('❌ Social Login Error:', err);
            const message =
                err.response?.data?.message ||
                "Đăng nhập qua mạng xã hội thất bại";
            dispatch(setError(message));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const renderForgotPasswordContent = () => {
        // ... (No changes needed here)
        return (
            <>
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => handleTabChange("login")}
                        className="text-gray-400 hover:text-gray-600 transition-colors mr-3"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800 flex-1 text-center">
                        Quên mật khẩu
                    </h2>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {forgotPasswordStep === 'email' && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="text-sm text-gray-600 mb-4">
                            Nhập email của bạn để nhận mã xác nhận đặt lại mật khẩu.
                        </div>
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
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                            {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
                        </button>
                    </form>
                )}

                {forgotPasswordStep === 'verifyCode' && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="text-sm text-gray-600 mb-4">
                            Mã xác nhận đã được gửi đến email <strong>{formData.email}</strong>. Vui lòng nhập mã để tiếp tục.
                        </div>
                        <div>
                            <input
                                type="text"
                                name="resetCode"
                                placeholder="Mã xác nhận (6 chữ số)"
                                value={formData.resetCode}
                                onChange={handleInputChange}
                                required
                                maxLength="6"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-wider"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                            {loading ? "Đang xác nhận..." : "Xác nhận mã"}
                        </button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setForgotPasswordStep('email')}
                                className="text-green-600 hover:text-green-700 text-sm"
                            >
                                Quay lại nhập email
                            </button>
                        </div>
                    </form>
                )}

                {forgotPasswordStep === 'newPassword' && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="text-sm text-gray-600 mb-4">
                            Mã xác nhận hợp lệ! Vui lòng nhập mật khẩu mới cho tài khoản <strong>{formData.email}</strong>.
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                placeholder="Mật khẩu mới"
                                value={formData.newPassword}
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
                        <div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmNewPassword"
                                placeholder="Xác nhận mật khẩu mới"
                                value={formData.confirmNewPassword}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                            {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                        </button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setForgotPasswordStep('verifyCode')}
                                className="text-green-600 hover:text-green-700 text-sm"
                            >
                                Quay lại xác nhận mã
                            </button>
                        </div>
                    </form>
                )}
            </>
        );
    };

    const renderMainContent = () => {
        // ... (No changes needed here)
        return (
            <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => handleTabChange("login")}
                            className={`pb-2 font-medium transition-colors ${authMode === "login"
                                ? "text-green-600 border-b-2 border-green-600"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => handleTabChange("register")}
                            className={`pb-2 font-medium transition-colors ${authMode === "register"
                                ? "text-green-600 border-b-2 border-green-600"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Đăng ký
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
                        {authMode === "login" ? "Đăng nhập" : "Đăng ký"}
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
                            <button
                                onClick={() => handleTabChange("forgot")}
                                className="text-green-600 hover:text-green-700 text-sm"
                            >
                                Quên mật khẩu?
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
            </>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {authMode === "forgot" ? (
                    <div className="p-6">
                        {renderForgotPasswordContent()}
                    </div>
                ) : (
                    renderMainContent()
                )}
            </div>
        </div>
    );
}

export default AuthModal;
