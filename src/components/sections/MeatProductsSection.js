
import { useState } from "react"
import { useAppDispatch } from "../../redux/store/store"
import { addToCart } from "../../redux/store/slices/cartSlice"


export default function MeatProductsSection() {
  const dispatch = useAppDispatch()
  const [activeCategory, setActiveCategory] = useState("Thịt heo")

  const categories = ["Thịt heo", "Thịt bò", "Hải sản"]

  const meatProducts = [
    {
      id: "m1",
      name: "Xương ống bò Kobe",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 92000,
      salePrice: 87000,
      discount: 5,
      category: "Thịt bò",
    },
    {
      id: "m2",
      name: "Thịt vai",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 107000,
      salePrice: 100000,
      discount: 7,
      category: "Thịt heo",
    },
    {
      id: "m3",
      name: "Mỡ heo",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 84000,
      salePrice: 76000,
      discount: 10,
      category: "Thịt heo",
    },
    {
      id: "m4",
      name: "Xương Cotlet",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 100000,
      salePrice: 95000,
      discount: 10,
      category: "Thịt heo",
    },
    {
      id: "m5",
      name: "Ba rọi rút sườn",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 165000,
      salePrice: 160000,
      discount: 3,
      category: "Thịt heo",
    },
    {
      id: "m6",
      name: "Thịt xay",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 95000,
      salePrice: 91000,
      discount: 4,
      category: "Thịt bò",
    },
    {
      id: "m7",
      name: "Nạc dăm Karst",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 121000,
      salePrice: 115000,
      discount: 7,
      category: "Thịt heo",
    },
    {
      id: "m8",
      name: "Xương thịt Karst",
      image: "/placeholder.svg?height=200&width=200",
      originalPrice: 72500,
      salePrice: 68250,
      discount: 6,
      category: "Thịt heo",
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
    <div className="max-w-7xl  mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left side - Products */}
        <div className="lg:col-span-3">
          {/* Category tabs */}
          <div className="flex space-x-6 mb-8 border-b">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeCategory === category
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {meatProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow group">
                <div className="relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {product.discount}%
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm">{product.name}</h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-bold text-green-600">{product.salePrice.toLocaleString()}đ</span>
                    <span className="text-xs text-gray-500 line-through">
                      {product.originalPrice.toLocaleString()}đ
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Xem tất cả
            </button>
          </div>
        </div>

        {/* Right side - Promotional banner */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-yellow-400 to-green-500 rounded-2xl p-6 text-white h-full flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Sản phẩm nổi bật trong farm</h3>
              <p className="text-sm opacity-90 mb-2">Ưu đãi độc quyền - Giảm giá 10%</p>
              <p className="text-lg font-semibold mb-4">Mua sớm thoải mái chỉ từ 10.000 VNĐ</p>
              <p className="text-sm opacity-90 mb-6">Chỉ trong tuần này. Mua ngay kẻo lỡ...</p>
              <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Mua ngay
              </button>
            </div>
            <div className="mt-6">
              <img
                src="/placeholder.svg?height=200&width=200"
                alt="Fresh vegetables"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
