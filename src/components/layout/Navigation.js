import { Menu, ChevronDown } from "lucide-react"

export default function Navigation() {
  const navItems = [
    { name: "Trang chủ", href: "#", active: true },
    { name: "Giới thiệu", href: "#" },
    { name: "Món ăn ", href: "#", hasDropdown: true },
    { name: "Nhà hàng ", href: "#", hasDropdown: true },
    { name: "Câu hỏi thường gặp", href: "#" },
    { name: "Tin tức", href: "#" },
    { name: "Liên hệ", href: "#" },
  ]

  return (
    <div className="bg-white border-t border-gray-200 py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center space-x-8">
        {/* Categories Menu Button */}
        <button className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-lg flex items-center space-x-2 font-medium">
          <Menu className="w-4 h-4" />
          <span>Danh mục</span>
        </button>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-8">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-1 py-2 text-sm font-medium transition-colors ${
                item.active ? "text-green-600 border-b-2 border-green-600               " : "text-gray-700 hover:text-green-600"
              }`}
            >
              <span>{item.name}</span>
              {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
            </a>
          ))}
        </nav>

        {/* Sale Badge */}
        <div className="ml-auto">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">Khuyến mãi</span>
        </div>
      </div>
    </div>
  )
}
