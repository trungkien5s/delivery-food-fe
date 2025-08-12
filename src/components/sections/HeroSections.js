import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const bannerImages = [
    {
      src: "/KFC.jpg",
      alt: "KFC Chicken",
      title: "Gà Rán KFC",
      discount: "Giảm 30%",
    },
    {
      src: "/lotte.jpg",
      alt: "Lotte",
      title: "Lotte Gà Rán",
      discount: "Giảm 25%",
    },
    {
      src: "/pizza.jpeg",
      alt: "Pizza",
      title: "Pizza Đặc Biệt",
      discount: "Giảm 40%",
    },
    {
      src: "/bami.jpg",
      alt: "Bánh mì",
      title: "Bánh Mì Bami Sot",
      discount: "Giảm 20%",
    },
    {
      src: "/Phojpg.jpg",
      alt: "Phở",
      title: "Phở Thìn Hà Nội",
      discount: "Giảm 35%",
    },
  ]

  // Auto scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [bannerImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length)
  }

  return (
    <div className="relative bg-gradient-to-br from-green-50 via-green-100 to-emerald-200 rounded-3xl max-w-7xl mx-auto overflow-hidden shadow-2xl">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-300 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-emerald-300 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-lime-300 rounded-full blur-lg"></div>
      </div>

      {/* Full width image carousel */}
      <div className="relative w-full h-[500px] overflow-hidden cursor-pointer">
        {bannerImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? "opacity-100 transform translate-x-0"
                : index < currentSlide
                  ? "opacity-0 transform -translate-x-full"
                  : "opacity-0 transform translate-x-full"
            }`}
          >
            <div className="relative w-full h-full">
              <img
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target;
                  target.src = `https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=500&fit=crop&crop=center`
                }}
              />

              {/* Overlay with food info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-2 inline-block">
                    {image.discount}
                  </div>
                  <h3 className="text-2xl font-bold">{image.title}</h3>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
        >
         <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>

        {/* Floating elements */}
        <div className="absolute -top-4 -right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm animate-bounce z-10">
          HOT 🔥
        </div>
      </div>

      {/* Bottom scrolling banner */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-lg font-semibold mx-8">🍕 PIZZA GIẢM 30% - ĐẶT NGAY!</span>
          <span className="text-lg font-semibold mx-8">🍔 BURGER COMBO CHỈ 99K!</span>
          <span className="text-lg font-semibold mx-8">🍜 PHỞ BÒ ĐẶC BIỆT GIẢM 25%!</span>
          <span className="text-lg font-semibold mx-8">🥤 MIỄN PHÍ GIAO HÀNG CHO ĐH TRÊN 200K!</span>
          <span className="text-lg font-semibold mx-8">🎉 TẢI APP NHẬN VOUCHER 50K!</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translate3d(100%, 0, 0);
          }
          100% {
            transform: translate3d(-100%, 0, 0);
          }
        }

        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  )
}
