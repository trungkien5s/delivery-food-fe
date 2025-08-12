

import { useState, useEffect } from "react"
import { ShoppingCart } from "lucide-react"
import { useAppDispatch } from "../../redux/store/store"
import { addToCart } from "../../redux/store/slices/cartSlice"

export default function SpecialDealsSection() {
  const dispatch = useAppDispatch()
  const [timeLeft, setTimeLeft] = useState({
    days: 145,
    hours: 23,
    minutes: 14,
    seconds: 55,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const specialDeals = [
    {
      id: "s1",
      name: "Lúc lắc bò Kobe",
      image: "/placeholder.svg?height=150&width=150",
      originalPrice: 188000,
      salePrice: 180000,
      discount: 4,
      sold: 175,
      total: 300,
      isNew: false,
    },
    {
      id: "s2",
      name: "Hành tây",
      image: "/placeholder.svg?height=150&width=150",
      originalPrice: 145000,
      salePrice: 120000,
      discount: 17,
      sold: 150,
      total: 160,
      isNew: false,
    },
    {
      id: "s3",
      name: "Bún gạo khô",
      image: "/placeholder.svg?height=150&width=150",
      originalPrice: 99000,
      salePrice: 89000,
      discount: 10,
      sold: 143,
      total: 195,
      isNew: true,
    },
    {
      id: "s4",
      name: "Ngò rí",
      image: "/placeholder.svg?height=150&width=150",
      originalPrice: 25000,
      salePrice: 21000,
      discount: 16,
      sold: 58,
      total: 90,
      isNew: true,
    },
    {
      id: "s5",
      name: "Cải thìa hữu cơ",
      image: "/placeholder.svg?height=150&width=150",
      originalPrice: 30000,
      salePrice: 26000,
      discount: 13,
      sold: 161,
      total: 200,
      isNew: false,
    },
    {
      id: "s6",
      name: "Cà rốt hữu cơ",
      image: "/placeholder.svg?height=150&width=150",
      originalPrice: 52000,
      salePrice: 44000,
      discount: 15,
      sold: 10,
      total: 50,
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

  return (
    <div className="bg-green-600 max-w-7xl mx-auto rounded-2xl relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full border-dashed"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 border-4 border-white rounded-full border-dashed"></div>
      </div>

      <div className="px-4 py-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">Khuyến mãi đặc biệt ⚡</h2>
            <p className="text-white opacity-90">Đừng bỏ lỡ cơ hội giảm giá đặc biệt!</p>
          </div>
          <div className="flex items-center space-x-4 justify-center md:justify-end">
            {[
              { label: "Giờ", value: timeLeft.hours },
              { label: "Phút", value: timeLeft.minutes },
              { label: "Giây", value: timeLeft.seconds },
            ].map((time, index) => (
              <div key={index} className="bg-white rounded-lg p-3 text-center min-w-[60px]">
                <div className="text-2xl font-bold text-green-600">{time.value}</div>
                <div className="text-xs text-gray-600">{time.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {specialDeals.map((product) => {
            const soldPercentage = Math.round((product.sold / product.total) * 100)
            const isLowStock = soldPercentage > 80

            return (
              <div key={product.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow group">
                <div className="relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {product.discount}%
                    </span>
                    {product.isNew && (
                      <span className="bg-orange-400 text-white px-2 py-1 rounded-full text-xs font-bold">Mới</span>
                    )}
                  </div>
                  {isLowStock && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      Sắp hết!
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm line-clamp-2">{product.name}</h3>

                  {/* Stock progress */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>
                        Đã bán: {product.sold}/{product.total}
                      </span>
                      <span className={soldPercentage > 50 ? "text-green-600 font-semibold" : ""}>
                        {soldPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          soldPercentage > 80
                            ? "bg-red-500"
                            : soldPercentage > 50
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${soldPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-bold text-green-600">
                      {product.salePrice.toLocaleString()}đ
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      {product.originalPrice.toLocaleString()}đ
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    disabled={product.sold >= product.total}
                  >
                    {product.sold >= product.total ? (
                      <span>Hết hàng</span>
                    ) : (
                      <>
                        <ShoppingCart className="w-3 h-3" />
                        <span>Thêm vào giỏ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
