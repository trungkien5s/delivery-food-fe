"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Search,
  ListOrdered,
  MessageCircleIcon,
  ShoppingCartIcon as CartIcon,
  LogOut,
  Settings,
  CircleUser,
  ChevronDown,
  X,
  Minus,
  Plus,
  Trash2,
  Menu,
  Store,
} from "lucide-react"

import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

import { useAppSelector } from "../../redux/hooks/useAppSelector"
import { useAppDispatch } from "../../redux/store/store"
import { logout, setAuthMode, setShowAuthModal } from "../../redux/store/slices/userSlice"

// Cart thunks
import { fetchCartItems, updateCartItem, removeFromCart, clearCart } from "../../redux/store/slices/cartSlice"

/* ========================= Helpers ========================= */
const formatCurrency = (v) => {
  const n = Number(v || 0)
  try {
    return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
  } catch {
    return `${n} đ`
  }
}

const getItemId = (it) => it?.id || it?._id
const getItemName = (it, idx) => it?.menuItem?.title || it?.menuItem?.name || it?.name || `Món #${idx + 1}`
const getItemImage = (it) =>
  it?.menuItem?.image || it?.menuItem?.thumbnail || it?.image || "https://placehold.co/64x64?text=🍽️"
const getUnitPrice = (it) =>
  Number(it?.basePrice ?? it?.menuItem?.basePrice ?? it?.menuItem?.basePrice ?? it?.basePrice ?? 0)

// Restaurant info helpers (exactly same as CheckOutPage)
// ===== Restaurant info helpers (robust, giống OrderPage) =====
const imgSrc = (img) => (typeof img === "string" ? img : img?.url || img?.secure_url || null)

const restaurantIdOf = (it) => {
  // Ưu tiên object populate: menuItem.menu.restaurant
  const r =
    (it?.menuItem?.menu?.restaurant && typeof it.menuItem.menu.restaurant === "object" && it.menuItem.menu.restaurant) ||
    (it?.menuItem?.restaurant && typeof it.menuItem.restaurant === "object" && it.menuItem.restaurant) ||
    (it?.menu?.restaurant && typeof it.menu.restaurant === "object" && it.menu.restaurant) ||
    null

  return (
    (r?._id || r?.id) ||
    // fallback nếu BE chỉ trả id string ở các path
    it?.menuItem?.restaurant ||
    it?.menu?.restaurant ||
    it?.restaurantId ||
    "unknown"
  )?.toString?.() || "unknown"
}

const restaurantNameOf = (it) => {
  const r =
    (it?.menuItem?.menu?.restaurant && typeof it.menuItem.menu.restaurant === "object" && it.menuItem.menu.restaurant) ||
    (it?.menuItem?.restaurant && typeof it.menuItem.restaurant === "object" && it.menuItem.restaurant) ||
    (it?.menu?.restaurant && typeof it.menu.restaurant === "object" && it.menu.restaurant) ||
    null

  return (
    r?.name ||
    r?.title ||
    it?.restaurantName ||
    it?.menuItem?.restaurantName ||
    it?.menu?.restaurantName ||
    "Nhà hàng"
  )
}

const restaurantInfoOf = (it) => {
  // LẤY OBJECT NHÀ HÀNG NẾU CÓ
  const r =
    (it?.menuItem?.menu?.restaurant && typeof it.menuItem.menu.restaurant === "object" && it.menuItem.menu.restaurant) ||
    (it?.menuItem?.restaurant && typeof it.menuItem.restaurant === "object" && it.menuItem.restaurant) ||
    (it?.menu?.restaurant && typeof it.menu.restaurant === "object" && it.menu.restaurant) ||
    null

  const id = restaurantIdOf(it)
  const name = restaurantNameOf(it)
  const image =
    (r && (r.image || r.logo || r.photos?.[0])) ||
    it?.restaurantImage ||
    null
  const address = (r && r.address) || it?.restaurantAddress || ""
  const isOpen = !!(r && r.isOpen)

  return { id, name, image, address, isOpen }
}


/* ========================= Component ========================= */
export default function MainHeader() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const apiBase = process.env.REACT_APP_API_BASE || ""

  const { isLoggedIn, user } = useAppSelector((s) => s.user)
  const { items, itemCount, totalAmount, loading: cartLoading, error: cartError } = useAppSelector((s) => s.cart)

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // --- chọn item ---
  const [selectedIds, setSelectedIds] = useState(new Set())
  const allSelected = (items || []).length > 0 && selectedIds.size === (items || []).length

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set((items || []).map((it) => getItemId(it))))
  }

  // Group items by restaurant (same as CheckOutPage)
  const groups = useMemo(() => {
    const map = new Map();
    (items || []).forEach((it, index) => {
      // Debug log để xem cấu trúc dữ liệu
      if (index === 0) {
        console.log('Sample cart item structure:', it);
        console.log('Restaurant info extracted:', restaurantInfoOf(it));
      }
      
      const info = restaurantInfoOf(it);
      if (!map.has(info.id)) {
        map.set(info.id, {
          id: info.id,
          name: info.name,
          image: info.image,
          address: info.address,
          isOpen: info.isOpen,
          items: [],
        });
      }
      map.get(info.id).items.push(it);
    });
    return Array.from(map.values());
  }, [items]);

  // Mở cart sẽ fetch nếu chưa có dữ liệu
  useEffect(() => {
    if (isCartOpen && isLoggedIn) {
      dispatch(fetchCartItems())
    }
  }, [isCartOpen, isLoggedIn, dispatch])

  // Reset chọn khi danh sách đổi: mặc định chọn tất cả
  useEffect(() => {
    setSelectedIds(new Set((items || []).map((it) => getItemId(it))))
  }, [items])

  // ESC để đóng
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsCartOpen(false)
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen || isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isCartOpen, isMobileMenuOpen])

  const handleLogin = () => {
    if (!isLoggedIn) {
      dispatch(setAuthMode("login"))
      dispatch(setShowAuthModal(true))
    }
  }

  // Xử lý khi click vào giỏ hàng
  const handleCartClick = () => {
    if (!isLoggedIn) {
      // Nếu chưa đăng nhập, hiển thị modal đăng nhập
      handleLogin()
    } else {
      // Nếu đã đăng nhập, mở giỏ hàng
      setIsCartOpen(true)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${apiBase}/auth/logout`)
    } catch {}
    dispatch(logout())
    alert("Đăng xuất thành công!")
  }

  const handleViewProfile = async () => {
    try {
      const res = await axios.get(`${apiBase}/accounts/me`)
      const d = res?.data?.data ?? res?.data ?? {}
      alert(`Tên: ${d.name || "—"}\nEmail: ${d.email || "—"}`)
    } catch (e) {
      alert("Không thể lấy thông tin cá nhân")
    }
  }

  const handleEditProfile = async () => {
    const newName = prompt("Nhập tên mới:")
    if (!newName) return
    try {
      await axios.put(`${apiBase}/accounts/me`, { name: newName })
      alert("Cập nhật thành công!")
    } catch {
      alert("Cập nhật thất bại")
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản?")) return
    try {
      await axios.delete(`${apiBase}/accounts/me`)
      dispatch(logout())
      alert("Đã xoá tài khoản!")
    } catch {
      alert("Không thể xóa tài khoản")
    }
  }

  const cartTotal = useMemo(() => {
    return (items || []).reduce((sum, it) => {
      const qty = Number(it?.quantity ?? 1)
      return sum + getUnitPrice(it) * qty
    }, 0)
  }, [items])

  const selectedTotal = useMemo(() => {
    return (items || []).reduce((sum, it) => {
      const id = getItemId(it)
      if (!selectedIds.has(id)) return sum
      const qty = Number(it?.quantity ?? 1)
      return sum + getUnitPrice(it) * qty
    }, 0)
  }, [items, selectedIds])

  return (
    <>
      {/* Top bar */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-1/2 lg:px-1">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Mở menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl overflow-hidden bg-gradient-to-br from-green-400 to-green-600 shadow-lg transform hover:scale-105 transition-transform duration-200 cursor-pointer">
                <img
                  src="/logos.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/48x48/22c55e/ffffff?text=🍽️"
                  }}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-bold text-gray-800 tracking-tight">FoodLive</h1>
                <p className="text-xs lg:text-sm text-gray-600">Chất lượng - Giao hàng nhanh</p>
              </div>
            </div>

            {/* Search - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div
                className={`relative w-full transition-all duration-300 ${isSearchFocused}`}
              >
                <input
                  type="text"
                  placeholder="Nhập tên nhà hàng hoặc món ăn..."
                  className="w-full px-4 py-3 pr-14 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white rounded-lg h-12 w-12 flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search - Mobile */}
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <Search className="w-5 h-5 text-gray-700" />
              </button>

              {isLoggedIn ? (
                <>
                  {/* Desktop Navigation */}
                  <div className="hidden lg:flex items-center gap-6">
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors duration-200 group"
                    >
                      <ListOrdered className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-sm font-medium">Đơn hàng</span>
                    </Link>

                    <button className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors duration-200 group">
                      <MessageCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-sm font-medium">Tin nhắn</span>
                    </button>
                  </div>

                  {/* Cart */}
                  <button
                    onClick={handleCartClick}
                    className="relative p-2 lg:p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <CartIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 group-hover:text-green-600 group-hover:scale-110 transition-all duration-200" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    )}
                  </button>

                  {/* Profile - Desktop */}
                  <div className="hidden lg:block relative group">
                    <div className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-green-600 py-2 px-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-medium text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span className="text-sm font-medium max-w-24 truncate">{user?.name}</span>
                      <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-200" />
                    </div>

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                      <div className="bg-white rounded-xl shadow-xl py-2 border border-gray-100 overflow-hidden">
                        <button
                          onClick={handleViewProfile}
                          className="w-full text-left flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-150"
                        >
                          <CircleUser className="w-4 h-4 mr-3 text-gray-500" /> Thông tin cá nhân
                        </button>
                        <button
                          onClick={handleEditProfile}
                          className="w-full text-left flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-150"
                        >
                          <Settings className="w-4 h-4 mr-3 text-gray-500" /> Chỉnh sửa hồ sơ
                        </button>
                        <div className="border-t my-1" />
                        <button
                          onClick={handleDeleteAccount}
                          className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          <Trash2 className="w-4 h-4 mr-3" /> Xoá tài khoản
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-150"
                        >
                          <LogOut className="w-4 h-4 mr-3 text-gray-500" /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Cart - Not logged in */}
                  <button
                    onClick={handleCartClick}
                    className="p-2 lg:p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                    title="Đăng nhập để xem giỏ hàng"
                  >
                    <CartIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 group-hover:text-green-600 group-hover:scale-110 transition-all duration-200" />
                  </button>

                  <button
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 lg:px-6 lg:py-2.5 rounded-xl font-medium text-sm  shadow-lg hover:shadow-xl"
                    onClick={handleLogin}
                  >
                    Đăng nhập
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300">
            {/* Mobile Menu Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-green-400 to-green-600 cursor-pointer">
                  <img
                    src="/logos.png"
                    alt="Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/40x40/22c55e/ffffff?text=🍽️"
                    }}
                  />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">FoodLive</h2>
                  <p className="text-xs text-gray-600">Menu</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="px-6 py-4 border-b">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn..."
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 text-white rounded-lg h-8 w-8 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Items */}
            <div className="px-6 py-4 space-y-2">
              {isLoggedIn ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-600">Thành viên</p>
                    </div>
                  </div>

                  <Link
                    to="/orders"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ListOrdered className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Đơn hàng của tôi</span>
                  </Link>

                  <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <MessageCircleIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Tin nhắn</span>
                  </button>

                  <button
                    onClick={handleViewProfile}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <CircleUser className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Thông tin cá nhân</span>
                  </button>

                  <button
                    onClick={handleEditProfile}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Chỉnh sửa hồ sơ</span>
                  </button>

                  <div className="border-t my-4" />

                  <button
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="font-medium">Xoá tài khoản</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Đăng xuất</span>
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {/* <button
                    onClick={() => {
                      handleLogin()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Đăng nhập
                  </button> */}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Cart Drawer - Enhanced with restaurant grouping */}
      {isCartOpen && isLoggedIn && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
            {/* Header */}
            <div className="px-4 lg:px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CartIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Giỏ hàng</h3>
                  <p className="text-sm text-gray-600">{groups.length} nhà hàng • {items?.length || 0} món</p>
                  {cartLoading && <span className="text-sm text-green-600 animate-pulse">Đang tải...</span>}
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors duration-200"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select all */}
            {(items?.length ?? 0) > 0 && (
              <div className="px-4 lg:px-6 py-3 border-b flex items-center justify-between bg-gray-50">
                <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 transition-colors duration-200"
                  />
                  Chọn tất cả
                </label>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  {selectedIds.size}/{items?.length || 0} món
                </span>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-auto">
              {cartError && (
                <div className="m-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 animate-pulse">
                  {cartError}
                </div>
              )}

              {!cartLoading && (!items || items.length === 0) && !cartError && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <CartIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Giỏ hàng trống</p>
                  <p className="text-sm text-gray-400 mt-1">Hãy thêm món ăn yêu thích!</p>
                </div>
              )}

              {/* Grouped by restaurant */}
              {groups.map((group, groupIndex) => (
                <div key={group.id} className="border-b border-gray-100 last:border-b-0">
                                   {/* Restaurant header */}
<div className="px-4 lg:px-6 py-3 bg-gray-50/50 flex items-center gap-3 sticky top-0 z-10">
  {group.image ? (
    <img
      src={imgSrc(group.image) || "https://placehold.co/32x32?text=🏪"}
      alt={group.name}
      className="w-8 h-8 rounded-lg object-cover border border-gray-200"
      onError={(e) => (e.currentTarget.src = "https://placehold.co/32x32?text=🏪")}
    />
  ) : (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
      <Store className="w-4 h-4 text-white" />
    </div>
  )}
  <div className="flex-1 min-w-0">
    <h4 className="font-medium text-gray-800 text-sm truncate">{group.name}</h4>
    <p className="text-xs text-gray-500">{group.items.length} món</p>
  </div>
  {group.isOpen && (
    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
      Mở cửa
    </span>
  )}
</div>


                  {/* Items in this restaurant */}
                  {group.items.map((it, idx) => {
                    const id = getItemId(it)
                    const name = getItemName(it, idx)
                    const qty = Number(it?.quantity ?? 1)
                    const unit = getUnitPrice(it)
                    const image = getItemImage(it)
                    const lineTotal = unit * qty
                    const options = Array.isArray(it?.selectedOptions) ? it.selectedOptions : []

                    return (
                      <div
                        key={id || idx}
                        className="p-4 lg:px-6 flex gap-3 hover:bg-gray-50/50 transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          className="mt-3 shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 transition-colors duration-200"
                          checked={selectedIds.has(id)}
                          onChange={() => toggleSelect(id)}
                        />

                        <img
                          src={image || "/placeholder.svg"}
                          alt={name}
                          className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/64x64/f3f4f6/9ca3af?text=🍽️"
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                              <h5 className="font-medium text-gray-800 text-sm truncate leading-5">{name}</h5>
                              
                              {options.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  Tuỳ chọn: {options.map((op) => op?.name ?? op?.label ?? op).join(", ")}
                                </p>
                              )}
                            </div>

                            {/* Price */}
                            <div className="text-right shrink-0 ml-2">
                              <p className="font-semibold text-green-600 text-sm">{formatCurrency(lineTotal)}</p>
                              {unit > 0 && (
                                <p className="text-xs text-gray-400">{formatCurrency(unit)}/món</p>
                              )}
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between">
                            {/* Quantity stepper */}
                            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white shadow-sm">
                              <button
                                className="p-1.5 hover:bg-gray-50 transition-colors duration-200 rounded-l-lg"
                                onClick={() => dispatch(updateCartItem({ itemId: id, quantity: qty - 1 }))}
                                disabled={cartLoading || qty <= 1}
                                aria-label="Giảm"
                              >
                                <Minus className="w-3 h-3 text-gray-600" />
                              </button>
                              <span className="px-3 py-1.5 text-sm font-medium min-w-[2.5rem] text-center">{qty}</span>
                              <button
                                className="p-1.5 hover:bg-gray-50 transition-colors duration-200 rounded-r-lg"
                                onClick={() => dispatch(updateCartItem({ itemId: id, quantity: qty + 1 }))}
                                disabled={cartLoading}
                                aria-label="Tăng"
                              >
                                <Plus className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              className="inline-flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-all duration-200"
                              onClick={() => dispatch(removeFromCart(id))}
                              disabled={cartLoading}
                              aria-label="Xoá khỏi giỏ"
                            >
                              <Trash2 className="w-3 h-3" /> Xoá
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t bg-white p-4 lg:p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tổng tất cả</span>
                  <span className="font-semibold">{formatCurrency(totalAmount ?? cartTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-medium">Tổng đã chọn</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(selectedTotal)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <button
                  onClick={() => dispatch(clearCart())}
                  className="text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg inline-flex items-center gap-2 transition-all duration-200 hover:scale-105"
                  disabled={cartLoading || !items?.length}
                >
                  <Trash2 className="w-4 h-4" /> Xoá hết
                </button>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Đã chọn {selectedIds.size} món
                </span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false)
                  navigate("/checkout", { state: { selectedItemIds: Array.from(selectedIds) } })
                }}
                className="w-full py-3 lg:py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={selectedIds.size === 0}
              >
                Đặt hàng ({selectedIds.size} món) • {formatCurrency(selectedTotal)}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}