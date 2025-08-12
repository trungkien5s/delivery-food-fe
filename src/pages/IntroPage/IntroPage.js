import React from "react";
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  Clock,
  ShieldCheck,
  MapPin,
  Smartphone,
  Gift,
  Truck,
  Star,
  Headphones,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const IntroPage = () => {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-white" />
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-14 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                <UtensilsCrossed className="w-4 h-4" />
                FoodLive – Giao đồ ăn sống động từng phút
              </span>
              <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Đặt món trong vài chạm,{" "}
                <span className="text-green-600">nhận ngay trong 20’</span>
              </h1>
              <p className="mt-4 text-gray-600 text-lg">
                FoodLive kết nối bạn với <b>hàng nghìn nhà hàng đối tác</b>, theo
                dõi hành trình món ăn theo thời gian thực, ưu đãi ngập tràn và
                chất lượng được kiểm duyệt.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm"
                >
                  Khám phá thực đơn <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/restaurants"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-semibold border"
                >
                  Tìm nhà hàng gần bạn
                </Link>
              </div>

              {/* Quick trust badges */}
              <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  An toàn & minh bạch
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Giao nhanh trung bình 20’
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-emerald-600" />
                  4.8/5 điểm hài lòng
                </div>
              </div>
            </div>

            <div className="relative order-first md:order-none">
              <div className="aspect-[4/3] rounded-3xl bg-white border shadow-sm p-4">
                <div className="h-full w-full rounded-2xl bg-gradient-to-br from-emerald-100 via-green-50 to-white flex items-center justify-center">
                  <div className="text-center">
                    <UtensilsCrossed className="w-12 h-12 mx-auto text-emerald-700" />
                    <p className="mt-3 font-semibold text-gray-800">
                      FoodLive – Fresh • Fast • Live
                    </p>
                    <p className="text-sm text-gray-500">
                      Trải nghiệm đặt món nhanh, theo dõi trực tiếp hành trình giao.
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white border rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Tài xế đang trên đường…</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <StatItem number="2.5K+" label="Nhà hàng đối tác" />
          <StatItem number="20’" label="Thời gian giao TB" />
          <StatItem number="500K+" label="Người dùng hài lòng" />
          <StatItem number="4.8/5" label="Điểm đánh giá" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
            Vì sao chọn <span className="text-green-600">FoodLive</span>?
          </h2>
          <p className="text-gray-600 text-center mt-2 max-w-2xl mx-auto">
            Chúng tôi xây dựng trải nghiệm đặt – giao – thưởng thức trọn vẹn, minh bạch và tiện lợi.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Feature
              icon={<Smartphone className="w-6 h-6" />}
              title="Đặt món siêu nhanh"
              desc="Gợi ý thông minh theo vị trí và khẩu vị; hoàn tất chỉ trong vài chạm."
            />
            <Feature
              icon={<MapPin className="w-6 h-6" />}
              title="Theo dõi trực tiếp"
              desc="Xem tài xế ở đâu, ước tính thời gian đến chính xác theo thời gian thực."
            />
            <Feature
              icon={<Gift className="w-6 h-6" />}
              title="Ưu đãi mỗi ngày"
              desc="Voucher độc quyền từ FoodLive & nhà hàng đối tác, tích điểm đổi quà."
            />
            <Feature
              icon={<ShieldCheck className="w-6 h-6" />}
              title="An toàn & minh bạch"
              desc="Đối tác kiểm duyệt, hoá đơn rõ ràng, quy trình bảo quản tiêu chuẩn."
            />
            <Feature
              icon={<Clock className="w-6 h-6" />}
              title="Đúng hẹn"
              desc="Thuật toán định tuyến tối ưu, hạn chế trễ đơn giờ cao điểm."
            />
            <Feature
              icon={<Headphones className="w-6 h-6" />}
              title="Hỗ trợ 24/7"
              desc="Đội ngũ CSKH sẵn sàng hỗ trợ bạn bất cứ khi nào cần."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
            Đặt món trên <span className="text-green-600">FoodLive</span> như thế nào?
          </h2>

          <div className="mt-8 grid md:grid-cols-4 gap-6">
            <Step index={1} title="Chọn món" desc="Khám phá thực đơn & nhà hàng yêu thích." />
            <Step index={2} title="Đặt hàng" desc="Tùy chọn topping, ghi chú khẩu vị, áp mã ưu đãi." />
            <Step index={3} title="Theo dõi" desc="Xem lộ trình tài xế & thời gian dự kiến." />
            <Step index={4} title="Thưởng thức" desc="Nhận món nóng hổi, đánh giá để nhận quà!" />
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/restaurants"
              className="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black"
            >
              Bắt đầu đặt món
            </Link>
            <Link
              to="/faq"
              className="px-5 py-3 rounded-xl bg-white border font-semibold hover:bg-gray-50"
            >
              Câu hỏi thường gặp
            </Link>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            <WhyCard
              title="Nguồn đối tác tin cậy"
              desc="Nhà hàng được kiểm duyệt và đánh giá định kỳ để đảm bảo chất lượng."
              points={["Tiêu chuẩn an toàn thực phẩm", "Minh bạch giá & phí", "Hỗ trợ xử lý sự cố nhanh"]}
            />
            <WhyCard
              title="Trải nghiệm mượt mà"
              desc="Tối ưu từ chọn món tới thanh toán, tiết kiệm thời gian cho bạn."
              points={["Giao diện thân thiện", "Lưu địa chỉ & đơn ưa thích", "Thanh toán đa phương thức"]}
            />
            <WhyCard
              title="Giá trị bền vững"
              desc="Khuyến khích bao bì thân thiện & lộ trình giao hàng tối ưu khí thải."
              points={["Bao bì xanh tuỳ chọn", "Gom đơn thông minh", "Ưu đãi cho khách hàng thân thiết"]}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">Câu hỏi thường gặp</h2>
          <div className="mt-8 space-y-3">
            <Faq
              q="FoodLive hoạt động ở những khu vực nào?"
              a="Chúng tôi đang mở rộng liên tục. Bạn có thể nhập vị trí để xem các nhà hàng gần bạn."
            />
            <Faq
              q="Tôi có thể theo dõi đơn hàng thế nào?"
              a="Sau khi đặt, FoodLive hiển thị tuyến đường và thời gian giao dự kiến trực tiếp theo thời gian thực."
            />
            <Faq
              q="Phí vận chuyển được tính ra sao?"
              a="Phí dựa trên khoảng cách, thời điểm và ưu đãi áp dụng. Giá luôn hiển thị trước khi xác nhận."
            />
            <Faq
              q="Khi món đến trễ thì sao?"
              a="Bạn có thể liên hệ CSKH 24/7. Một số trường hợp đủ điều kiện sẽ được hỗ trợ/đền bù theo chính sách."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-extrabold">Sẵn sàng cho bữa ngon tiếp theo?</h3>
          <p className="mt-2 text-emerald-100">
            Trải nghiệm FoodLive ngay hôm nay – nhanh, tươi, đúng hẹn.
          </p>
          <div className="mt-6">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50"
            >
              Khám phá thực đơn <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

/* ============ Sub Components ============ */

function StatItem({ number, label }) {
  return (
    <div className="bg-white rounded-2xl border p-6">
      <div className="text-2xl font-extrabold text-gray-900">{number}</div>
      <div className="mt-1 text-gray-600">{label}</div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-2xl border p-5 hover:shadow-sm transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-gray-600 text-sm">{desc}</p>
    </div>
  );
}

function Step({ index, title, desc }) {
  return (
    <div className="bg-white rounded-2xl border p-5 relative">
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
        {index}
      </div>
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="mt-1 text-gray-600 text-sm">{desc}</p>
    </div>
  );
}

function WhyCard({ title, desc, points }) {
  return (
    <div className="bg-white rounded-2xl border p-6">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 text-sm">{desc}</p>
      <ul className="mt-3 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Faq({ q, a }) {
  return (
    <details className="group bg-gray-50 rounded-xl border p-4">
      <summary className="list-none cursor-pointer flex items-center justify-between">
        <span className="font-medium text-gray-900">{q}</span>
        <span className="text-gray-500 group-open:rotate-180 transition-transform">⌄</span>
      </summary>
      <p className="mt-2 text-gray-600 text-sm">{a}</p>
    </details>
  );
}
