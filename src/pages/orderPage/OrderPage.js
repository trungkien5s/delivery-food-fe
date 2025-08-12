"use client"

import { useEffect, useState } from "react"

import { useAppDispatch } from "../../redux/store/store"
import { useAppSelector } from "../../redux/hooks/useAppSelector"
import { fetchMyOrders } from "../../redux/store/slices/ordersSlice"
import {
  RefreshCw,
  Store,
  Clock,
  MapPin,
  Phone,
  User,
  ChevronDown,
  Star,
  MoreHorizontal,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Layout from "../../components/layout/Layout"
import axios from "axios"

const imgSrc = (img) => (typeof img === "string" ? img : img?.url || img?.secure_url || null);
const fmt = (v) => Number(v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
const ftime = (s) => (s ? new Date(s).toLocaleString("vi-VN") : "—")

// Enhanced Delivery Map Component
const DeliveryMap = ({ orderId, isVisible, onClose }) => {
  const [shipperLocation, setShipperLocation] = useState({
    lat: 10.7769,
    lng: 106.7009,
    address: "Đang di chuyển...",
  })

  useEffect(() => {
    if (!isVisible) return

    const locations = [
      { lat: 10.7769, lng: 106.7009, address: "Đang lấy hàng tại nhà hàng" },
      { lat: 10.778, lng: 106.702, address: "Đã lấy hàng, đang di chuyển" },
      { lat: 10.779, lng: 106.703, address: "Đang trên đường giao hàng" },
      { lat: 10.7751, lng: 106.7074, address: "Sắp đến địa chỉ giao hàng" },
    ]

    let locationIndex = 0
    const interval = setInterval(() => {
      if (locationIndex < locations.length - 1) {
        locationIndex++
        setShipperLocation(locations[locationIndex])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end animate-in fade-in duration-300">
      <div className="bg-white w-full h-2/3 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800">Theo dõi đơn hàng</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
          >
            <XCircle className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Enhanced Map with Gradient Background */}
        <div className="w-full h-64 bg-gradient-to-br from-green-100 via-blue-50 to-orange-100 relative overflow-hidden">
          {/* Animated Route Line */}
          <div className="absolute top-1/2 left-1/4 w-1/2 h-1 bg-gradient-to-r from-green-400 via-blue-400 to-orange-400 transform -translate-y-1/2 rounded-full">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse opacity-60"></div>
          </div>

          {/* Restaurant Pin */}
          <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                Nhà hàng
              </div>
            </div>
          </div>

          {/* Animated Shipper Pin */}
          <div
            className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out"
            style={{ left: `${25 + (shipperLocation.lat - 10.7769) * 10000}%` }}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-3 border-white shadow-lg animate-bounce">
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                  <Truck className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                Shipper
              </div>
            </div>
          </div>

          {/* Destination Pin */}
          <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                Điểm giao
              </div>
            </div>
          </div>

          {/* Status Overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-gray-800">{shipperLocation.address}</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">Cập nhật: {new Date().toLocaleTimeString("vi-VN")}</div>
          </div>
        </div>

        {/* Enhanced Shipper Info */}
        <div className="p-6">
          <div className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-blue-50 p-4 rounded-xl border border-orange-200/50">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">Nguyễn Văn A</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Shipper</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span>4.8</span>
                </div>
                <span>•</span>
                <span>09xx xxx xxx</span>
              </div>
            </div>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
              <Phone className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
            </button>
          </div>

          {/* Enhanced Delivery Steps */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-gray-800">Đã lấy hàng</span>
                <div className="text-sm text-gray-500">14:30</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-blue-600">Đang giao hàng</span>
                <div className="text-sm text-blue-500">Hiện tại</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <span className="text-gray-500">Giao hàng thành công</span>
                <div className="text-sm text-gray-400">Dự kiến 15:15</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: { bg: "bg-orange-100", text: "text-orange-800", label: "Chờ xác nhận", icon: Clock },
    CONFIRMED: { bg: "bg-blue-100", text: "text-blue-800", label: "Đã xác nhận", icon: CheckCircle },
    DELIVERING: { bg: "bg-green-100", text: "text-green-800", label: "Đang giao", icon: Truck },
    COMPLETED: { bg: "bg-gray-100", text: "text-gray-800", label: "Hoàn thành", icon: CheckCircle },
    CANCELED: { bg: "bg-red-100", text: "text-red-800", label: "Đã hủy", icon: XCircle },
  }

  const config = statusConfig[status] || statusConfig.PENDING
  const IconComponent = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${config.bg} ${config.text}`}
    >
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  )
}
const OrderCard = ({ order, index }) => {
  const [showMap, setShowMap] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // state chi tiết món (JS thuần, KHÔNG dùng generics)
  const [items, setItems] = useState(null);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState(null);

  const canTrack = order?.status === "DELIVERING";

  // fetch chi tiết món theo orderId
  useEffect(() => {
    const id = order?._id || order?.id;
    if (!id) return;

    let ignore = false;
    const fetchItems = async () => {
      try {
        setItemsLoading(true);
        setItemsError(null);
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/order-details/order/${id}`);
        const data = res?.data?.data ?? res?.data ?? [];
        if (!ignore) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setItemsError(e?.response?.data?.message || "Không thể tải chi tiết đơn hàng");
      } finally {
        if (!ignore) setItemsLoading(false);
      }
    };

    fetchItems();
    return () => {
      ignore = true;
    };
  }, [order?._id, order?.id]);

  // Tạm tính từ chi tiết
  const computedSubtotal =
    items && items.length > 0
      ? items.reduce((s, it) => s + Number(it?.price || 0), 0)
      : undefined;

  return (
    <>
      <div
        className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-lg overflow-hidden bg-gray-100">
                {order?.restaurant?.image ? (
                  <img
                    src={imgSrc(order.restaurant.image) || "https://placehold.co/96x96?text=🏪"}
                    alt={order?.restaurant?.name || "Restaurant"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://placehold.co/96x96?text=🏪";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Không có ảnh
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{order?.restaurant?.name || "Nhà hàng"}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>{ftime(order?.orderTime)}</span>
                  <span>•</span>
                  <span>#{(order?._id || order?.id || "").toString().slice(-6)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <StatusBadge status={order?.status} />
              <p className="text-xl font-bold text-green-600 mt-2">{fmt(order?.totalPrice)}</p>
            </div>
          </div>
        </div>

        {/* Tracking */}
        {canTrack && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Shipper đang trên đường</p>
                  <p className="text-sm text-green-700">Dự kiến: {ftime(order?.deliveryTime)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMap(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Xem bản đồ
              </button>
            </div>
          </div>
        )}

        {/* Items từ API */}
        <div className="p-6">
          {itemsLoading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-200 rounded-full" />
                    <span className="h-4 w-40 bg-gray-200 rounded" />
                  </div>
                  <span className="h-4 w-20 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          )}

          {itemsError && (
            <div className="p-3 mb-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {itemsError}
            </div>
          )}

          <div className="space-y-3">
            {(items && items.length > 0 ? items.slice(0, expanded ? undefined : 2) : []).map((item, idx) => {
              const qty = Number(item?.quantity || 1);
              const menu = item?.menuItem || {};
              const title = menu?.title || `Món ${idx + 1}`;
              const image = imgSrc(menu?.image) || "https://placehold.co/64x64?text=🍽️";
              const linePrice = Number(item?.price || 0); // API đã trả tổng dòng

              return (
                <div key={item?._id || idx} className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={image}
                      alt={title}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                      onError={(e) => (e.currentTarget.src = "https://placehold.co/40x40?text=🍽️")}
                    />
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">{title}</span>
                      <span className="text-xs text-gray-500">SL: {qty}</span>
                    </div>
                  </div>
                  <span className="text-gray-600 font-semibold">{fmt(linePrice)}</span>
                </div>
              );
            })}

            {(!items || items.length === 0) && !itemsLoading && !itemsError && (
              <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl">
                <span className="text-gray-500">Chi tiết món ăn</span>
                <span className="text-gray-400">—</span>
              </div>
            )}

            {items && items.length > 2 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-green-600 text-sm font-medium hover:text-green-700 transition-colors duration-200"
              >
                {expanded ? "Thu gọn" : `Xem thêm ${items.length - 2} món`}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>

          {/* Tóm tắt */}
          <div className="border-t border-gray-100 mt-6 pt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính</span>
              <span className="font-medium">
                {fmt(computedSubtotal ?? order?.subtotal ?? (order?.totalPrice ? order.totalPrice * 0.9 : 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phí giao hàng</span>
              <span className="font-medium">
                {fmt(
                  order?.deliveryFee ??
                    (order?.totalPrice && computedSubtotal != null
                      ? Math.max(0, order.totalPrice - computedSubtotal)
                      : order?.totalPrice
                      ? order.totalPrice * 0.1
                      : 0),
                )}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-gray-100 pt-3">
              <span>Tổng cộng</span>
              <span className="text-green-600">{fmt(order?.totalPrice)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200">
              Đặt lại
            </button>
            {order?.status === "COMPLETED" && (
              <button className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 active:scale-95">
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-4 h-4" />
                  Đánh giá
                </div>
              </button>
            )}
            <button className="p-3 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <DeliveryMap orderId={order?._id || order?.id} isVisible={showMap} onClose={() => setShowMap(false)} />
    </>
  );
};



const EmptyState = () => (
  <div className="text-center py-20">
    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <Store className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">Chưa có đơn hàng</h3>
    <p className="text-gray-600 mb-8 max-w-sm mx-auto">
      Bạn chưa có đơn hàng nào. Hãy khám phá các món ăn ngon và đặt hàng ngay!
    </p>
    <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 active:scale-95">
      Đặt món ngay
    </button>
  </div>
)

export default function OrderPage() {
  const dispatch = useAppDispatch()
  const { myOrders, loading, error } = useAppSelector((s) => s.orders)

  useEffect(() => {
    dispatch(fetchMyOrders())
  }, [dispatch])

  return (
    <Layout>
      <div className="min-h-screen  via-white to-orange-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gray-800 bg-clip-text text-transparent">
                Đơn hàng của tôi
              </h1>
              <p className="text-gray-600 mt-2">Theo dõi và quản lý các đơn hàng của bạn</p>
            </div>
            <button
              onClick={() => dispatch(fetchMyOrders())}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              disabled={loading}
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors ${loading ? "animate-spin" : ""}`}
              />
              <span className="font-medium text-gray-700 group-hover:text-green-700">Làm mới</span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 font-medium">{String(error)}</p>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 animate-pulse"
                >
                  <div className="flex gap-4 mb-6">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !myOrders?.length ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              {myOrders.map((order, index) => (
                <OrderCard key={order?._id || order?.id} order={order} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
