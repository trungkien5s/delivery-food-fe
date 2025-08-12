import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Star, Tag, ChevronsLeft, ChevronsRight, ShoppingCart
} from "lucide-react";
import { addToCartOptimistic } from "../../redux/store/slices/cartSlice";
import { useAppDispatch } from "../../redux/store/store";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { setAuthMode, setShowAuthModal } from "../../redux/store/slices/userSlice";
import { useLocation } from "react-router-dom";
const PAGE_SIZE = 12;

// safe getter
const get = (obj, path, fallback = undefined) => {
  try {
    const val = path.split(".").reduce((a, c) => (a == null ? a : a[c]), obj);
    return val == null ? fallback : val;
  } catch {
    return fallback;
  }
};

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [category, setCategory] = useState("Tất cả");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const base = process.env.REACT_APP_API_BASE || "";
        const { data } = await axios.get(`${base}/menu-items`);
        const list = Array.isArray(data) ? data : (data?.data ?? data?.menuItems ?? data?.menu_items ?? []);
        if (mounted) setMenuItems(Array.isArray(list) ? list : []);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e.message || "Load menu items failed");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

const normalized = useMemo(() => {
  return menuItems.map((m) => {
    // Tính giá: ưu tiên basePrice -> price -> price_cents
    const basePrice = get(m, "basePrice");
    const priceCents = get(m, "price_cents");
    let price = Number(get(m, "price", null));
    if (basePrice != null) price = Number(basePrice);
    else if ((price == null || Number.isNaN(price)) && priceCents != null) price = Number(priceCents) / 100;

    // Restaurant đã populate: object có _id/name/address/isOpen
    const restaurantId = get(m, "restaurant._id");
    const restaurantName = get(m, "restaurant.name", "");
    const restaurantAddress = get(m, "restaurant.address", "");
    const restaurantIsOpen = Boolean(get(m, "restaurant.isOpen", false));

    // Menu đã populate 1 phần (_id)
    const menuId = get(m, "menu._id") ?? get(m, "menu");

    // Category: Backend trả về categoryId là object {_id, name}
    const categoryRaw = get(m, "categoryId") ?? get(m, "category");
    const categoryId = typeof categoryRaw === "object" ? categoryRaw?._id : categoryRaw;
    const categoryName = typeof categoryRaw === "object" 
      ? (categoryRaw?.name || categoryRaw?.title || "Khác")
      : (categoryRaw ? String(categoryRaw) : "Khác");

    return {
      id: get(m, "_id") ?? get(m, "id"),
      name: get(m, "title") ?? get(m, "name", "Món ăn"),
      description: get(m, "description", ""),
      image: get(m, "image") ?? get(m, "imageUrl") ?? get(m, "photo") ?? get(m, "photos.0"),
      price: Number(price ?? 0),
      rating: Number(get(m, "rating") ?? get(m, "avgRating") ?? 0),

      // Dùng cho filter hiển thị
      category: categoryName,
      categoryId,

      // Thông tin nhà hàng
      restaurantId,
      restaurantName,
      restaurantAddress,
      restaurantIsOpen,

      menuId,
      tags: get(m, "tags") ?? get(m, "categories") ?? get(m, "cuisines") ?? [],
      isAvailable: Boolean(get(m, "isAvailable") ?? true),
      raw: m,
    };
  });
}, [menuItems]);

  // Tạo danh sách categories dựa trên categoryName, không phải categoryId
  const categories = useMemo(() => {
    const categoryNames = normalized.map((x) => x.category).filter(Boolean);
    const uniqueCategories = [...new Set(categoryNames)];
    return ["Tất cả", ...uniqueCategories.sort()];
  }, [normalized]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let arr = normalized.filter((m) => {
      const matchQ = term
        ? (m.name?.toLowerCase().includes(term) ||
           m.description?.toLowerCase().includes(term) ||
           (Array.isArray(m.tags) && m.tags.join(" ").toLowerCase().includes(term)))
        : true;
      
      // Fix: So sánh với categoryName thay vì categoryId
      const matchCat = category === "Tất cả" ? true : (m.category === category);
      
      return matchQ && matchCat;
    });

    arr = arr.sort((a, b) => {
      switch (sortBy) {
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "name_asc": return a.name.localeCompare(b.name);
        case "rating_desc": return (b.rating || -1) - (a.rating || -1);
        case "popular":
        default: return (b.rating || 0) - (a.rating || 0);
      }
    });
    return arr;
  }, [normalized, q, sortBy, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [q, sortBy, category]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Thực đơn</h1>
            <p className="text-gray-500 text-sm">
              {loading ? "Đang tải..." : `Có ${filtered.length} món`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm kiếm món ăn..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="popular">Phổ biến</option>
              <option value="rating_desc">Điểm cao → thấp</option>
              <option value="name_asc">Tên (A→Z)</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
            </select>
          </div>
        </div>

        {/* Debug info - có thể xóa sau khi test */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-gray-50 text-xs text-gray-600 rounded">
            Debug: Tổng {normalized.length} món, Category hiện tại: "{category}", 
            Categories có: {categories.join(", ")}
          </div>
        )} */}

        {/* Error */}
        {err && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {err}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : pageItems.length === 0 ? (
          <EmptyState onClear={() => { setQ(""); setCategory("Tất cả"); }} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {pageItems.map((m) => (
                <MenuCard key={m.id || m.name} m={m} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                className="px-3 py-2 rounded border text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={current === 1}
              >
                <ChevronsLeft className="w-4 h-4" /> Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang <strong>{current}</strong> / {totalPages}
              </span>
              <button
                className="px-3 py-2 rounded border text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={current === totalPages}
              >
                Sau <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

/* ---------- Subcomponents ---------- */

function MenuCard({ m }) {
  const nf = useMemo(() => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }), []);
  const priceText = m.price > 0 ? nf.format(m.price) : "Liên hệ";
  const tags = Array.isArray(m.tags) ? m.tags.slice(0, 3) : [];

  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAppSelector((s) => s.user);
  const location = useLocation();

  const navigate = useNavigate();
  const canOpen = Boolean(m.restaurantId);
  const openRestaurant = () => {
    if (!canOpen) return;
    navigate(`/restaurants/${m.restaurantId}`, { state: { menuItem: m } });
  };

  const onAdd = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      dispatch(setAuthMode("login"));
      dispatch(setShowAuthModal(true));
      return;
    }
    try {
      await dispatch(addToCartOptimistic({ menu: m, quantity: 1 }));
    } catch (e2) {
      console.error(e2);
    }
  };

  const onKey = (e) => {
    if (!canOpen) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openRestaurant();
    }
  };

  return (
    <div
      onClick={openRestaurant}
      onKeyDown={onKey}
      role="button"
      tabIndex={0}
      aria-label={`Mở nhà hàng ${m.restaurantName || ""}`}
      className={`rounded-2xl border border-gray-200 overflow-hidden transition-shadow bg-white
        ${canOpen ? "hover:shadow-md cursor-pointer" : "cursor-default opacity-95"}`}
    >
      <div className="relative h-40 bg-gray-100">
        {m.image ? (
          <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Không có ảnh</div>
        )}
        {m.isAvailable ? (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-600 text-white">
            Còn món
          </span>
        ) : (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-white">
            Hết món
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-gray-800 line-clamp-1">{m.name}</h3>
          <div className="text-amber-600 flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm">{m.rating ? m.rating.toFixed(1) : "-"}</span>
          </div>
        </div>

        {(m.restaurantName || m.restaurantAddress) && (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700 truncate">
        {m.restaurantName}
      </span>
      {typeof m.restaurantIsOpen === "boolean" && (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium
            ${m.restaurantIsOpen ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-600"}`}
        >
          {m.restaurantIsOpen ? "Đang mở" : "Đóng cửa"}
        </span>
      )}
    </div>

    {m.restaurantAddress && (
      <div className="text-xs text-gray-500 truncate">
        {m.restaurantAddress}
      </div>
    )}
  </div>
)}


        <div className="flex flex-wrap gap-1">
          {m.category && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs inline-flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {m.category}
            </span>
          )}
          {tags.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 text-xs">{t}</span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-green-700 font-semibold">{priceText}</div>
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
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 overflow-hidden bg-white animate-pulse">
          <div className="h-40 bg-gray-100" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-5 bg-gray-100 rounded w-16" />
              <div className="h-5 bg-gray-100 rounded w-14" />
              <div className="h-5 bg-gray-100 rounded w-12" />
            </div>
            <div className="h-8 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center bg-white">
      <p className="text-gray-700 font-medium">Không tìm thấy món phù hợp</p>
      <p className="text-gray-500 text-sm mt-1">Thử đổi từ khóa, danh mục hoặc sắp xếp khác.</p>
      <button
        onClick={onClear}
        className="mt-4 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm hover:bg-black"
      >
        Xoá bộ lọc
      </button>
    </div>
  );
}