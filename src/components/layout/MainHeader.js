import { Search, BarChart3, Heart, ShoppingCart, Settings } from "lucide-react"
import { useAppSelector } from "../../redux/hooks/useAppSelector"

export default function MainHeader() {
  const { itemCount } = useAppSelector((state) => state.cart)

  return (
    <div className="bg-white shadow-sm py-3 px-4">
      <div className="flex items-center justify-between space-x-6">
        {/* Logo + Search Bar */}
        <div className="flex items-center space-x-6 flex-1">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded overflow-hidden">
              <img
                src="/logos.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <h1 className="text-xl font-bold text-gray-800">FoodLive</h1>
              <p className="text-sm text-gray-600">Chất lượng - Giao hàng nhanh</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập tên nhà hàng hoặc món ăn..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1 cursor-pointer hover:text-green-600">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Hệ thống</span>
          </div>
          <div className="flex items-center space-x-1 cursor-pointer hover:text-green-600">
            <Heart className="w-5 h-5" />
            <span className="text-sm">Yêu thích</span>
          </div>
          <div className="relative flex items-center space-x-1 cursor-pointer hover:text-green-600">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-sm">Giỏ hàng</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 cursor-pointer hover:text-green-600">
            <Settings className="w-5 h-5" />
            <span className="text-sm">Cài đặt</span>
          </div>
        </div>
      </div>
    </div>
  )
}
