import React, { useState } from 'react';
import {
  CheckCircle,
  MessageCircle,
  ArrowRight,
  Home,
  Package,
  Printer,
  Building2,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Order, SiteSettings } from '../../src/types';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { VeloraLogo } from '../components/common/VeloraLogo';
import { A5Invoice } from '../components/admin/A5Invoice';

interface OrderSuccessPageProps {
  order: Order;
  settings: SiteSettings;
  onNavigateHome: () => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  order,
  settings,
  onNavigateHome,
}) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const isConfirmed = order.status === 'confirmed' || order.payment_status === 'paid';

  const bankDetails = settings.bank_transfer || {
    bank_name: 'Commercial Bank of Ceylon',
    account_name: 'VELORA LIFESTYLE (PVT) LTD',
    account_number: '1000 4829 1190',
    branch: 'Colombo 07 / Main Corporate Branch',
    instructions:
      'Please transfer the exact order total to our bank account. Send your payment slip on WhatsApp for instant confirmation.',
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankDetails.account_number.replace(/\s+/g, ''));
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const whatsappUrl = buildWhatsAppLink(
    settings.general.whatsapp,
    order,
    window.location.origin
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-24 text-center">
      <div className="mb-6 flex justify-center">
        <VeloraLogo variant="brand" height={60} />
      </div>

      <div className="w-14 h-14 bg-black text-gold rounded-full flex items-center justify-center mx-auto mb-5 shadow-md border border-gold/40">
        <CheckCircle className="w-7 h-7" />
      </div>

      <span className="text-xs font-bold text-gold tracking-widest uppercase">
        {isConfirmed ? 'ORDER & PAYMENT CONFIRMED' : 'ORDER PLACED • PAYMENT PENDING'}
      </span>
      <h1 className="font-heading text-2xl sm:text-4xl font-bold uppercase tracking-wider text-neutral-950 mt-1 mb-3">
        THANK YOU FOR CHOOSING VELORA
      </h1>
      <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
        {isConfirmed
          ? 'Your payment has been verified by our team. Your order is confirmed and scheduled for courier dispatch.'
          : 'Your order is recorded. Please complete the bank transfer below and send the payment slip via WhatsApp to certify your official invoice & waybill.'}
      </p>

      {/* Order Reference Box */}
      <div className="my-6 p-5 sm:p-6 bg-neutral-50 rounded-lg border border-neutral-200 inline-block text-left w-full max-w-lg">
        <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
          <span className="text-xs text-neutral-500 uppercase font-semibold">Order Reference:</span>
          <span className="font-mono text-sm sm:text-base font-extrabold text-black">
            {order.order_number}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 text-xs text-neutral-600">
          <span>Customer:</span>
          <span className="font-medium text-black">{order.customer_name}</span>
        </div>
        <div className="flex justify-between items-center py-2 text-xs text-neutral-600">
          <span>Delivery Destination:</span>
          <span className="font-medium text-black">{order.city}, {order.district}</span>
        </div>
        <div className="flex justify-between items-center py-2 text-xs text-neutral-600">
          <span>Payment Method:</span>
          <span className="font-semibold text-neutral-900">Online Bank Transfer</span>
        </div>
        <div className="flex justify-between items-center py-2 text-xs text-neutral-600">
          <span>Payment Status:</span>
          <span
            className={`font-bold uppercase text-[11px] px-2 py-0.5 rounded ${
              isConfirmed
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isConfirmed ? '✓ Confirmed (Paid)' : 'Pending Bank Slip'}
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-neutral-200 font-bold text-sm text-black">
          <span>Total Payable:</span>
          <span className="text-base text-gold font-extrabold">
            Rs. {order.total_lkr.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* Bank Transfer Payment Card (Shown to customer) */}
      {!isConfirmed && (
        <div className="my-4 max-w-lg mx-auto bg-amber-50/70 border border-amber-300 rounded-lg p-5 text-left space-y-3.5">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-800" />
              <span className="font-heading font-bold text-sm uppercase tracking-wide text-amber-950">
                Official Bank Account Details
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
              CEFT / SLIPS / ONLINE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-800">
            <div>
              <span className="text-neutral-500 text-[10px] uppercase block">Bank Name</span>
              <span className="font-bold text-neutral-900">{bankDetails.bank_name}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] uppercase block">Branch</span>
              <span className="font-bold text-neutral-900">{bankDetails.branch}</span>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <span className="text-neutral-500 text-[10px] uppercase block">Account Holder</span>
              <span className="font-bold text-neutral-900">{bankDetails.account_name}</span>
            </div>
          </div>

          {/* Account Number with 1-click Copy */}
          <div className="flex items-center justify-between bg-white p-3 rounded border border-amber-300">
            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-500 block">
                Account Number (Tap to Copy)
              </span>
              <span className="font-mono text-base font-black text-black tracking-wider">
                {bankDetails.account_number}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyAccount}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded transition-colors"
            >
              {copiedAccount ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-neutral-700" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] text-amber-900 bg-amber-100/80 p-2.5 rounded space-y-1">
            <p className="font-bold">📋 Next Steps to Confirm Order:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-amber-950">
              <li>Transfer <strong>Rs. {order.total_lkr.toLocaleString('en-US')}</strong> to the account above.</li>
              <li>Click the green WhatsApp button below and attach the deposit receipt / screenshot.</li>
              <li>Our team will verify the payment and generate your official Paid Tax Invoice &amp; Courier Waybill.</li>
            </ol>
          </div>
        </div>
      )}

      {/* WhatsApp Action Call */}
      <div className="space-y-3.5 max-w-md mx-auto mt-6">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20b858] text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded-md shadow-lg flex items-center justify-center gap-2.5 transition-all"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>SEND BANK SLIP ON WHATSAPP</span>
        </a>

        <button
          onClick={() => setShowInvoice(true)}
          className="w-full py-3 px-6 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 border border-gold/40"
        >
          <Printer className="w-4 h-4 text-gold" />
          <span>
            {isConfirmed ? 'View & Print Official Paid A5 Invoice' : 'View Proforma Invoice / Waybill'}
          </span>
        </button>

        <button
          onClick={onNavigateHome}
          className="w-full py-3 px-6 bg-white border border-neutral-300 hover:border-black text-neutral-800 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Continue Exploring VELORA</span>
        </button>
      </div>

      {/* Items Snapshot Breakdown */}
      <div className="mt-12 text-left bg-white rounded-lg border border-neutral-200 p-6 space-y-4 max-w-lg mx-auto">
        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-800 border-b pb-2">
          Ordered Items Snapshot
        </h3>
        <div className="divide-y divide-neutral-150">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-neutral-900">{item.product_name_snapshot}</span>
                <span className="block text-neutral-400 font-mono text-[10px]">{item.item_code_snapshot}</span>
                {item.variant_snapshot && (
                  <span className="block text-neutral-500 text-[11px]">
                    {Object.entries(item.variant_snapshot).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="font-semibold text-black">
                  Rs. {item.line_total_lkr.toLocaleString('en-US')}
                </span>
                <span className="block text-neutral-400 text-[10px]">Qty: {item.qty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <A5Invoice
          order={order}
          settings={settings}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};
