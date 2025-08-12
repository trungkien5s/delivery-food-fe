import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import axios from "axios";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, Clock, ChefHat, ChevronsLeft, ChevronsRight } from "lucide-react";

const PAGE_SIZE = 12;

const pick = (r, keys, fallback = undefined) => {
  for (const k of keys) {
    const v = k.split(".").reduce((acc, cur) => (acc ? acc[cur] : undefined), r);
    if (v !== undefined && v !== null) return v;
  }
  return fallback;
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("rating_desc"); // rating_desc | rating_asc | name_asc | time_asc | price_asc
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const base = process.env.REACT_APP_API_BASE || "";
        const { data } = await axios.get(`${base}/restaurants`);
        // chấp nhận cả dạng {data: []} hoặc []
        const list = Array.isArray(data) ? data : (data?.data ?? data?.restaurants ?? []);
        if (mounted) setRestaurants(Array.isArray(list) ? list : []);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e.message || "Load restaurants failed");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // chuẩn hoá dữ liệu để render
  const normalized = useMemo(() => {
    return restaurants.map((r) => ({
      id: pick(r, ["id", "_id"]),
      name: pick(r, ["name", "title"], "Unnamed"),
      image: pick(r, ["image", "imageUrl", "cover", "photo", "photos.0"]),
      rating: Number(pick(r, ["rating", "avgRating", "score"], 0)),
      cuisines: pick(r, ["cuisines", "tags"], []),
      address: pick(r, ["address.formatted", "address.city", "address", "location"], ""),
      deliveryTime: Number(pick(r, ["deliveryTime", "etaMinutes"], 0)),
      priceRange: Number(pick(r, ["priceRange", "price_level"], 0)),
      isOpen: Boolean(pick(r, ["isOpen", "open"], true)) || pick(r, ["status"], "open") === "open",
      raw: r,
    }));
  }, [restaurants]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const arr = term
      ? normalized.filter((r) => {
          const inName = r.name?.toLowerCase().includes(term);
          const inAddr = r.address?.toLowerCase().includes(term);
          const inCuisine = Array.isArray(r.cuisines) && r.cuisines.join(" ").toLowerCase().includes(term);
          return inName || inAddr || inCuisine;
        })
      : normalized;

    const sorted = [...arr].sort((a, b) => {
      switch (sortBy) {
        case "rating_desc": return (b.rating || -1) - (a.rating || -1);
        case "rating_asc": return (a.rating || 1e9) - (b.rating || 1e9);
        case "name_asc": return a.name.localeCompare(b.name);
        case "time_asc": return (a.deliveryTime || 1e9) - (b.deliveryTime || 1e9);
        case "price_asc": return (a.priceRange || 1e9) - (b.priceRange || 1e9);
        default: return 0;
      }
    });

    return sorted;
  }, [normalized, q, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  useEffect(() => {
    // reset về trang 1 khi lọc/tìm/sắp xếp
    setPage(1);
  }, [q, sortBy]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Nhà hàng</h1>
            <p className="text-gray-500 text-sm">
              {loading ? "Đang tải..." : `Tìm thấy ${filtered.length} nhà hàng`}
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
                placeholder="Tìm theo tên, địa chỉ, món..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="rating_desc">Sắp xếp: Điểm cao → thấp</option>
              <option value="rating_asc">Sắp xếp: Điểm thấp → cao</option>
              <option value="name_asc">Sắp xếp: Tên (A→Z)</option>
              <option value="time_asc">Sắp xếp: Thời gian giao nhanh</option>
              <option value="price_asc">Sắp xếp: Giá rẻ</option>
            </select>
          </div>
        </div>

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
          <EmptyState onClear={() => setQ("")} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {pageItems.map((r) => (
                <RestaurantCard key={r.id || r.name} r={r} />
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

/* ========================= Subcomponents ========================= */

function RestaurantCard({ r }) {
  const id = r.id;
  const cuisines = Array.isArray(r.cuisines) ? r.cuisines.slice(0, 3) : [];
  const img = r.image;

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-white">
      {/* Image */}
      <div className="relative h-40 bg-gray-100">
        {img ? (
          <img src={img} alt={r.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Không có ảnh
          </div>
        )}
        <OpenBadge open={r.isOpen} />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-gray-800 line-clamp-1">{r.name}</h3>
          <div className="flex items-center gap-1 text-sm text-amber-600">
            <Star className="w-4 h-4 fill-current" />
            <span>{r.rating?.toFixed?.(1) ?? r.rating ?? "-"}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{r.address || "—"}</span>
        </div>

        {/* <div className="flex flex-wrap gap-1">
          {cuisines.length > 0 ? (
            cuisines.map((c) => (
              <span key={c} className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs">
                {c}
              </span>
            ))
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 text-xs">Không rõ món</span>
          )}
        </div> */}

        {/* <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{r.deliveryTime ? `${r.deliveryTime}’` : "—"}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-4 h-4" />
            <span>{priceText(r.priceRange)}</span>
          </div>
        </div> */}

        {/* Detail link (nếu có route) */}
        {id && (
          <Link
            to={`/restaurants/${id}`}
            className="mt-2 inline-block w-full text-center text-sm font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors"
          >
            Xem chi tiết
          </Link>
        )}
      </div>
    </div>
  );
}

function OpenBadge({ open }) {
  return (
    <div className="absolute top-2 left-2">
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          open ? "bg-emerald-600 text-white" : "bg-gray-600 text-white"
        }`}
      >
        {open ? "Đang mở" : "Đóng cửa"}
      </span>
    </div>
  );
}

function priceText(level) {
  if (!level || level <= 0) return "—";
  if (level >= 4) return "₫₫₫₫";
  return "₫".repeat(Math.max(1, Math.min(4, Math.floor(level))));
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
      <p className="text-gray-700 font-medium">Không tìm thấy nhà hàng phù hợp</p>
      <p className="text-gray-500 text-sm mt-1">Thử đổi từ khóa khác hoặc xoá bộ lọc.</p>
      <button
        onClick={onClear}
        className="mt-4 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm hover:bg-black"
      >
        Xoá tìm kiếm
      </button>
    </div>
  );
}
