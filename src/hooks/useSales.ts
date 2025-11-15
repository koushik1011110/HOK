import { useState, useEffect } from 'react';
import { supabase, Sale, SaleItem } from '../lib/supabase';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const createSale = async (
    saleData: Omit<Sale, 'id' | 'created_at'>,
    items: Omit<SaleItem, 'id' | 'sale_id' | 'created_at'>[]
  ) => {
    try {
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([saleData])
        .select()
        .single();

      if (saleError) throw saleError;

      const saleItems = items.map(item => ({
        ...item,
        sale_id: sale.id
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      for (const item of items) {
        const { error: stockError } = await supabase.rpc('update_stock', {
          product_id: item.product_id,
          quantity_sold: item.quantity
        });

        if (stockError) {
          const { data: product } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

          if (product) {
            await supabase
              .from('products')
              .update({
                stock_quantity: product.stock_quantity - item.quantity,
                updated_at: new Date().toISOString()
              })
              .eq('id', item.product_id);
          }
        }
      }

      await fetchSales();
      return sale;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create sale');
    }
  };

  const getTodaySales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sales.filter(s => new Date(s.sale_date) >= today);
  };

  const getWeeklySales = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sales.filter(s => new Date(s.sale_date) >= weekAgo);
  };

  const getTodayStats = () => {
    const todaySales = getTodaySales();
    return {
      totalSales: todaySales.length,
      totalRevenue: todaySales.reduce((sum, s) => sum + s.total_amount, 0),
      totalProfit: todaySales.reduce((sum, s) => sum + s.profit, 0)
    };
  };

  const getWeeklyStats = () => {
    const weeklySales = getWeeklySales();
    return {
      totalSales: weeklySales.length,
      totalRevenue: weeklySales.reduce((sum, s) => sum + s.total_amount, 0),
      totalProfit: weeklySales.reduce((sum, s) => sum + s.profit, 0)
    };
  };

  return {
    sales,
    loading,
    error,
    createSale,
    getTodaySales,
    getWeeklySales,
    getTodayStats,
    getWeeklyStats,
    refetch: fetchSales
  };
}
