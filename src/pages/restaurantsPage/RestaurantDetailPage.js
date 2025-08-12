import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import axios from "axios";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Share2, Star, MapPin, Phone, Mail, Clock, Navigation, Store, ShoppingCart
} from "lucide-react";

import { useAppDispatch } from "../../redux/store/store";
import { addToCartOptimistic } from "../../redux/store/slices/cartSlice";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { setAuthMode, setShowAuthModal } from "../../redux/store/slices/userSlice";

/* helper an toàn như ở trang Menu */
const get = (obj, path, fallback = undefined) => {
  try {
    const val = path.split(".").reduce((a, c) => (a == null ? a : a[c]), obj);
    return val == null ? fallback : val;
  } catch {
    return fallback;
  }
};

export default function RestaurantDetailPage() {
  // Hỗ trợ cả 2 kiểu params
  const params = useParams();
  const restaurantId = params.restaurantId || params.id;
  const focusMenuItemId = params.menuItemId || null;

  const location = useLocation();
  const preloadedItem = location.state?.menuItem || null;

  const [data, setData] = useState(null);
  const [items, setItems] = useState(preloadedItem ? [preloadedItem] : []);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [itemsErr, setItemsErr] = useState(null);

  const base = process.env.REACT_APP_API_BASE || "";

  // 1) Restaurant detail
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await axios.get(`${base}/restaurants/${restaurantId}`);
        const raw = res.data?.data ?? res.data;
        if (mounted) setData(raw);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e.message || "Không tải được nhà hàng");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [restaurantId]);

  // 2) Menu items of this restaurant (thử 3 cách)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setItemsLoading(true);
        setItemsErr(null);

        // Nếu đã có preload thì vẫn fetch để đồng bộ đầy đủ list
        let list = [];

        // C1: /restaurants/:id/menu-items
        try {
          const res1 = await axios.get(`${base}/restaurants/${restaurantId}/menu-items`);
          const raw1 = res1.data?.data ?? res1.data;
          if (Array.isArray(raw1) && raw1.length) list = raw1;
        } catch { /* bỏ qua, thử cách 2 */ }

        // C2: /menu-items?restaurant=:id
        if (list.length === 0) {
          try {
            const res2 = await axios.get(`${base}/menu-items`, { params: { restaurant: restaurantId } });
            const raw2 = res2.data?.data ?? res2.data ?? [];
            if (Array.isArray(raw2) && raw2.length) list = raw2;
          } catch { /* bỏ qua, thử cách 3 */ }
        }

        // C3: fallback lấy all rồi filter
        if (list.length === 0) {
          const res3 = await axios.get(`${base}/menu-items`);
          const raw3 = res3.data?.data ?? res3.data ?? [];
          list = (Array.isArray(raw3) ? raw3 : []).filter(
            (m) => (get(m, "restaurant._id") || get(m, "restaurant")) === restaurantId
          );
        }

        // gộp preload nếu chưa có trong list
        if (preloadedItem) {
          const has = list.some((x) => (x._id || x.id) === (preloadedItem._id || preloadedItem.id));
          if (!has) list = [preloadedItem, ...list];
        }

        if (mounted) setItems(list);
      } catch (e) {
        if (mounted) setItemsErr(e?.response?.data?.message || e.message || "Không tải được thực đơn");
      } finally {
        if (mounted) setItemsLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  return (
    <Layout>
      {loading ? <SkeletonDetail /> : err ? (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">{err}</div>
          <div className="mt-4">
            <Link to="/restaurants" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800">
              <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
            </Link>
          </div>
        </div>
      ) : data ? (
        <DetailContent
          data={data}
          items={items}
          itemsLoading={itemsLoading}
          itemsErr={itemsErr}
          restaurantId={restaurantId}
          focusMenuItemId={focusMenuItemId}
        />
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-6">
          Không tìm thấy nhà hàng.
        </div>
      )}
    </Layout>
  );
}

/* ======================= Subcomponents ======================= */

function DetailContent({ data, items, itemsLoading, itemsErr, restaurantId, focusMenuItemId }) {
  const item = useMemo(() => normalizeRestaurant(data), [data]);
  const location = useLocation();
  const shareUrl = typeof window !== "undefined"
    ? window.location.origin + location.pathname
    : "";

  const openMaps = () => {
    const q = encodeURIComponent(item.address || item.name);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  };
  const callNow = () => { if (item.phone) window.location.href = `tel:${item.phone}`; };
  const mailNow = () => { if (item.email) window.location.href = `mailto:${item.email}`; };
  const copyShare = async () => {
    try { await navigator.clipboard.writeText(shareUrl); alert("Đã sao chép liên kết!"); } catch {}
  };

  // Chuẩn hoá menu items
  const normalizedItems = useMemo(() => {
    return (Array.isArray(items) ? items : []).map((m) => {
      const basePrice = get(m, "basePrice");
      const priceCents = get(m, "price_cents");
      let price = Number(get(m, "price", null));
      if (basePrice != null) price = Number(basePrice);
      else if ((price == null || Number.isNaN(price)) && priceCents != null) price = Number(priceCents) / 100;

      return {
        id: get(m, "_id") ?? get(m, "id"),
        name: get(m, "title") ?? get(m, "name", "Món ăn"),
        description: get(m, "description", ""),
        image: get(m, "image") ?? get(m, "imageUrl") ?? get(m, "photo") ?? get(m, "photos.0"),
        price: Number(price ?? 0),
        rating: Number(get(m, "rating") ?? get(m, "avgRating") ?? 0),
        isAvailable: Boolean(get(m, "isAvailable") ?? true),
        restaurantId: get(m, "restaurant._id") ?? get(m, "restaurant"),
        raw: m,
      };
    }).filter((x) => x.restaurantId === (data?._id || data?.id));
  }, [items, data]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cover */}
      <div className="relative h-56 sm:h-72 md:h-80 bg-gray-100">
        {item.image ? (
          <img src={item.image} alt={`Ảnh ${item.name}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">Không có ảnh</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium mb-2
              text-white bg-black/40 backdrop-blur">
              <Store className="w-4 h-4" />
              {item.isOpen ? "Đang mở" : "Đóng cửa"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">{item.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-white/90">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm">
                {item.rating > 0 ? `${item.rating.toFixed(1)} / 5` : "Chưa có đánh giá"}
              </span>
            </div>
          </div>
          <button
            onClick={copyShare}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 hover:bg-white text-gray-800 text-sm font-medium shadow"
            title="Sao chép liên kết"
          >
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </button>
        </div>
      </div>

      {/* Breadcrumb + Back */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-700">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link to="/restaurants" className="hover:text-gray-700">Nhà hàng</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{item.name}</span>
        </nav>
        <Link to="/restaurants" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 mt-2">
          <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 py-6">
        {/* Left: About + Menu items */}
        <div className="lg:col-span-2">
          {/* About */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Giới thiệu</h2>
            <p className="text-gray-700 leading-relaxed">
              {item.description || "Nhà hàng hiện chưa có mô tả chi tiết."}
            </p>
          </section>

          {/* Menu items */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Thực đơn tại {item.name}</h2>
              {itemsLoading && <span className="text-sm text-gray-500">Đang tải món…</span>}
            </div>
            {itemsErr ? (
              <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{itemsErr}</div>
            ) : normalizedItems.length === 0 ? (
              <div className="text-sm text-gray-500">Chưa có món nào.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {normalizedItems.map((m) => (
                  <MenuItemCard
                    key={m.id}
                    m={m}
                    restaurantId={restaurantId}
                    highlight={focusMenuItemId && String(focusMenuItemId) === String(m.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: Contact / Info card */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-4">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Thông tin liên hệ</h3>

            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Địa chỉ"
              value={item.address || "Chưa cập nhật"} />
            <div className="mt-2 flex gap-2">
              <button
                onClick={openMaps}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium"
              >
                <Navigation className="w-4 h-4" /> Chỉ đường
              </button>
            </div>

            <div className="h-px bg-gray-100 my-4" />

            <InfoRow icon={<Phone className="w-4 h-4" />} label="Điện thoại"
              value={item.phone || "Chưa cập nhật"} />
            <div className="mt-2 flex gap-2">
              <button
                onClick={callNow}
                disabled={!item.phone}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
              >
                Gọi ngay
              </button>
            </div>

            <div className="h-px bg-gray-100 my-4" />

            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email"
              value={item.email || "Chưa cập nhật"} />
            <div className="mt-2">
              <button
                onClick={mailNow}
                disabled={!item.email}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium disabled:opacity-50"
              >
                Gửi email
              </button>
            </div>

            <div className="h-px bg-gray-100 my-4" />

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Giờ mở cửa: {item.isOpen ? "Hiện đang mở" : "Hiện đã đóng"}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MenuItemCard({ m, restaurantId, highlight }) {
  const nf = useMemo(() => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }), []);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useAppSelector((s) => s.user);
  const onAdd = async (e) => {
    e.stopPropagation();
    try {
      await dispatch(addToCartOptimistic({ menu: m, quantity: 1 }));
    } catch (e2) {
      console.error(e2);
    }
    if (!isLoggedIn) {
          dispatch(setAuthMode("login"));
          dispatch(setShowAuthModal(true));
          return;
        }
  };

  return (
    <div
      onClick={() => navigate(`/restaurants/${restaurantId}`, { state: { menuItem: m } })}
      className={`rounded-2xl border hover:shadow-md bg-white overflow-hidden cursor-pointer transition
        ${highlight ? "ring-2 ring-emerald-500" : ""}`}
      title={m.name}
    >
      <div className="h-36 bg-gray-100">
        {m.image ? (
          <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
        ) : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Không có ảnh</div>}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800 line-clamp-1">{m.name}</h3>
          <div className="text-amber-600 flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm">{m.rating ? m.rating.toFixed(1) : "-"}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{m.description || "—"}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-green-700 font-semibold">{nf.format(m.price || 0)}</div>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/restaurants/${restaurantId}}`, { state: { menuItem: m } });
              }}
              className="text-sm font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg"
            >
              Xem chi tiết
            </button> */}
            <button
              type="button"
              className="p-2 rounded-lg border hover:bg-gray-50"
              title="Thêm vào giỏ"
              onClick={onAdd}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-1 flex items-start gap-2 text-gray-800">
        {icon}
        <div className="text-sm">{value}</div>
      </div>
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      <div className="h-72 bg-gray-200" />
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-6 bg-gray-200 w-40 mt-4 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-40 bg-gray-200 rounded-2xl" />
            <div className="h-40 bg-gray-200 rounded-2xl" />
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function normalizeRestaurant(raw) {
  return {
    id: raw?._id || raw?.id,
    name: raw?.name || "—",
    description: raw?.description,
    phone: raw?.phone,
    email: raw?.email,
    address: raw?.address,
    image: raw?.image || raw?.imageUrl || raw?.cover,
    rating: Number(raw?.rating ?? raw?.avgRating ?? 0),
    isOpen: Boolean(raw?.isOpen ?? raw?.open ?? true),
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
}
