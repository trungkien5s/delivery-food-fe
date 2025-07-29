
import { X, Smartphone, ShoppingBag, Star, Download } from "lucide-react"
import { useState } from "react"

export default function Sidebar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
      <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Tích hợp sẵn các ứng dụng</h4>
          <button onClick={() => setIsVisible(false)} className="text-white hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Đánh giá sản phẩm</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Mua X tặng Y</span>
          </div>
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Ứng dụng Affiliate</span>
          </div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span>Đa ngôn ngữ?</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-green-500">
          <p className="text-xs">
            Lưu ý với các ứng dụng trả phí bạn cần cài đặt và mua ứng dụng này trên App store Sapo để sử dụng ngay
          </p>
        </div>

        <div className="mt-3">
          <div className="bg-green-700 p-2 rounded flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  )
}
