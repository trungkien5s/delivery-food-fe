import React from 'react'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <h3 className="text-xl font-bold text-green-700">FoodLive</h3>
            </div>
            <p className="text-sm leading-relaxed">
              Mang đến những trải nghiệm ẩm thực tươi ngon và chất lượng cao nhất cho khách hàng với dịch vụ giao hàng nhanh chóng.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-green-600 hover:text-green-800 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-green-600 hover:text-green-800 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-green-600 hover:text-green-800 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-700">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-green-600 transition-colors text-sm">Trang chủ</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors text-sm">Thực đơn</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors text-sm">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors text-sm">Tin tức</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors text-sm">Khuyến mãi</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-700">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-green-600 transition-colors text-sm">Hướng dẫn đặt hàng</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors text-sm">Chính sách giao hàng</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors text-sm">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors text-sm">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors text-sm">Liên hệ</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-700">Thông tin liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-sm">Hà Nội</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-sm">0376 940 811</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-sm">kiendev@foodlive.vn</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h5 className="text-sm font-semibold mb-2">Đăng ký nhận tin</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-l text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-r text-white text-sm font-medium transition-colors">
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-green-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-white text-sm">
              &copy; 2025 FoodLive. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-white hover:text-gray-200 text-sm transition-colors">
                Điều khoản dịch vụ
              </a>
              <a href="#" className="text-white hover:text-gray-200 text-sm transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-white hover:text-gray-200 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
