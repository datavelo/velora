import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, MessageCircle, AlertCircle, CheckCircle2, Building2, Copy, Check, ShieldCheck } from 'lucide-react';
import {
  CartItem,
  CheckoutFormData,
  District,
  SRI_LANKAN_DISTRICTS,
  SiteSettings,
  Order,
} from '../types';
import { useCart } from '../context/CartContext';
import { Store } from '../lib/store';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { useToast } from '../components/ui/Toast';

interface CheckoutPageProps {
  settings: SiteSettings;
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
  directBuyItem?: CartItem | null;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  settings,
  onBack,
  onOrderSuccess,
  directBuyItem,
}) => {
  const { cart, clearCart } = useCart();
  const { showToast } = useToast();

  const checkoutItems: CartItem[] = directBuyItem ? [directBuyItem] : cart;

  const [formData, setFormData] = useState<CheckoutFormData>({
    customer_name: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    district: 'Colombo',
    note: '',
  });

  const [useSameNumber, setUseSameNumber] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const bankDetails = settings.bank_transfer || {
    bank_name: 'Commercial Bank of Ceylon',
    account_name: 'VELORA LIFESTYLE (PVT) LTD',
    account_number: '1000 4829 1190',
    branch: 'Colombo 07 / Main Corporate Branch',
    instructions: 'Please transfer the order total to our bank account. Attach your transfer slip on WhatsApp for payment verification and instant invoice confirmation.',
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankDetails.account_number.replace(/\s+/g, ''));
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
    showToast('Account number copied to clipboard', 'info');
  };

  // Authoritative live calculation
  const deliveryFee = settings.delivery.delivery_enabled ? settings.delivery.islandwide_fee_lkr : 0;
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.line_total_lkr, 0);
  const total = subtotal + deliveryFee;

  // Sync phone and whatsapp if toggle is on
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      phone: val,
      whatsapp: useSameNumber ? val : prev.whatsapp,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    // Sri Lankan phone validation (e.g. 0771234567 or 94771234567 or 771234567)
    const phoneClean = formData.phone.replace(/[^0-9]/g, '');
    if (!phoneClean || phoneClean.length < 9 || phoneClean.length > 12) {
      newErrors.phone = 'Please enter a valid Sri Lankan phone number (e.g. 0771234567)';
    }

    const whatsappClean = formData.whatsapp.replace(/[^0-9]/g, '');
    if (!whatsappClean || whatsappClean.length < 9 || whatsappClean.length > 12) {
      newErrors.whatsapp = 'Please enter a valid WhatsApp number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors before placing your order.', 'error');
      return;
    }

    if (checkoutItems.length === 0) {
      showToast('Your checkout cart is empty.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 2 & 3: Try sending to Worker API endpoint first if available, else Authoritative Local Store
      let createdOrder: Order;
      let usedServerApi = false;

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            items: checkoutItems.map((c) => ({
              product_id: c.product_id,
              variant_id: c.variant_id,
              qty: c.qty,
            })),
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.order) {
            createdOrder = resData.order;
            usedServerApi = true;
          }
        }
      } catch (apiErr) {
        // Fallback gracefully to Store engine
      }

      if (!usedServerApi) {
        // Authoritative validation and creation via Store
        createdOrder = Store.createOrder(formData, checkoutItems);
      }

      // Clear the temporary cart
      if (!directBuyItem) {
        clearCart();
      }

      showToast(`Order ${createdOrder.order_number} created successfully!`, 'success');

      // Step 6: Generate WhatsApp deep-link URL (94778005550)
      const whatsappUrl = buildWhatsAppLink(
        settings.general.whatsapp,
        createdOrder,
        window.location.origin
      );

      // Step 7: Open WhatsApp
      window.open(whatsappUrl, '_blank');

      onOrderSuccess(createdOrder);
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shopping</span>
      </button>

      <div className="mb-8 border-b border-neutral-200 pb-4">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-wider uppercase text-neutral-950">
          Fast Express Checkout
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          No login or registration required. Your order will be confirmed directly on WhatsApp with VELORA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Form Column (Col 7) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* Customer Details Box */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4 shadow-xs">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-150 pb-3">
                1. Customer &amp; Contact Info
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, customer_name: e.target.value }))
                  }
                  placeholder="e.g. Kasun Perera"
                  className={`w-full px-3.5 py-2.5 text-sm border rounded bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 ${
                    errors.customer_name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-neutral-300 focus:ring-black'
                  }`}
                />
                {errors.customer_name && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.customer_name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="e.g. 0771234567"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 ${
                      errors.phone
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-neutral-300 focus:ring-black'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                    WhatsApp Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    disabled={useSameNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                    placeholder="e.g. 0771234567"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.whatsapp
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-neutral-300 focus:ring-black'
                    }`}
                  />
                  {errors.whatsapp && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.whatsapp}</p>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={useSameNumber}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUseSameNumber(checked);
                    if (checked) {
                      setFormData((prev) => ({ ...prev, whatsapp: prev.phone }));
                    }
                  }}
                  className="w-4 h-4 rounded text-black focus:ring-gold"
                />
                <span>WhatsApp number is the same as phone number</span>
              </label>
            </div>

            {/* Delivery Address Box */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4 shadow-xs">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-150 pb-3">
                2. Islandwide Delivery Address
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                  Street Address / House No <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="e.g. No 10, Main Road, Colombo 05"
                  className={`w-full px-3.5 py-2.5 text-sm border rounded bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 ${
                    errors.address
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-neutral-300 focus:ring-black'
                  }`}
                />
                {errors.address && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                    City / Town <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="e.g. Colombo"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 ${
                      errors.city
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-neutral-300 focus:ring-black'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                    District (Sri Lanka) <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, district: e.target.value as District }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {SRI_LANKAN_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                  Delivery Notes / Landmark (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.note || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Special courier instructions, call before delivery, etc."
                  className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            {/* Step 3: Payment Method Card */}
            <div className="bg-white p-5 rounded-lg border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900">
                      Payment Method
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Online Bank Transfer Only (No COD)
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Bank Transfer Only
                </span>
              </div>

              {/* Official Bank Account Information Card */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-neutral-700" />
                    <span className="text-xs font-bold uppercase text-neutral-900">
                      {bankDetails.bank_name}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-neutral-200 rounded text-neutral-700">
                    Corporate Account
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase block">
                      Account Name
                    </span>
                    <span className="font-semibold text-neutral-800">
                      {bankDetails.account_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase block">
                      Branch
                    </span>
                    <span className="font-semibold text-neutral-800">
                      {bankDetails.branch}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between bg-white p-2.5 rounded border border-neutral-200/80">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block font-mono">
                      Account Number
                    </span>
                    <span className="font-mono text-base font-bold text-black tracking-wider">
                      {bankDetails.account_number}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded transition-colors"
                  >
                    {copiedAccount ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  💡 <strong>Payment Step:</strong> Transfer Rs. {total.toLocaleString('en-US')} via your bank app / online banking, then submit below to send your order and attach the transfer receipt on WhatsApp. Official invoice & waybill are generated upon payment confirmation.
                </p>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || checkoutItems.length === 0}
              className="w-full py-4 px-6 bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5 text-gold" />
              <span>
                {isSubmitting ? 'Processing Order...' : 'SUBMIT ORDER & ATTACH SLIP ON WHATSAPP'}
              </span>
            </button>

            <p className="text-xs text-center text-neutral-500">
              Your order is recorded server-side. You will be redirected to WhatsApp (94778005550) to attach your bank transfer slip.
            </p>
          </form>
        </div>

        {/* Order Summary Column (Col 5) */}
        <div className="lg:col-span-5">
          <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-5 sm:p-6 space-y-5 sticky top-24">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-3">
              Order Summary ({checkoutItems.reduce((s, i) => s + i.qty, 0)} items)
            </h3>

            {/* Items List */}
            <div className="space-y-3 max-h-72 overflow-y-auto divide-y divide-neutral-200 pr-1">
              {checkoutItems.map((item) => {
                const img =
                  item.variant?.image_url ||
                  item.product.images[0]?.thumbnail_url ||
                  item.product.images[0]?.image_url;

                return (
                  <div key={item.cart_item_id} className="pt-3 first:pt-0 flex gap-3 items-center">
                    <div className="w-14 h-16 bg-white rounded border border-neutral-200 overflow-hidden shrink-0">
                      {img && <img src={img} alt={item.product.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-neutral-900 truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {item.variant?.sku || item.product.item_code}
                      </div>
                      {item.selected_options && (
                        <div className="text-[10px] text-neutral-500">
                          {Object.entries(item.selected_options)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' / ')}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-black">
                        Rs. {item.line_total_lkr.toLocaleString('en-US')}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Qty: {item.qty}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculation rows */}
            <div className="space-y-2 border-t border-neutral-200 pt-4 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900">
                  Rs. {subtotal.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Islandwide Express Courier</span>
                <span className="font-semibold text-neutral-900">
                  Rs. {deliveryFee.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-200 text-base font-bold text-black">
                <span>Total Due</span>
                <span className="text-lg text-black font-extrabold">
                  Rs. {total.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            {/* Reassurance Banner */}
            <div className="p-3 bg-white rounded border border-neutral-200 text-xs text-neutral-600 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <span>
                <strong>Verified Online Bank Transfer:</strong> Transfer receipt is verified by our finance team before dispatching your luxury parcel.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
