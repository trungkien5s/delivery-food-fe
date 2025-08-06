import { Menu, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const navItems = [
    { name: "Trang chủ", href: "/", active: true },
    { name: "Giới thiệu", href: "/about" },
    { name: "Món ăn", href: "/menu", hasDropdown: true },
    { name: "Nhà hàng", href: "/restaurants", hasDropdown: true },
    { name: "Câu hỏi thường gặp", href: "/faq" },
    { name: "Tin tức", href: "/news" },
    { name: "Liên hệ", href: "/contact" },
  ]

  const deliveryFoodCategories = [
    {
      name: "Món chính",
      icon: "🍽️",
      subcategories: ["Cơm", "Phở", "Bún", "Mì", "Bánh mì"]
    },
    {
      name: "Đồ uống", 
      icon: "🥤",
      subcategories: ["Nước ngọt", "Trà sữa", "Cà phê", "Nước ép"]
    },
    {
      name: "Tráng miệng",
      icon: "🍰", 
      subcategories: ["Bánh ngọt", "Kem", "Chè", "Trái cây"]
    },
    {
      name: "Đồ ăn nhanh",
      icon: "🍔",
      subcategories: ["Burger", "Pizza", "Gà rán", "Sandwich"]
    },
    {
      name: "Món Á",
      icon: "🥢",
      subcategories: ["Món Việt", "Món Thái", "Món Hàn", "Món Nhật"]
    },
    {
      name: "Món Âu",
      icon: "🍝",
      subcategories: ["Pasta", "Steak", "Salad", "Soup"]
    }
  ]

  return (
    <div className="bg-white border-t border-gray-200 py-2 px-4 relative">
      <div className="max-w-7xl flex items-center space-x-6">
        {/* Categories Menu Button */}
        <div 
          className="relative"
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <button className="bg-yellow-400 hover:bg-yellow-500 px-3 py-2 rounded-md flex items-center space-x-2 font-medium text-sm transition-colors shadow-sm">
            <Menu className="w-4 h-4" />
            <span>Danh mục sản phẩm</span>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 pt-1 w-72 z-50">
              <div className="bg-white border border-gray-200 rounded-lg shadow-xl">
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-100">Danh mục món ăn</h3>
                  <div className="space-y-1">
                    {deliveryFoodCategories.map((category, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{category.icon}</span>
                            <span className="font-medium text-gray-700 group-hover:text-green-600 text-sm">
                              {category.name}
                            </span>
                          </div>
                          <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-green-600" />
                        </div>
                        
                        {/* Subcategories */}
                        <div className="hidden group-hover:block ml-6 py-1">
                          <div className="grid grid-cols-2 gap-1">
                            {category.subcategories.map((sub, subIndex) => (
                              <button
                                key={subIndex}
                                type="button"
                                className="text-xs text-gray-600 hover:text-green-600 py-1 px-2 hover:bg-green-50 rounded transition-colors text-left"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* View All Link */}
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <button 
                      type="button"
                      className="text-green-600 hover:text-green-700 font-medium text-xs flex items-center space-x-1 w-full justify-center py-1"
                    >
                      <span>Xem tất cả danh mục</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-1 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                item.active 
                  ? "text-green-600 border-b-2 border-green-600" 
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              <span>{item.name}</span>
              {item.hasDropdown && <ChevronDown className="w-3 h-3" />}
            </a>
          ))}
        </nav>

        {/* Sale Badge */}
        <div className="ml-auto">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse whitespace-nowrap">
            Mua hàng nhanh
          </span>
        </div>
      </div>
    </div>
  )
}