import React, {useState} from 'react';
import {Eye, EyeOff, Lock, Mail} from "lucide-react";
import AuthLayout from "./AuthLayout";
import {useNavigate} from "react-router-dom";

const SignInPage = ({ onSwitchToSignUp, onSignIn }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onSignIn && onSignIn(formData);
        }, 1500);
    };

    return (
        <AuthLayout>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
                <p className="text-gray-600">Chào mừng bạn quay trở lại!</p>
            </div>

            <div className="space-y-6">
                {/* Email Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="your@email.com"
                        />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                                errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                    <button
                        type="button"
                        className="text-sm text-orange-600 hover:text-orange-500 font-medium"
                    >
                        Quên mật khẩu?
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Đang đăng nhập...
                        </div>
                    ) : (
                        'Đăng nhập'
                    )}
                </button>

                {/* Switch to SignUp */}
                <div className="text-center">
                    <p className="text-gray-600">
                        Chưa có tài khoản?{' '}
                        <button
                            type="button"
                            onClick={() =>  navigate("/auth/sign-up")}
                            className="text-orange-600 hover:text-orange-500 font-semibold"
                        >
                            Đăng ký ngay
                        </button>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};
export default SignInPage;