import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAppSelector } from "../../redux/hooks/useAppSelector";
import { useAppDispatch } from "../../redux/store/store";
import { 
  fetchCartItems, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from "../../redux/store/slices/cartSlice";
import { createOrder } from "../../redux/store/slices/ordersSlice";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  MapPin,
  Phone,
  User,
  MessageSquare
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { isLoggedIn } = useAppSelector((state) => state.user);
  const { items, loading, error, totalAmount, itemCount } = useAppSelector((state) => state.cart);
  const { createOrderLoading, createOrderError } = useAppSelector((state) => state.orders);
  
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [orderForm, setOrderForm] = useState({
    deliveryAddress: "",
    phoneNumber: "",
    customerName: "",
    notes: ""
  });
  const [showOrderForm, setShowOrderForm] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchCartItems());
    }
  }, [dispatch, isLoggedIn]);

  // Auto-select all items initially
  useEffect(() => {
    if (items.length > 0) {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  }, [items]);

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Vui lòng đăng nhập</h2>
            <p className="text-gray-600 mb-4">Bạn cần đăng nhập để xem giỏ hàng</p>
            <Link 
              to="/" 
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
    } catch (error) {
      console.error("Failed to update cart item:", error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm("Bạn có chắc muốn xóa món này khỏi giỏ hàng?")) {
      try {
        await dispatch(removeFromCart(itemId)).unwrap();
        // Remove from selected items
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      } catch (error) {
        console.error("Failed to remove cart item:", error);
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      try {
        await dispatch(clearCart()).unwrap();
        setSelectedItems(new Set());
      } catch (error) {
        console.error("Failed to clear cart:", error);
      }
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const selectedItemsData = items.filter(item => selectedItems.has(item.id));
  const selectedTotal = selectedItemsData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedCount = selectedItemsData.reduce((sum, item) => sum + item.quantity, 0);

  const handleOrderFormSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedItems.size === 0) {
      alert("Vui lòng chọn ít nhất một món để đặt hàng");
      return;
    }

    try {
      const orderData = {
        items: selectedItemsData.map(item => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
          notes: item.notes || ""
        })),
        delivery_address: orderForm.deliveryAddress,
        phone_number: orderForm.phoneNumber,
        customer_name: orderForm.customerName,
        notes: orderForm.notes
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      
      // Success - redirect to order confirmation
      alert("Đặt hàng thành công!");
      navigate(`/orders/${result.id || result._id}`);
      
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Đặt hàng thất bại. Vui lòng thử lại!");
    }
  };

  const nf = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng</h1>
            <p className="text-gray-600">{itemCount} sản phẩm</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-4">Hãy thêm một số món ăn vào giỏ hàng của bạn</p>
            <Link 
              to="/menu" 
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Xem thực đơn
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Select All */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.size === items.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="font-medium">Chọn tất cả ({items.length} món)</span>
              </label>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mt-2"
                    />
                    
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.menu?.image ? (
                        <img 
                          src={item.menu.image} 
                          alt={item.menu.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.menu?.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{item.menu?.description}</p>
                      <div className="text-green-600 font-semibold mt-1">
                        {nf.format(item.price)}
                      </div>
                      {item.notes && (
                        <p className="text-sm text-gray-500 mt-1 italic">Ghi chú: {item.notes}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <div className="font-semibold">{nf.format(item.price * item.quantity)}</div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Xóa khỏi giỏ hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tổng kết đơn hàng</h3>
                <span className="text-sm text-gray-600">
                  {selectedCount} món được chọn
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{nf.format(selectedTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{nf.format(selectedTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowOrderForm(!showOrderForm)}
                disabled={selectedItems.size === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Đặt hàng ({selectedCount} món)
              </button>
            </div>

            {/* Order Form */}
            {showOrderForm && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Thông tin giao hàng</h3>
                
                {createOrderError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                    {createOrderError}
                  </div>
                )}

                <form onSubmit={handleOrderFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.customerName}
                      onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      required
                      value={orderForm.phoneNumber}
                      onChange={(e) => setOrderForm({...orderForm, phoneNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Địa chỉ giao hàng *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={orderForm.deliveryAddress}
                      onChange={(e) => setOrderForm({...orderForm, deliveryAddress: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Nhập địa chỉ giao hàng chi tiết"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      rows={2}
                      value={orderForm.notes}
                      onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Ghi chú thêm cho đơn hàng..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={createOrderLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {createOrderLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang đặt hàng...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Xác nhận đặt hàng
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}