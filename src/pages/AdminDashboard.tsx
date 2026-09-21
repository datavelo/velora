import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  Layers,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Search,
  Check,
  X,
  AlertTriangle,
  Upload,
  LogOut,
  ExternalLink,
  MessageCircle,
  Eye,
  RefreshCw,
  TrendingUp,
  Building2,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import {
  Category,
  Order,
  OrderStatus,
  Product,
  ProductImage,
  ProductVariant,
  SiteSettings,
  CustomAttribute,
  ProductOption,
} from '../types';
import { Store } from '../lib/store';
import { optimizeImageFile } from '../lib/imageOptimizer';
import { A5Invoice } from '../components/admin/A5Invoice';
import { ImageUploadField } from '../components/admin/ImageUploadField';
import { useToast } from '../components/ui/Toast';
import { VeloraLogo } from '../components/common/VeloraLogo';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
  onRefreshData: () => void;
  onLogout: () => void;
  onNavigateHome: () => void;
}

type AdminTab = 'overview' | 'orders' | 'products' | 'categories' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  settings,
  onRefreshData,
  onLogout,
  onNavigateHome,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [orders, setOrders] = useState<Order[]>(() => Store.getOrders());
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Filter & Search states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  // Product Editing / Creation Modal State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Category Editing / Creation Modal State
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Settings State
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);

  // Refresh orders on mount & when products change
  useEffect(() => {
    setOrders(Store.getOrders());
  }, []);

  // Update order status with atomic stock synchronization
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = Store.updateOrderStatus(orderId, newStatus);
      setOrders(Store.getOrders());
      onRefreshData();
      showToast(`Order status updated to ${newStatus}.`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Error updating order status.', 'error');
    }
  };

  // Confirm Bank Transfer payment & issue official Tax Invoice + Waybill
  const handleConfirmPayment = (orderId: string) => {
    const res = Store.confirmOrder(orderId);
    if (res.success) {
      setOrders(Store.getOrders());
      onRefreshData();
      showToast('Payment verified! Official Tax Invoice & Waybill generated.', 'success');
      if (selectedInvoiceOrder && selectedInvoiceOrder.id === orderId && res.order) {
        setSelectedInvoiceOrder(res.order);
      }
    } else {
      showToast(res.error || 'Failed to verify payment', 'error');
    }
  };

  // Image Upload helper for product
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const file = files[0];
      const optimized = await optimizeImageFile(file);

      const newImg: ProductImage = {
        image_url: optimized.dataUrl,
        thumbnail_url: optimized.thumbnailDataUrl,
        alt_text: file.name.replace(/\.[^/.]+$/, ''),
        sort_order: (editingProduct?.images?.length || 0),
        is_primary: (editingProduct?.images?.length || 0) === 0,
      };

      setEditingProduct((prev) => ({
        ...prev,
        images: [...(prev?.images || []), newImg],
      }));
      showToast(`Image compressed to ${Math.round(optimized.optimizedSize / 1024)} KB WebP`, 'info');
    } catch (err) {
      showToast('Image compression failed. Please check the file.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.normal_price_lkr) {
      showToast('Product name and normal price are required.', 'error');
      return;
    }

    try {
      Store.saveProduct(editingProduct as any);
      onRefreshData();
      setIsProductModalOpen(false);
      setEditingProduct(null);
      showToast('Product catalog updated successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save product.', 'error');
    }
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to remove this product from the catalog?')) {
      Store.deleteProduct(productId);
      onRefreshData();
      showToast('Product deleted.', 'info');
    }
  };

  // Save category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) {
      showToast('Category name is required.', 'error');
      return;
    }

    try {
      Store.saveCategory(editingCategory as any);
      onRefreshData();
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      showToast('Category structure saved.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save category.', 'error');
    }
  };

  // Delete category
  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      Store.deleteCategory(categoryId);
      onRefreshData();
      showToast('Category deleted.', 'info');
    }
  };

  // Save settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    Store.saveSettings(localSettings);
    onRefreshData();
    showToast('Store settings saved successfully.', 'success');
  };

  // Reset to default demo data
  const handleResetDemoData = () => {
    if (window.confirm('Reset all catalog, settings, and sample orders to initial demo state?')) {
      Store.resetToDemoData();
      setOrders(Store.getOrders());
      setLocalSettings(Store.getSettings());
      onRefreshData();
      showToast('Catalog & store reset to initial demo state.', 'success');
    }
  };

  // Overview metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_lkr, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.item_code.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat =
      productCategoryFilter === 'all' ||
      p.category_id === productCategoryFilter ||
      p.subcategory_id === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="bg-[#0e0e0e] text-white border-b border-neutral-800 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <VeloraLogo variant="wordmark" theme="dark" height={30} />
          <div className="border-l border-neutral-700 pl-3 hidden sm:flex items-center">
            <span className="font-heading text-xs font-bold tracking-widest text-neutral-300 uppercase">
              CONTROL SUITE
            </span>
            <span className="ml-2 text-[9px] bg-neutral-800 border border-gold/40 text-gold px-2 py-0.5 rounded font-mono">
              MASTER ACCESS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded text-neutral-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-800/60 text-xs font-semibold rounded text-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-8">
        <nav className="flex space-x-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'orders', label: `Orders (${orders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'products', label: `Products (${products.length})`, icon: <Package className="w-4 h-4" /> },
            { id: 'categories', label: `Categories (${categories.length})`, icon: <Layers className="w-4 h-4" /> },
            { id: 'settings', label: 'Store Settings', icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'border-gold text-black'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Admin Workspace Container */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24">
        {/* ================= 1. OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                  Total Orders
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900">{orders.length}</p>
                <p className="text-xs text-neutral-500 font-medium">All registered orders</p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                  Pending Orders
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-gold">{pendingOrders}</p>
                <p className="text-xs text-neutral-500 font-medium">Awaiting WhatsApp confirmation</p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                  Total Gross Revenue
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-black font-mono">
                  Rs. {totalRevenue.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-neutral-500 font-medium">Non-cancelled orders</p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                  Low Stock Items
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">
                  {lowStockProducts.length}
                </p>
                <p className="text-xs text-neutral-500 font-medium">Items with ≤ 5 units in stock</p>
              </div>
            </div>

            {/* Low stock alerts & recent orders table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Orders (Col 8) */}
              <div className="lg:col-span-8 bg-white rounded-lg border border-neutral-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-150">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900">
                    Recent Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-gold hover:underline uppercase tracking-wider"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b text-neutral-400 font-bold uppercase text-[10px]">
                        <th className="pb-2">Order #</th>
                        <th className="pb-2">Customer</th>
                        <th className="pb-2">District</th>
                        <th className="pb-2">Total (LKR)</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-150">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-neutral-50">
                          <td className="py-2.5 font-mono font-bold text-black">{o.order_number}</td>
                          <td className="py-2.5 font-medium">{o.customer_name}</td>
                          <td className="py-2.5 text-neutral-600">{o.district}</td>
                          <td className="py-2.5 font-mono font-bold">
                            Rs. {o.total_lkr.toLocaleString('en-US')}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                o.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-neutral-100 text-neutral-800'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => setSelectedInvoiceOrder(o)}
                              className="p-1 hover:text-gold text-neutral-500 transition-colors"
                              title="Print A5 Invoice"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Low stock alerts (Col 4) */}
              <div className="lg:col-span-4 bg-white rounded-lg border border-neutral-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-150">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900">
                    Stock Replenishment
                  </h3>
                </div>

                {lowStockProducts.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-6 text-center">
                    All inventory levels healthy.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {lowStockProducts.slice(0, 6).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-xs p-2 rounded bg-neutral-50 border border-neutral-150"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-neutral-900 truncate">{p.name}</p>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {p.item_code}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 ${
                            p.stock <= 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. ORDERS TAB ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter controls */}
            <div className="bg-white p-4 rounded-lg border border-neutral-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by Order #, customer name, phone..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-neutral-500 uppercase">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-neutral-300 rounded bg-white font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-neutral-200">
                  <thead className="bg-neutral-50 text-neutral-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Order # &amp; Date</th>
                      <th className="py-3 px-4">Customer &amp; Address</th>
                      <th className="py-3 px-4">Items Breakdown</th>
                      <th className="py-3 px-4">Total (LKR)</th>
                      <th className="py-3 px-4">Payment &amp; Waybill</th>
                      <th className="py-3 px-4">Status &amp; Workflow</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-150">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-400">
                          No orders found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const isConfirmedPaid =
                          order.status === 'confirmed' || order.payment_status === 'paid';

                        return (
                          <tr key={order.id} className="hover:bg-neutral-50/70">
                            {/* Order # & Date */}
                            <td className="py-4 px-4 align-top">
                              <span className="font-mono font-bold text-black text-sm block">
                                {order.order_number}
                              </span>
                              <span className="text-[11px] text-neutral-400 block mt-0.5">
                                {new Date(order.created_at).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </td>

                            {/* Customer & Address */}
                            <td className="py-4 px-4 align-top">
                              <span className="font-bold text-neutral-900 block">
                                {order.customer_name}
                              </span>
                              <span className="text-neutral-600 text-[11px] block">
                                Tel: {order.phone}
                              </span>
                              <span className="text-neutral-500 text-[11px] block mt-0.5">
                                {order.address}, {order.city} ({order.district})
                              </span>
                              {order.note && (
                                <span className="text-[10px] text-neutral-500 italic block mt-1">
                                  Note: {order.note}
                                </span>
                              )}
                            </td>

                            {/* Items Breakdown */}
                            <td className="py-4 px-4 align-top">
                              <div className="space-y-1 max-w-xs">
                                {order.items.map((it, idx) => (
                                  <div key={idx} className="text-[11px]">
                                    <span className="font-medium text-neutral-800">
                                      {it.qty}x {it.product_name_snapshot}
                                    </span>
                                    {it.variant_snapshot && (
                                      <span className="text-neutral-400 text-[10px] ml-1">
                                        (
                                        {Object.entries(it.variant_snapshot)
                                          .map(([k, v]) => `${k}:${v}`)
                                          .join(', ')}
                                        )
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>

                            {/* Total LKR */}
                            <td className="py-4 px-4 align-top">
                              <span className="font-mono font-bold text-black text-sm block">
                                Rs. {order.total_lkr.toLocaleString('en-US')}
                              </span>
                              <span className="text-[10px] text-neutral-400 block">
                                Subtotal: Rs. {order.subtotal_lkr.toLocaleString('en-US')}
                              </span>
                              <span className="text-[10px] text-neutral-400 block">
                                Delivery: Rs. {order.delivery_fee_lkr.toLocaleString('en-US')}
                              </span>
                            </td>

                            {/* Payment & Waybill Verification */}
                            <td className="py-4 px-4 align-top">
                              <div className="space-y-1.5">
                                <span className="text-[10px] text-neutral-500 block uppercase font-semibold">
                                  Bank Transfer
                                </span>
                                {isConfirmedPaid ? (
                                  <div>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      ✓ Paid &amp; Verified
                                    </span>
                                    {order.waybill_number && (
                                      <div className="flex items-center gap-1 font-mono text-[10px] text-neutral-700 mt-1">
                                        <Truck className="w-3 h-3 text-neutral-500" />
                                        <span>{order.waybill_number}</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <span className="inline-block text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded mb-1">
                                      ⏳ Slip Pending
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmPayment(order.id)}
                                      className="block w-full text-center px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold tracking-wider uppercase transition-colors shadow-xs"
                                    >
                                      ✓ Confirm Payment
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Status Dropdown */}
                            <td className="py-4 px-4 align-top">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                                }
                                className={`text-xs font-bold py-1 px-2.5 rounded border focus:outline-none ${
                                  order.status === 'confirmed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : order.status === 'pending'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : order.status === 'shipped'
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : order.status === 'cancelled'
                                    ? 'bg-red-50 text-red-800 border-red-300'
                                    : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>

                            {/* Actions: Print Invoice & WhatsApp Customer */}
                            <td className="py-4 px-4 align-top text-right space-x-2">
                              <button
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded text-xs font-bold tracking-wider uppercase transition-colors"
                                title="Print A5 Parcel Invoice & Waybill"
                              >
                                <Printer className="w-3.5 h-3.5 text-gold" />
                                <span>A5 Bill</span>
                              </button>

                              <a
                                href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Hello ${order.customer_name}, this is VELORA Sri Lanka regarding your order ${order.order_number}. Current status: ${order.status.toUpperCase()}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center p-1.5 bg-[#25D366] text-white rounded hover:bg-[#20b858] transition-colors"
                                title="Open Customer WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. PRODUCTS TAB ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Product search and filter */}
              <div className="flex flex-1 gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by name, SKU, brand..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded bg-white focus:outline-none"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-neutral-300 rounded bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Product Button */}
              <button
                onClick={() => {
                  setEditingProduct({
                    id: '',
                    name: '',
                    item_code: `VL-${Date.now().toString().slice(-4)}`,
                    brand: 'VELORA',
                    normal_price_lkr: 5000,
                    offer_price_lkr: null,
                    stock: 20,
                    category_id: categories[0]?.id || '',
                    subcategory_id: null,
                    is_active: true,
                    is_featured: false,
                    is_new: true,
                    is_best_seller: false,
                    images: [],
                    attributes: [],
                    options: [],
                    variants: [],
                  });
                  setIsProductModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-gold" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-neutral-200">
                  <thead className="bg-neutral-50 text-neutral-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">SKU / Code</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (LKR)</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-150">
                    {filteredProducts.map((p) => {
                      const img = p.images[0]?.thumbnail_url || p.images[0]?.image_url;
                      return (
                        <tr key={p.id} className="hover:bg-neutral-50/70">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-14 bg-neutral-100 rounded overflow-hidden shrink-0 border border-neutral-200">
                                {img && <img src={img} alt={p.name} className="w-full h-full object-cover" />}
                              </div>
                              <div>
                                <span className="font-bold text-neutral-900 block">{p.name}</span>
                                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">{p.brand}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-neutral-700">
                            {p.item_code}
                          </td>
                          <td className="py-3 px-4 text-neutral-600">
                            {p.category?.name || 'Unassigned'}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="font-bold text-black">
                              Rs. {(p.offer_price_lkr ?? p.normal_price_lkr).toLocaleString('en-US')}
                            </span>
                            {p.offer_price_lkr && (
                              <span className="block text-[10px] text-neutral-400 line-through">
                                Rs. {p.normal_price_lkr.toLocaleString('en-US')}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-bold ${
                                p.stock <= 0
                                  ? 'text-red-600'
                                  : p.stock <= 5
                                  ? 'text-amber-600'
                                  : 'text-neutral-800'
                              }`}
                            >
                              {p.stock} in stock
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.is_active
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-neutral-100 text-neutral-500'
                              }`}
                            >
                              {p.is_active ? 'Active' : 'Hidden'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct({ ...p });
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. CATEGORIES TAB ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-neutral-900">
                  Category Taxonomy
                </h2>
                <p className="text-xs text-neutral-500">
                  Manage major collections and subcategories reflected in the header mega menu.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory({
                    id: '',
                    name: '',
                    slug: '',
                    description: '',
                    image_url: '',
                    sort_order: categories.length + 1,
                    is_active: true,
                    parent_id: null,
                  });
                  setIsCategoryModalOpen(true);
                }}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-gold" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 shadow-xs divide-y divide-neutral-200">
              {categories
                .filter((c) => !c.parent_id)
                .map((cat) => (
                  <div key={cat.id} className="p-4 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-neutral-100 border border-neutral-200 overflow-hidden">
                          {cat.image_url && (
                            <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900">
                            {cat.name}
                          </h3>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            /{cat.slug}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory({ ...cat });
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-black"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subcategories list */}
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="pl-6 pt-2 border-l-2 border-gold/40 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Subcategories:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {cat.subcategories.map((sub) => (
                            <div
                              key={sub.id}
                              className="inline-flex items-center gap-2 px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-800"
                            >
                              <span>{sub.name}</span>
                              <button
                                onClick={() => {
                                  setEditingCategory({ ...sub });
                                  setIsCategoryModalOpen(true);
                                }}
                                className="text-neutral-400 hover:text-black"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(sub.id)}
                                className="text-neutral-400 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================= 5. STORE SETTINGS TAB ================= */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
            {/* Delivery Settings */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900 border-b pb-2">
                Islandwide Courier &amp; Delivery
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Islandwide Delivery Fee (LKR)
                  </label>
                  <input
                    type="number"
                    value={localSettings.delivery.islandwide_fee_lkr}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        delivery: {
                          ...prev.delivery,
                          islandwide_fee_lkr: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Estimated Delivery Timeline
                  </label>
                  <input
                    type="text"
                    value={localSettings.delivery.estimated_days}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        delivery: {
                          ...prev.delivery,
                          estimated_days: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={localSettings.delivery.delivery_enabled}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      delivery: {
                        ...prev.delivery,
                        delivery_enabled: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 rounded text-black"
                />
                <span>Enable Delivery calculation at checkout</span>
              </label>
            </div>

            {/* Announcement Bar Settings */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900 border-b pb-2">
                Announcement Bar
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                  Announcement Text
                </label>
                <input
                  type="text"
                  value={localSettings.announcement.text}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      announcement: {
                        ...prev.announcement,
                        text: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.announcement.enabled}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      announcement: {
                        ...prev.announcement,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 rounded text-black"
                />
                <span>Display Announcement Bar on storefront</span>
              </label>
            </div>

            {/* Hero Banner Settings */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900 border-b pb-2">
                Main Hero Banner
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={localSettings.hero.title}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, title: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Hero Subtitle
                  </label>
                  <input
                    type="text"
                    value={localSettings.hero.subtitle}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, subtitle: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>

                <div className="sm:col-span-2 space-y-4 pt-2">
                  <ImageUploadField
                    label="Desktop Hero Banner Image"
                    value={localSettings.hero.image_desktop}
                    onChange={(val) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, image_desktop: val },
                      }))
                    }
                    recommendedWidth={1920}
                    recommendedHeight={900}
                    aspectRatioLabel="16:9 / 21:9 Ultra-Wide"
                    maxDimension={1920}
                    description="Displays as the storefront main banner on desktop, laptop & tablet screens (width > 640px). Will be auto-optimized to high-speed WebP."
                    onToast={showToast}
                  />

                  <ImageUploadField
                    label="Mobile Hero Banner Image"
                    value={localSettings.hero.image_mobile || ''}
                    onChange={(val) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, image_mobile: val },
                      }))
                    }
                    recommendedWidth={1080}
                    recommendedHeight={1440}
                    aspectRatioLabel="3:4 / 9:16 Portrait"
                    maxDimension={1440}
                    description="Optimized vertical crop for mobile smartphones. If omitted, desktop banner auto-adapts."
                    optional={true}
                    onToast={showToast}
                  />
                </div>
              </div>
            </div>

            {/* Bank Transfer Details Settings */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-neutral-700" />
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900">
                    Online Bank Transfer Configuration
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Active Payment Gateway
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={localSettings.bank_transfer?.bank_name || ''}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        bank_transfer: {
                          ...(prev.bank_transfer || {
                            bank_name: '',
                            account_name: '',
                            account_number: '',
                            branch: '',
                            instructions: '',
                          }),
                          bank_name: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. Commercial Bank of Ceylon"
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={localSettings.bank_transfer?.branch || ''}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        bank_transfer: {
                          ...(prev.bank_transfer || {
                            bank_name: '',
                            account_name: '',
                            account_number: '',
                            branch: '',
                            instructions: '',
                          }),
                          branch: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. Colombo 07 / Main Corporate"
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={localSettings.bank_transfer?.account_name || ''}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        bank_transfer: {
                          ...(prev.bank_transfer || {
                            bank_name: '',
                            account_name: '',
                            account_number: '',
                            branch: '',
                            instructions: '',
                          }),
                          account_name: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. VELORA LIFESTYLE (PVT) LTD"
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Corporate Account Number
                  </label>
                  <input
                    type="text"
                    value={localSettings.bank_transfer?.account_number || ''}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        bank_transfer: {
                          ...(prev.bank_transfer || {
                            bank_name: '',
                            account_name: '',
                            account_number: '',
                            branch: '',
                            instructions: '',
                          }),
                          account_number: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. 1000 4829 1190"
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Customer Payment Instructions &amp; Verification Note
                  </label>
                  <textarea
                    rows={2}
                    value={localSettings.bank_transfer?.instructions || ''}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        bank_transfer: {
                          ...(prev.bank_transfer || {
                            bank_name: '',
                            account_name: '',
                            account_number: '',
                            branch: '',
                            instructions: '',
                          }),
                          instructions: e.target.value,
                        },
                      }))
                    }
                    placeholder="Instructions shown on checkout & success page..."
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded font-medium"
                  />
                </div>
              </div>
            </div>

            {/* General Brand Details */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900 border-b pb-2">
                Brand &amp; Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    WhatsApp International (No + or spaces)
                  </label>
                  <input
                    type="text"
                    value={localSettings.general.whatsapp}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        general: { ...prev.general, whatsapp: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    WhatsApp Display Text
                  </label>
                  <input
                    type="text"
                    value={localSettings.general.whatsapp_display}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        general: { ...prev.general, whatsapp_display: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={localSettings.general.email}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        general: { ...prev.general, email: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded shadow-md"
              >
                Save All Settings
              </button>

              <button
                type="button"
                onClick={handleResetDemoData}
                className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold rounded"
              >
                Reset to Demo Catalog
              </button>
            </div>
          </form>
        )}
      </main>

      {/* ================= PRODUCT EDIT / CREATE MODAL ================= */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col my-8">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-heading text-base font-bold uppercase tracking-wider text-neutral-900">
                {editingProduct.id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    SKU / Item Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.item_code || ''}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, item_code: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editingProduct.brand || 'VELORA'}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, brand: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Normal Price (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.normal_price_lkr || ''}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        normal_price_lkr: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Offer Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.offer_price_lkr ?? ''}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        offer_price_lkr: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Inventory Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock || 0}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        stock: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category_id || ''}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, category_id: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                      Product Images
                    </label>
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider bg-[#111] px-2 py-0.5 rounded border border-gold/30">
                      1200 × 1500 px (4:5)
                    </span>
                  </div>
                  <label className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-neutral-300 hover:border-black rounded cursor-pointer text-xs text-neutral-600 bg-neutral-50 transition-colors">
                    <Upload className="w-4 h-4 text-neutral-500" />
                    <span>{isUploadingImage ? 'Compressing WebP...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Uploaded image previews */}
              {editingProduct.images && editingProduct.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {editingProduct.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-20 bg-neutral-100 rounded border border-neutral-300 overflow-hidden shrink-0 group"
                    >
                      <img src={img.thumbnail_url || img.image_url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct((prev) => ({
                            ...prev,
                            images: prev?.images?.filter((_, idx) => idx !== i),
                          }))
                        }
                        className="absolute top-1 right-1 bg-black/80 text-white rounded p-0.5 opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                  Item Details / Specifications
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.item_details || ''}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({ ...prev, item_details: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded"
                  placeholder="Material: 100% French Terry Cotton, Care: Cold wash, Made in Sri Lanka"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active ?? true}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, is_active: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-black"
                  />
                  <span>Active on public store</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_new ?? false}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, is_new: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-black"
                  />
                  <span>New Drop</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_best_seller ?? false}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        is_best_seller: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-black"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border rounded text-xs font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CATEGORY EDIT / CREATE MODAL ================= */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900 border-b pb-2">
              {editingCategory.id ? 'Edit Category' : 'New Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    setEditingCategory((prev) => ({
                      ...prev,
                      name,
                      slug: prev?.slug ? prev.slug : slug,
                    }));
                  }}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                  Slug (URL Path)
                </label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) =>
                    setEditingCategory((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                  Parent Category (Optional)
                </label>
                <select
                  value={editingCategory.parent_id || ''}
                  onChange={(e) =>
                    setEditingCategory((prev) => ({
                      ...prev,
                      parent_id: e.target.value || null,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white"
                >
                  <option value="">None (Top Level Root Category)</option>
                  {categories
                    .filter((c) => !c.parent_id && c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <ImageUploadField
                label="Category Cover Image"
                value={editingCategory.image_url || ''}
                onChange={(val) =>
                  setEditingCategory((prev) => ({ ...prev, image_url: val }))
                }
                recommendedWidth={800}
                recommendedHeight={1000}
                aspectRatioLabel="4:5 Portrait"
                maxDimension={1200}
                description="Cover card image shown in storefront category collections and navigation."
                optional={true}
                onToast={showToast}
              />

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border rounded text-xs font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= A5 INVOICE MODAL ================= */}
      {selectedInvoiceOrder && (
        <A5Invoice
          order={selectedInvoiceOrder}
          settings={settings}
          onClose={() => setSelectedInvoiceOrder(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}
    </div>
  );
};
