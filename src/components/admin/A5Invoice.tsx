import React, { useState } from 'react';
import {
  Printer,
  X,
  Phone,
  MapPin,
  Truck,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  FileText,
  Tag,
} from 'lucide-react';
import { Order, SiteSettings } from '../../types';
import { VeloraLogo } from '../common/VeloraLogo';
import { WaybillBarcode } from './WaybillBarcode';
import { CourierShippingLabel } from './CourierShippingLabel';

interface A5InvoiceProps {
  order: Order;
  settings: SiteSettings;
  onClose: () => void;
  onConfirmPayment?: (orderId: string) => void;
}

export const A5Invoice: React.FC<A5InvoiceProps> = ({
  order,
  settings,
  onClose,
  onConfirmPayment,
}) => {
  const [activeView, setActiveView] = useState<'invoice' | 'waybill_label'>('invoice');

  const handlePrint = () => {
    window.print();
  };

  const isConfirmed = order.status === 'confirmed' || order.payment_status === 'paid';

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(order.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const confirmedDate = order.payment_confirmed_at
    ? new Date(order.payment_confirmed_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const waybill =
    order.waybill_number ||
    `VLR-${order.order_number.replace(/[^0-9]/g, '').slice(-8) || '9021849'}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      {/* Floating Action Controls (Hidden when printing) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 sm:gap-3 print:hidden">
        {/* Switcher: Invoice vs Waybill Label */}
        <div className="bg-neutral-900/90 border border-neutral-700 p-1 rounded-md flex items-center text-xs">
          <button
            type="button"
            onClick={() => setActiveView('invoice')}
            className={`px-3 py-1.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              activeView === 'invoice'
                ? 'bg-gold text-neutral-950 shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>A5 Invoice</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('waybill_label')}
            className={`px-3 py-1.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              activeView === 'waybill_label'
                ? 'bg-gold text-neutral-950 shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Parcel Waybill</span>
          </button>
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-neutral-900 text-white hover:bg-black text-xs font-bold uppercase tracking-wider rounded-md shadow-xl transition-all border border-gold/40 hover:border-gold active:scale-95"
        >
          <Printer className="w-4 h-4 text-gold" />
          <span>Print {activeView === 'invoice' ? 'A5 Invoice' : 'Waybill Label'}</span>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 sm:p-2.5 bg-white text-neutral-800 hover:text-black rounded-full shadow-xl transition-colors border border-neutral-300"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full flex flex-col items-center py-10 print:py-0">
        {/* Unconfirmed Payment Notice Bar (Screen only) */}
        {!isConfirmed && (
          <div className="w-full max-w-[148mm] mb-3 p-3 bg-amber-500/15 border border-amber-500/40 rounded text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Payment Pending:</strong> Customer paid via Online Bank Transfer. Please confirm payment once bank receipt is verified.
              </span>
            </div>
            {onConfirmPayment && (
              <button
                type="button"
                onClick={() => onConfirmPayment(order.id)}
                className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wider rounded transition-colors flex items-center gap-1 shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Payment Now</span>
              </button>
            )}
          </div>
        )}

        {/* Content Render: Either Dedicated Courier Label or Full A5 Invoice */}
        {activeView === 'waybill_label' ? (
          <div id="printable-waybill" className="print:m-0">
            <CourierShippingLabel order={order} settings={settings} />
          </div>
        ) : (
          /* ================= A5 PRINTABLE INVOICE SHEET ================= */
          <div
            id="printable-invoice"
            className="a5-invoice-sheet bg-white text-neutral-950 w-full max-w-[148mm] min-h-[210mm] p-6 sm:p-7 shadow-2xl rounded-sm print:shadow-none print:w-[148mm] print:min-h-[210mm] print:p-5 print:m-0 print:rounded-none flex flex-col justify-between font-sans leading-tight border border-neutral-200 print:border-none"
          >
            <div>
              {/* ================= 1. OFFICIAL BRAND HEADER ================= */}
              <div className="border-b-2 border-neutral-950 pb-3">
                <div className="flex justify-between items-start">
                  {/* Brand Identity */}
                  <div className="flex items-center gap-3">
                    <VeloraLogo variant="brand" height={48} />
                    <div className="border-l border-neutral-300 pl-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900 block">
                        VELORA SRI LANKA
                      </span>
                      <span className="text-[8.5px] font-medium text-neutral-600 block">
                        Haute Couture &amp; Lifestyle
                      </span>
                      <span className="text-[8px] font-serif italic text-neutral-500 block mt-0.5">
                        @velora.lk • velora.lk
                      </span>
                      <div className="text-[8px] text-neutral-600 mt-0.5">
                        <p>Hotline / WhatsApp: <strong>{settings.general.whatsapp_display}</strong></p>
                      </div>
                    </div>
                  </div>

                  {/* Document Status & Header */}
                  <div className="text-right">
                    <div
                      className={`inline-block font-heading text-[9.5px] font-bold px-2.5 py-1 tracking-widest uppercase rounded-xs ${
                        isConfirmed
                          ? 'bg-neutral-950 text-white'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {isConfirmed ? 'OFFICIAL TAX INVOICE' : 'PROFORMA / PENDING CONFIRMATION'}
                    </div>

                    <div className="mt-1.5 text-[9.5px] space-y-0.5">
                      <p>
                        <span className="text-neutral-500 uppercase text-[8px] font-semibold">Invoice No:</span>{' '}
                        <strong className="font-mono text-[10.5px] text-neutral-950 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                          {order.order_number}
                        </strong>
                      </p>
                      <p>
                        <span className="text-neutral-500 uppercase text-[8px]">Date:</span>{' '}
                        <strong>{formattedDate}</strong> <span className="text-neutral-500 text-[8px]">({formattedTime})</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verified Bank Payment Stamp Banner */}
                <div className="mt-2.5 pt-2 border-t border-dashed border-neutral-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isConfirmed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[9px] font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        ✓ PAYMENT CONFIRMED (ONLINE BANK TRANSFER)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-black uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3 text-amber-700" />
                        AWAITING BANK PAYMENT VERIFICATION
                      </span>
                    )}
                  </div>
                  <div className="text-[8.5px] text-neutral-600 font-mono">
                    {isConfirmed && confirmedDate ? `Verified: ${confirmedDate}` : 'Method: Online Bank Transfer'}
                  </div>
                </div>
              </div>

              {/* ================= 2. WAYBILL SCANNING & ROUTING SECTION ================= */}
              {/* Prominent, scan-ready waybill barcode and QR code */}
              <div className="mt-2.5 p-2.5 bg-neutral-50 border border-neutral-300 rounded-sm">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-200 text-[9px]">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-black" />
                    <span className="font-bold uppercase tracking-wider text-black">
                      COURIER WAYBILL &amp; DISPATCH ROUTING
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-neutral-500">Routing Zone:</span>
                    <strong className="bg-black text-white px-2 py-0.5 rounded font-mono text-[9px] uppercase">
                      {order.district}
                    </strong>
                  </div>
                </div>

                {/* High-Contrast Code128 SVG Barcode & QR Code */}
                <WaybillBarcode
                  waybillNumber={waybill}
                  height={38}
                  width={1.7}
                  showQr={true}
                  qrPayload={`https://track.velora.lk/waybill/${waybill}?order=${order.order_number}`}
                />

                <div className="mt-1.5 flex justify-between items-center text-[8px] text-neutral-600">
                  <div className="font-mono">
                    <span className="text-neutral-500">Waybill Consignment:</span>{' '}
                    <strong className="text-neutral-900 text-[9px]">{waybill}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500">Courier:</span>{' '}
                    <strong className="text-neutral-900">{order.courier_name || 'Islandwide Express Logistics'}</strong>
                  </div>
                </div>
              </div>

              {/* ================= 3. CONSIGNEE & DELIVERY DETAILS ================= */}
              <div className="mt-2.5 p-2.5 bg-neutral-50/60 border border-neutral-200 rounded-sm grid grid-cols-2 gap-3 text-[9.5px]">
                {/* Consignee */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-neutral-600 text-[8px] font-bold uppercase tracking-wider pb-0.5 border-b border-neutral-200">
                    <MapPin className="w-2.5 h-2.5 text-neutral-800" />
                    <span>Deliver To (Consignee):</span>
                  </div>
                  <p className="font-black text-xs text-neutral-950 pt-0.5">
                    {order.customer_name}
                  </p>
                  <p className="text-neutral-800 text-[9.5px] font-medium leading-tight">
                    {order.address}
                  </p>
                  <p className="text-neutral-900 font-bold text-[9px]">
                    {order.city}, {order.district} District
                  </p>
                </div>

                {/* Contact Phone Numbers */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-neutral-600 text-[8px] font-bold uppercase tracking-wider pb-0.5 border-b border-neutral-200">
                    <Phone className="w-2.5 h-2.5 text-neutral-800" />
                    <span>Customer Contact:</span>
                  </div>
                  <p className="pt-0.5 text-[9.5px]">
                    <span className="text-neutral-500">Primary Phone:</span>{' '}
                    <strong className="font-mono text-neutral-950 text-[10.5px]">
                      {order.phone}
                    </strong>
                  </p>
                  {order.whatsapp && order.whatsapp !== order.phone && (
                    <p className="text-[9px]">
                      <span className="text-neutral-500">WhatsApp:</span>{' '}
                      <strong className="font-mono text-neutral-800">{order.whatsapp}</strong>
                    </p>
                  )}
                  <p className="text-[8.5px] text-neutral-500 pt-0.5">
                    Instruction: Call customer upon arrival at doorstep.
                  </p>
                </div>
              </div>

              {/* Special Delivery Note */}
              {order.note && (
                <div className="mt-2 p-1.5 bg-amber-50/70 border border-amber-200 rounded-xs text-[9px] flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3 text-amber-700 shrink-0" />
                  <span className="text-amber-950 font-medium">
                    <strong className="uppercase font-bold text-[8px]">Rider Note:</strong> "{order.note}"
                  </span>
                </div>
              )}

              {/* ================= 4. ITEMIZED PRODUCT TABLE ================= */}
              <div className="mt-2.5">
                <table className="w-full text-left border-collapse text-[9px]">
                  <thead>
                    <tr className="bg-neutral-900 text-white font-bold uppercase text-[8px] tracking-wider">
                      <th className="py-1 px-1.5 text-center w-5">#</th>
                      <th className="py-1 px-1.5 w-18">SKU</th>
                      <th className="py-1 px-1.5">Item Description &amp; Variant</th>
                      <th className="py-1 px-1.5 text-right w-16">Unit (LKR)</th>
                      <th className="py-1 px-1.5 text-center w-8">Qty</th>
                      <th className="py-1 px-1.5 text-right w-20">Total (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 border-b border-neutral-300">
                    {order.items.map((item, index) => (
                      <tr key={index} className={index % 2 === 1 ? 'bg-neutral-50/40' : 'bg-white'}>
                        <td className="py-1.5 px-1.5 text-center font-mono text-neutral-500">{index + 1}</td>
                        <td className="py-1.5 px-1.5 font-mono font-bold text-neutral-900 text-[8.5px]">
                          {item.item_code_snapshot}
                        </td>
                        <td className="py-1.5 px-1.5">
                          <div className="font-bold text-neutral-950 text-[9.5px]">
                            {item.product_name_snapshot}
                          </div>
                          {item.variant_snapshot && Object.keys(item.variant_snapshot).length > 0 && (
                            <div className="text-[8px] text-neutral-600 flex flex-wrap gap-1 mt-0.5">
                              {Object.entries(item.variant_snapshot).map(([k, v]) => (
                                <span key={k} className="bg-neutral-100 px-1 py-0.2 rounded border border-neutral-200">
                                  {k}: {v}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-1.5 px-1.5 text-right font-mono text-neutral-800">
                          {item.unit_price_lkr.toLocaleString('en-US')}
                        </td>
                        <td className="py-1.5 px-1.5 text-center font-bold text-neutral-950 font-mono">
                          {item.qty}
                        </td>
                        <td className="py-1.5 px-1.5 text-right font-bold font-mono text-neutral-950 text-[10px]">
                          {item.line_total_lkr.toLocaleString('en-US')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ================= 5. FINANCIAL TOTALS & PREPAID CONFIRMATION ================= */}
            <div className="mt-2.5">
              <div className="flex justify-between items-start gap-4">
                {/* Official Bank Transfer Verification Note */}
                <div className="flex-1 space-y-1.5 text-[8.5px]">
                  <div className="p-2 border border-neutral-200 rounded-sm bg-neutral-50/70">
                    <div className="flex items-center gap-1 font-bold text-neutral-800 uppercase tracking-wider mb-1">
                      <Building2 className="w-3 h-3 text-neutral-600" />
                      <span>Payment Method Details:</span>
                    </div>
                    <p className="text-neutral-700">
                      Bank: <strong>{settings.bank_transfer?.bank_name || 'Commercial Bank of Ceylon'}</strong>
                    </p>
                    <p className="text-neutral-700">
                      Account: <strong>{settings.bank_transfer?.account_name || 'VELORA LIFESTYLE (PVT) LTD'}</strong>
                    </p>
                    <p className="text-neutral-600 font-mono mt-0.5">
                      Account No: {settings.bank_transfer?.account_number || '1000 4829 1190'}
                    </p>
                    {order.payment_reference && (
                      <p className="text-neutral-800 font-mono mt-1 pt-1 border-t border-neutral-200">
                        Transfer Ref / Slip: <strong>{order.payment_reference}</strong>
                      </p>
                    )}
                  </div>

                  {/* Certified Electronic Clearance Notice (NO SIGNATURES REQUIRED) */}
                  <div className="p-1.5 border border-neutral-200 rounded-xs bg-white text-neutral-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>
                      <strong>Certified Electronic Invoice:</strong> Authenticated digital billing. No physical customer or courier signature required.
                    </span>
                  </div>
                </div>

                {/* Total & Prepaid Amount Box */}
                <div className="w-56 space-y-1 text-[9.5px]">
                  <div className="flex justify-between text-neutral-600 pb-0.5">
                    <span>Subtotal:</span>
                    <span className="font-mono font-medium text-neutral-900">
                      Rs. {order.subtotal_lkr.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600 pb-0.5">
                    <span>Delivery Fee:</span>
                    <span className="font-mono font-medium text-neutral-900">
                      {order.delivery_fee_lkr > 0
                        ? `Rs. ${order.delivery_fee_lkr.toLocaleString('en-US')}`
                        : 'FREE'}
                    </span>
                  </div>

                  {/* High-Visibility Prepaid Box */}
                  <div
                    className={`p-2 rounded-sm border-2 ${
                      isConfirmed
                        ? 'bg-emerald-50/90 border-emerald-800 text-emerald-950'
                        : 'bg-amber-50/90 border-amber-800 text-amber-950'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[8.5px] uppercase font-bold tracking-wider">
                      <span>{isConfirmed ? 'TOTAL PAID IN FULL:' : 'PAYMENT DUE:'}</span>
                      <span className="font-mono font-black text-[8px]">
                        {isConfirmed ? 'PREPAID' : 'PENDING'}
                      </span>
                    </div>
                    <div className="text-right mt-0.5">
                      <span className="font-mono font-black text-sm sm:text-base">
                        Rs. {order.total_lkr.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="text-[7.5px] text-right mt-0.5 font-bold">
                      {isConfirmed
                        ? 'COURIER: PREPAID LUXURY PARCEL — ZERO CASH COLLECTION'
                        : 'Awaiting Bank Transfer slip confirmation.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= 6. STORE POLICIES & BRAND NOTE ================= */}
              <div className="mt-2.5 pt-2 border-t border-neutral-200 text-center text-[7.5px] text-neutral-500 leading-tight">
                <p className="font-bold text-neutral-900 uppercase tracking-wider">
                  THANK YOU FOR YOUR PATRONAGE • VELORA SRI LANKA
                </p>
                <p className="mt-0.5">
                  Size exchanges welcomed within 7 days in original packaging with tags intact. Contact WhatsApp:{' '}
                  <strong className="text-neutral-800">{settings.general.whatsapp_display}</strong> or Email:{' '}
                  <strong className="text-neutral-800">{settings.general.email}</strong>.
                </p>
                <p className="font-mono text-[7px] text-neutral-400 mt-0.5">
                  VELORA Commerce Cloud • Validated for Islandwide Courier Handover
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
