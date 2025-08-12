export default function PromotionalBanners() {
  const banners = [
    {
      title: "Nông sản tươi mới",
      subtitle: "Sản phẩm 100% từ",
      subtitle2: "Thiên nhiên",
      image: "/placeholder.svg?height=150&width=200",
      bgColor: "from-orange-100 to-orange-200",
      textColor: "text-gray-800",
    },
    {
      title: "Bữa sáng lành mạnh",
      subtitle: "Sữa tươi nguyên chất",
      subtitle2: "Tiệt trùng",
      image: "/placeholder.svg?height=150&width=200",
      bgColor: "from-pink-100 to-pink-200",
      textColor: "text-gray-800",
    },
    {
      title: "Rau củ hữu cơ 100%",
      subtitle: "Sạch sẽ và an toàn",
      subtitle2: "Chất lượng",
      image: "/placeholder.svg?height=150&width=200",
      bgColor: "from-blue-100 to-blue-200",
      textColor: "text-gray-800",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${banner.bgColor} rounded-2xl p-6 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer group`}
          >
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${banner.textColor} mb-2`}>{banner.title}</h3>
              <p className={`text-sm ${banner.textColor} opacity-80 mb-1`}>{banner.subtitle}</p>
              <p className={`text-sm ${banner.textColor} opacity-80 mb-4`}>{banner.subtitle2}</p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Xem ngay
              </button>
            </div>
            <div className="ml-4">
              <img
                src={banner.image || "/placeholder.svg"}
                alt={banner.title}
                className="w-24 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
