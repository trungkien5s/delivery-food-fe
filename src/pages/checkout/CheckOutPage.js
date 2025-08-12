"use client"

import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAppSelector } from "../../redux/hooks/useAppSelector"
import { useAppDispatch } from "../../redux/store/store"
import { fetchCartItems } from "../../redux/store/slices/cartSlice"
import { createOrderFromRestaurant } from "../../redux/store/slices/ordersSlice"
import {
  RefreshCw,
  MapPin,
  Phone,
  User,
  CreditCard,
  Notebook,
  CheckCircle2,
  ArrowLeft,
  Store,
} from "lucide-react"
import Layout from "../../components/layout/Layout"
import { AddressPicker } from "./AddressPicker"

/* ---------- Helpers ---------- */
const fmt = (v) => Number(v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
const getId = (it) => it?.id || it?._id

// Giá 1 món: ưu tiên basePrice -> price -> price_cents/100
const unitPrice = (it) => {
  const base =
    it?.basePrice ??
    it?.menuItem?.basePrice ??
    it?.menuItem?.price ??
    it?.price
  if (base != null && !Number.isNaN(Number(base))) return Number(base)
  const cents = it?.menuItem?.price_cents ?? it?.price_cents
  return cents != null && !Number.isNaN(Number(cents)) ? Number(cents) / 100 : 0
}

const nameOf = (it, i) => it?.menuItem?.title || it?.menuItem?.name || it?.name || `Món #${i + 1}`
const imgOf = (it) =>
  it?.menuItem?.image || it?.image || "https://placehold.co/64x64?text=🍽️"

// ===== Restaurant info helpers (giống OrderPage) =====
const imgSrc = (img) => (typeof img === "string" ? img : img?.url || img?.secure_url || null)

const restaurantIdOf = (it) => {
  const r =
    (it?.menuItem?.menu?.restaurant && typeof it.menuItem.menu.restaurant === "object" && it.menuItem.menu.restaurant) ||
    (it?.menuItem?.restaurant && typeof it.menuItem.restaurant === "object" && it.menuItem.restaurant) ||
    (it?.menu?.restaurant && typeof it.menu.restaurant === "object" && it.menu.restaurant) ||
    null

  return (
    (r?._id || r?.id) ||
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
  const r =
    (it?.menuItem?.menu?.restaurant && typeof it.menuItem.menu.restaurant === "object" && it.menuItem.menu.restaurant) ||
    (it?.menuItem?.restaurant && typeof it.menuItem.restaurant === "object" && it.menuItem.restaurant) ||
    (it?.menu?.restaurant && typeof it.menu.restaurant === "object" && it.menu.restaurant) ||
    null

  const id = restaurantIdOf(it)
  const name = restaurantNameOf(it)
  const image = (r && (r.image || r.logo || r.photos?.[0])) || it?.restaurantImage || null
  const address = (r && r.address) || it?.restaurantAddress || ""
  const isOpen = !!(r && r.isOpen)

  return { id, name, image, address, isOpen }
}

export default function CheckOutPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { state } = useLocation()
  const selectedIdsFromNav = Array.isArray(state?.selectedItemIds) ? new Set(state.selectedItemIds) : null

  const { items, loading: cartLoading } = useAppSelector((s) => s.cart)
  const { createOrderLoading } = useAppSelector((s) => s.orders || {})

  // Lấy giỏ nếu chưa có
  useEffect(() => {
    if (!items || items.length === 0) dispatch(fetchCartItems())
  }, [dispatch])

  // Items sẽ checkout = đã chọn (nếu có), else toàn bộ
  const checkoutItems = useMemo(() => {
    const source = Array.isArray(items) ? items : []
    if (selectedIdsFromNav && selectedIdsFromNav.size > 0) {
      return source.filter((it) => selectedIdsFromNav.has(getId(it)))
    }
    return source
  }, [items, selectedIdsFromNav])

  // Gom theo restaurant
  const groups = useMemo(() => {
    const map = new Map()
    ;(checkoutItems || []).forEach((it) => {
      const info = restaurantInfoOf(it)
      if (!map.has(info.id)) {
        map.set(info.id, {
          id: info.id,
          name: info.name,
          image: info.image,
          address: info.address,
          isOpen: info.isOpen,
          items: [],
        })
      }
      map.get(info.id).items.push(it)
    })
    return Array.from(map.values())
  }, [checkoutItems])

  // Thông tin nhận hàng chung
  const [shipping, setShipping] = useState({ fullName: "", phone: "", address: "" })
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [notes, setNotes] = useState({})
  const [placing, setPlacing] = useState({})

  const totalAll = useMemo(
    () => checkoutItems.reduce((s, it) => s + unitPrice(it) * Number(it?.quantity ?? 1), 0),
    [checkoutItems],
  )

  const validate = () => {
    if (!shipping.fullName?.trim()) return "Vui lòng nhập Họ tên người nhận"
    if (!shipping.phone?.trim()) return "Vui lòng nhập Số điện thoại"
    if (!shipping.address?.trim()) return "Vui lòng nhập Địa chỉ giao hàng"
    return null
  }

  const placeOne = async (rid) => {
    const err = validate()
    if (err) return alert(err)

const orderData = {
  receiverName: shipping.fullName,
  receiverPhone: shipping.phone,
  shippingAddress: shipping.address,
  location: shipping.lat && shipping.lng ? { lat: shipping.lat, lng: shipping.lng } : undefined,
  paymentMethod,
  note: notes[rid] || "",
}


    try {
      setPlacing((p) => ({ ...p, [rid]: true }))
      await dispatch(createOrderFromRestaurant({ restaurantId: rid, orderData })).unwrap()
      navigate("/orders")
    } catch (e) {
      alert(String(e))
    } finally {
      setPlacing((p) => ({ ...p, [rid]: false }))
    }
  }

  const placeAll = async () => {
    const err = validate()
    if (err) return alert(err)
    if (groups.length === 0) return

    try {
      for (const g of groups) {
        const orderData = {
          receiverName: shipping.fullName,
          receiverPhone: shipping.phone,
          shippingAddress: shipping.address,
          paymentMethod,
          note: notes[g.id] || "",
        }
        setPlacing((p) => ({ ...p, [g.id]: true }))
        await dispatch(createOrderFromRestaurant({ restaurantId: g.id, orderData })).unwrap()
      }
      navigate("/orders")
    } catch (e) {
      alert(String(e))
    } finally {
      setPlacing({})
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Thanh toán</h1>
                <p className="text-gray-600 text-sm mt-1">
                  {groups.length} nhà hàng • {checkoutItems.length} món
                </p>
              </div>
            </div>
            <button
              onClick={() => dispatch(fetchCartItems())}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              disabled={cartLoading}
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-600 group-hover:text-green-600 transition-colors ${cartLoading ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Làm mới</span>
            </button>
          </div>

          {/* Form nhận hàng */}
          <section className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Thông tin nhận hàng</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Họ tên người nhận
                </label>
                <input
                  className="w-full rounded-xl px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent hover:border-green-300"
                  value={shipping.fullName}
                  onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  Số điện thoại
                </label>
                <input
                  className="w-full rounded-xl px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent hover:border-green-300"
                  value={shipping.phone}
                  onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Địa chỉ giao hàng
                </label>
                <AddressPicker
  value={shipping.address}
  onChange={({ address, location }) =>
    setShipping((s) => ({
      ...s,
      address,
      lat: location?.lat ?? s.lat,
      lng: location?.lng ?? s.lng,
    }))
  }
/>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  Phương thức thanh toán
                </label>
                <div className="flex gap-3 mt-2">
                  {[
                    { value: "COD", label: "Thanh toán khi nhận hàng (COD)" },
                    { value: "SHOPEEPAY", label: "Thanh toán qua ShopeePay" },
                    { value: "VNPAY", label: "Thanh toán qua VNPay" },
                  ].map((opt) => {
                    const active = paymentMethod === opt.value
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border 
                          ${active ? "border-green-500 bg-green-50 ring-1 ring-green-200" : "border-gray-200 hover:border-green-300 hover:bg-green-50"}`}
                      >
                        <input
                          type="radio"
                          name="pm"
                          value={opt.value}
                          checked={active}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Danh sách theo nhà hàng */}
          {groups.map((g, index) => {
            const sub = g.items.reduce((s, it) => s + unitPrice(it) * Number(it?.quantity ?? 1), 0)
            return (
              <section
                key={g.id}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    {g.image ? (
                      <img
                        src={imgSrc(g.image) || "https://placehold.co/96x96?text=🏪"}
                        alt={g.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                        onError={(e) => (e.currentTarget.src = "https://placehold.co/96x96?text=🏪")}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{g.name}</h3>
                      <p className="text-sm text-gray-600">{g.items.length} món</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">Tạm tính</div>
                    <div className="text-xl font-bold text-green-600">{fmt(sub)}</div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {g.items.map((it, idx) => {
                    const qty = Number(it?.quantity ?? 1)
                    const u = unitPrice(it)
                    const line = u * qty
                    return (
                      <div
                        key={getId(it) || idx}
                        className="flex gap-4 items-center p-3 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                      >
                        <img
                          src={imgOf(it) || "/placeholder.svg"}
                          alt={nameOf(it, idx)}
                          className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/64x64?text=🍽️")}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{nameOf(it, idx)}</p>
                          <p className="text-sm text-gray-600">
                            SL: {qty} × {fmt(u)}
                          </p>
                        </div>
                        <div className="text-right font-semibold text-gray-800">{fmt(line)}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Ghi chú riêng cho nhà hàng này */}
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Notebook className="w-4 h-4 text-green-600" />
                    Ghi chú cho {g.name}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent hover:border-green-300 transition-all duration-200 resize-none"
                    value={notes[g.id] || ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [g.id]: e.target.value }))}
                    placeholder="VD: Ít cay, giao giờ nghỉ trưa..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => placeOne(g.id)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                    disabled={createOrderLoading || !!placing[g.id]}
                  >
                    {placing[g.id] ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Đặt đơn nhà hàng này
                  </button>
                </div>
              </section>
            )
          })}

          {/* Tổng cộng & Đặt tất cả (tuỳ bạn mở lại) */}
          {/* ... */}
        </div>
      </div>
    </Layout>
  )
}
