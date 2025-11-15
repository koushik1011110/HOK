import { TrendingUp, DollarSign, ShoppingBag, AlertCircle } from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { useProducts } from '../hooks/useProducts';

export function Dashboard() {
  const { getTodayStats, getWeeklyStats, loading: salesLoading } = useSales();
  const { getLowStockProducts, loading: productsLoading } = useProducts();

  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();
  const lowStockProducts = getLowStockProducts();

  if (salesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h2>
        <p className="text-gray-600 text-sm">Today's Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Today's Sales</p>
              <p className="text-3xl font-bold mt-1">{todayStats.totalSales}</p>
            </div>
            <ShoppingBag className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Today's Revenue</p>
              <p className="text-3xl font-bold mt-1">₹{todayStats.totalRevenue.toFixed(0)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Today's Profit</p>
              <p className="text-3xl font-bold mt-1">₹{todayStats.totalProfit.toFixed(0)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm mb-1">Total Sales (7 days)</p>
            <p className="text-2xl font-bold text-gray-800">{weeklyStats.totalSales}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Total Revenue (7 days)</p>
            <p className="text-2xl font-bold text-gray-800">₹{weeklyStats.totalRevenue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Total Profit (7 days)</p>
            <p className="text-2xl font-bold text-gray-800">₹{weeklyStats.totalProfit.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-red-900 font-semibold mb-2">Low Stock Alert</h3>
              <div className="space-y-2">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex justify-between items-center text-sm">
                    <span className="text-red-800">
                      {product.name} ({product.sku})
                    </span>
                    <span className="font-semibold text-red-900">
                      {product.stock_quantity} units left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
