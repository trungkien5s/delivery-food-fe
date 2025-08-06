
import { useState } from "react"
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Eye } from "lucide-react"
import { useAppDispatch } from "../../redux/store/store"
import { addToCart } from "../../redux/store/slices/cartSlice"

export default function NewShop() {
  const dispatch = useAppDispatch()
  const [currentIndex, setCurrentIndex] = useState(0)

  const newProducts = [
    {
      id: "1",
      name: "Hành tây",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 145000,
      salePrice: 120000,
      discount: 17,
      isNew: false,
    },
    {
      id: "2",
      name: "Bún gạo khô",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 99000,
      salePrice: 89000,
      discount: 10,
      isNew: true,
    },
    {
      id: "3",
      name: "Bún gạo huyết rồng",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 42000,
      salePrice: 37000,
      discount: 12,
      isNew: false,
    },
    {
      id: "4",
      name: "Miến dong",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 95000,
      salePrice: 85000,
      discount: 11,
      isNew: false,
    },
    {
      id: "5",
      name: "Nước năng lượng",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 32000,
      salePrice: 30000,
      discount: 6,
      isNew: false,
    },
  ]

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.salePrice,
        image: product.image,
      }),
    )
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, newProducts.length - 4))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, newProducts.length - 4)) % Math.max(1, newProducts.length - 4))
  }

  return (
    <div className="max-w-7xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Sản phẩm mới</h2>
        <div className="flex space-x-2">
          <button onClick={prevSlide} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextSlide} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 20}%)` }}
        >
          {newProducts.map((product) => (
            <div key={product.id} className="w-1/5 flex-shrink-0 px-2">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className="relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-col space-y-1">
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {product.discount}%
                    </span>
                    {product.isNew && (
                      <span className="bg-orange-400 text-white px-2 py-1 rounded-full text-xs font-bold">Mới</span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-green-600">{product.salePrice.toLocaleString()}đ</span>
                    <span className="text-sm text-gray-500 line-through">
                      {product.originalPrice.toLocaleString()}đ
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Thêm vào giỏ</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <button className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors">
          Xem tất cả
        </button>
      </div>
    </div>
  )
}
