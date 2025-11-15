import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X, Phone, CheckCircle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useSales } from '../hooks/useSales';
import { CartItem } from '../lib/supabase';
import { shareInvoiceToWhatsApp } from '../utils/invoiceGenerator';

export function POSCheckout() {
  const { products, loading } = useProducts();
  const { createSale } = useSales();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [processing, setProcessing] = useState(false);

  const addToCart = (product: typeof products[0]) => {
    if (product.stock_quantity <= 0) {
      alert('Product is out of stock!');
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        alert('Cannot add more than available stock!');
        return;
      }
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > item.product.stock_quantity) {
      alert('Cannot exceed available stock!');
      return;
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.selling_price * item.quantity), 0);
  };

  const getCartCost = () => {
    return cart.reduce((sum, item) => sum + (item.product.purchase_price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    setShowPaymentModal(true);
  };

  const completeSale = async (withWhatsApp: boolean) => {
    if (withWhatsApp && (!phoneNumber || phoneNumber === '+91')) {
      alert('Please enter a valid phone number');
      return;
    }

    setProcessing(true);
    try {
      const totalAmount = getCartTotal();
      const totalCost = getCartCost();
      const profit = totalAmount - totalCost;

      const saleData = {
        sale_date: new Date().toISOString(),
        total_amount: totalAmount,
        total_cost: totalCost,
        profit: profit,
        customer_phone: withWhatsApp ? phoneNumber : '',
        invoice_url: ''
      };

      const items = cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.selling_price,
        unit_cost: item.product.purchase_price,
        subtotal: item.product.selling_price * item.quantity
      }));

      const sale = await createSale(saleData, items);

      if (withWhatsApp) {
        shareInvoiceToWhatsApp(phoneNumber, sale.id, items, totalAmount);
      }

      setCart([]);
      setPhoneNumber('+91');
      setShowPaymentModal(false);
      alert('Sale completed successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to complete sale');
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">POS Checkout</h2>
        <p className="text-gray-600 text-sm">Select products to add to cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
                  product.stock_quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.sku}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.stock_quantity > product.low_stock_threshold
                      ? 'bg-green-100 text-green-800'
                      : product.stock_quantity > 0
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock_quantity} in stock
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {product.category}
                    {product.size && ` • ${product.size}`}
                    {product.color && ` • ${product.color}`}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{product.selling_price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Cart ({cart.length})
              </h3>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">₹{item.product.selling_price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900">
                        ₹{(item.product.selling_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-lg">
                <span className="font-medium text-gray-700">Subtotal</span>
                <span className="font-semibold text-gray-900">₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span className="text-blue-600">₹{getCartTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                Paid
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Complete Sale
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total Amount:</span>
                <span className="text-3xl font-bold text-green-600">
                  ₹{getCartTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Leave empty to complete without WhatsApp
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={processing}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => completeSale(false)}
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                  {processing ? 'Processing...' : 'Just Paid'}
                </button>
                <button
                  onClick={() => completeSale(true)}
                  disabled={processing || phoneNumber === '+91'}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? 'Processing...' : (
                    <>
                      <Phone className="w-4 h-4" />
                      WhatsApp
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
