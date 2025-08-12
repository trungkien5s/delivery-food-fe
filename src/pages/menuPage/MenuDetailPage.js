import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Star, Tag, ShoppingCart } from "lucide-react";

const nfVND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function MenuDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const base = process.env.REACT_APP_API_BASE || "";
        const res = await axios.get(`${base}/menus/${id}`);
        const raw = res.data?.data ?? res.data;
        if (mounted) setData(raw);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <Layout><SkeletonDetail /></Layout>;
  if (err) return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">{err}</div>
        <div className="mt-4">
          <Link to="/menu" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800">
            <ChevronLeft className="w-4 h-4" /> Quay lại thực đơn
          </Link>
        </div>
      </div>
    </Layout>
  );

  const m = normalizeMenu(data);
  const priceText = m.price > 0 ? nfVND.format(m.price) : "Liên hệ";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <nav className="text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link to="/menu" className="hover:text-gray-700">Thực đơn</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{m.name}</span>
          </nav>
          <Link to="/menu" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800">
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Image */}
            <div className="relative h-64 md:h-full bg-gray-100">
              {m.image ? (
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Không có ảnh</div>
              )}
              {!m.isAvailable && (
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-white">
                  Hết món
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-gray-800">{m.name}</h1>
                <div className="text-amber-600 flex items-center gap-1">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">{m.rating ? m.rating.toFixed(1) : "-"}</span>
                </div>
              </div>

              <div className="text-2xl font-bold text-green-700">{priceText}</div>

              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs inline-flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {m.category}
                </span>
                {m.tags.slice(0, 4).map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 text-xs">{t}</span>
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed">
                {m.description || "Món ăn chưa có mô tả chi tiết."}
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={!m.isAvailable}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 bg-green-600 hover:bg-green-700"
                  onClick={() => alert("Demo: thêm vào giỏ")}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* (Tuỳ chọn) Thông tin thêm, gợi ý món tương tự… */}
      </div>
    </Layout>
  );
}

function SkeletonDetail() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-pulse space-y-6">
      <div className="h-4 w-56 bg-gray-200 rounded" />
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="h-64 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-2/3" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeMenu(raw) {
  const priceCents = raw?.price_cents;
  let price = raw?.price;
  if ((price == null || Number.isNaN(Number(price))) && priceCents != null) {
    price = Number(priceCents) / 100;
  }
  return {
    id: raw?._id || raw?.id,
    name: raw?.name || raw?.title || "Món ăn",
    description: raw?.description || raw?.desc || "",
    image: raw?.image || raw?.imageUrl || raw?.photo || (raw?.photos && raw?.photos[0]),
    price: Number(price || 0),
    rating: Number(raw?.rating ?? raw?.avgRating ?? 0),
    category: raw?.category || (Array.isArray(raw?.categories) ? raw.categories[0] : "") || raw?.type || "Khác",
    tags: Array.isArray(raw?.tags) ? raw.tags : (Array.isArray(raw?.categories) ? raw.categories : []),
    isAvailable: Boolean(raw?.isAvailable ?? raw?.available ?? true),
  };
}
