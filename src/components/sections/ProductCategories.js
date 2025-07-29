import { ChevronLeft, ChevronRight } from "lucide-react"
import { useAppSelector } from "../../redux/hooks/useAppSelector"

export default function ProductCategories() {
  const { categories } = useAppSelector((state) => state.products)

  const categoryData = [
    { name: "Cà phê", count: "12 sản phẩm", image: "/placeholder.svg?height=80&width=80" },
    { name: "Trà sữa", count: "12 sản phẩm", image: "/placeholder.svg?height=80&width=80" },
    { name: "Bánh mì/Xôi", count: "10 sản phẩm", image: "/placeholder.svg?height=80&width=80" },
    { name: "Thức ăn nhanh", count: "8 sản phẩm", image: "/placeholder.svg?height=80&width=80" },
    { name: "Cơm", count: "11 sản phẩm", image: "/placeholder.svg?height=80&width=80" },
    { name: "Pizza", count: "15 sản phẩm", image: "/placeholder.svg?height=80&width=80" },
    { name: "Món chay", count: "10 sản phẩm", image: "/placeholder.svg?height=80&width=80" },
    { name: "Tráng miệng", count: "9 sản phẩm", image: "/placeholder.svg?height=80&width=80" },
    { name: "Sinh tố/Nước ép/Sữa", count: "5 sản phẩm", image: "/placeholder.svg?height=80&width=80" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Danh mục nổi bật</h3>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">Cà phê</span>
            <span className="px-3 py-1 text-gray-600 rounded-full text-sm hover:bg-gray-100 cursor-pointer">
              Trà sữa
            </span>
            <span className="px-3 py-1 text-gray-600 rounded-full text-sm hover:bg-gray-100 cursor-pointer">
              Bánh mì/Xôi
            </span>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
        {categoryData.map((category, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-16 h-16 mb-3 rounded-full overflow-hidden bg-gray-100">
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="font-medium text-gray-800 text-center text-sm mb-1">{category.name}</h4>
            <p className="text-xs text-gray-500 text-center">{category.count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
