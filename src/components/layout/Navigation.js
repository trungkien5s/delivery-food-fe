import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rawCategories, setRawCategories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiURL = process.env.REACT_APP_API_BASE;

  const navItems = [
    { name: "Trang chủ", to: "/" },
    { name: "Giới thiệu", to: "/about" },
    { name: "Món ăn", to: "/menu", hasDropdown: true },
    { name: "Nhà hàng", to: "/restaurants", hasDropdown: true },
    { name: "Câu hỏi thường gặp", to: "/faq" },
    { name: "Tin tức", to: "/news" },
    { name: "Liên hệ", to: "/contact" },
  ];

  // Icon mapping cho các categories
  const categoryIcons = {
    "Trà sữa": "🧋",
    "Đồ ăn nhanh": "🍔",
    "Cơm": "🍚",
    "Bánh Mì/Xôi": "🥖",
    "Bún/Phở/Mỳ/Cháo": "🍜",
    "Cà phê/Trà": "☕",
    "Mart": "🛒",
    "Tráng miệng": "🍰",
    "Ăn vặt": "🍿"
  };

  const fetchCategories = useCallback(async () => {
    if (!apiURL) {
      console.log("API URL not found");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching categories from:", `${apiURL}/categories`);

      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${apiURL}/categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      console.log("API Response:", res.data);

      // FIX: Lấy đúng data từ response
      const data = res.data?.data || [];
      console.log("Processed data:", data);
      
      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu không đúng định dạng");
      }

      setRawCategories(data);
      setLoaded(true);
    } catch (err) {
      console.error("Fetch categories error:", err);
      setError(`Không tải được danh mục: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [apiURL]);

  // Prefetch lần đầu khi người dùng hover mở menu
  useEffect(() => {
    if (isMenuOpen && !loaded && !loading) {
      fetchCategories();
    }
  }, [isMenuOpen, loaded, loading, fetchCategories]);

  // Process categories data
  const categories = useMemo(() => {
    console.log("Processing rawCategories:", rawCategories);
    
    if (!Array.isArray(rawCategories) || rawCategories.length === 0) {
      console.log("No categories to process");
      return [];
    }

    // FIX: Xử lý dữ liệu theo format từ API
    const processedCategories = rawCategories.map((category) => ({
      id: category._id || category.id,
      name: category.name || "Chưa đặt tên",
      slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || category._id,
      icon: categoryIcons[category.name] || "🍽️",
      subcategories: [] // Hiện tại API chưa có subcategories
    }));

    console.log("Processed categories:", processedCategories);
    return processedCategories;
  }, [rawCategories]);

  // Updated handleGoCategory function with better slug handling
  const handleGoCategory = (category) => {
    setIsMenuOpen(false);
    
    // Use slug if available, otherwise use ID or create a slug from name
    let categoryPath;
    
      categoryPath = category.id || category._id;
    
    console.log("Navigating to category:", categoryPath, category);
    navigate(`/categories/${categoryPath}`);
  };

  // Debug: Log when component renders
  console.log("Navigation render:", { 
    isMenuOpen, 
    loaded, 
    loading, 
    categoriesCount: categories.length,
    error 
  });

  return (
    <div className="bg-white border-t border-gray-200 py-2 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center space-x-6">
        {/* Categories Menu Button */}
        <div
          className="relative"
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <button
            className="bg-yellow-400 hover:bg-yellow-500 px-3 py-2 rounded-md flex items-center space-x-2 font-medium text-sm transition-colors shadow-sm"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            <Menu className="w-4 h-4" />
            <span>Danh mục sản phẩm</span>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 pt-1 w-80 z-50">
              <div className="bg-white border border-gray-200 rounded-lg shadow-xl">
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-100">
                    Danh mục món ăn
                  </h3>

                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </div>
                  ) : error ? (
                    <div className="text-xs text-red-600 p-2 bg-red-50 rounded">
                      {error}
                      <button 
                        onClick={fetchCategories}
                        className="ml-2 text-red-700 underline hover:no-underline"
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-xs text-gray-500 p-2">
                      Chưa có danh mục để hiển thị.
                      {!loaded && (
                        <button 
                          onClick={fetchCategories}
                          className="ml-2 text-blue-600 underline hover:no-underline"
                        >
                          Tải danh mục
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-auto pr-1">
                      <div className="space-y-1">
                        {categories.map((category) => (
                          <div key={category.id} className="group">
                            <div
                              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                              onClick={() => handleGoCategory(category)}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">
                                  {category.icon}
                                </span>
                                <span className="font-medium text-gray-700 group-hover:text-green-600 text-sm">
                                  {category.name}
                                </span>
                              </div>
                              {category.subcategories?.length > 0 && (
                                <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-green-600" />
                              )}
                            </div>

                            {/* Subcategories - hiện tại chưa có */}
                            {category.subcategories?.length > 0 && (
                              <div className="hidden group-hover:block ml-6 py-1">
                                <div className="grid grid-cols-2 gap-1">
                                  {category.subcategories.map((sub) => (
                                    <button
                                      key={sub.id}
                                      type="button"
                                      className="text-xs text-gray-600 hover:text-green-600 py-1 px-2 hover:bg-green-50 rounded transition-colors text-left"
                                      onClick={() => handleGoCategory(sub)}
                                    >
                                      {sub.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View All Link */}
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <NavLink
                      to="/categories"
                      className="text-green-600 hover:text-green-700 font-medium text-xs flex items-center space-x-1 w-full justify-center py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Xem tất cả danh mục</span>
                      <ChevronRight className="w-3 h-3" />
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center space-x-1 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-700 hover:text-green-600"
                }`
              }
            >
              <span>{item.name}</span>
              {item.hasDropdown && <ChevronDown className="w-3 h-3" />}
            </NavLink>
          ))}
        </nav>

        {/* Sale Badge */}
        <div className="ml-auto">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse whitespace-nowrap">
            Mua hàng nhanh
          </span>
        </div>
      </div>
    </div>
  );
}