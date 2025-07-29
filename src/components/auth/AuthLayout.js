import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
// AuthLayout Component
const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Brand */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mb-4 rounded-2xl shadow-lg overflow-hidden">
                        <img
                            src="/logo.jpg"
                            alt="Logo"
                            className="w-full h-full object-cover"
                        />

                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">FOOD</h1>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {children}
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    © 2025 FoodieExpress. Tất cả quyền được bảo lưu.
                </p>
            </div>
        </div>
    );
};
export default AuthLayout;