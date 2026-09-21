import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Order, SiteSettings } from '../../types';
import { Package, ShieldCheck, MapPin, Phone } from 'lucide-react';

interface CourierShippingLabelProps {
  order: Order;
  settings: SiteSettings;
}

export const CourierShippingLabel: React.FC<CourierShippingLabelProps> = ({ order, settings }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const waybill =
    order.waybill_number ||
    `VLR-${order.order_number.replace(/[^0-9]/g, '').slice(-8) || '9021849'}`;

  const isConfirmedPaid = order.status === 'confirmed' || order.payment_status === 'paid';

  useEffect(() => {
    if (barcodeRef.current && waybill) {
      try {
        JsBarcode(barcodeRef.current, waybill, {
          format: 'CODE128',
          width: 2.1,
          height: 52,
          displayValue: true,
          font: 'monospace',
          fontSize: 13,
          textMargin: 4,
          margin: 8,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (e) {
        console.error('Barcode render error', e);
      }
    }
  }, [waybill]);

  useEffect(() => {
    if (qrRef.current && waybill) {
      QRCode.toCanvas(
        qrRef.current,
        `https://track.velora.lk/waybill/${waybill}?order=${order.order_number}&customer=${encodeURIComponent(
          order.customer_name
        )}`,
        {
          width: 90,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        }
      );
    }
  }, [waybill, order.order_number, order.customer_name]);

  return (
    <div className="courier-waybill-label bg-white text-neutral-950 w-full max-w-[148mm] p-6 border-2 border-black rounded-none font-sans leading-tight print:border-2 print:border-black print:p-6 print:m-0 print:w-[148mm]">
      {/* Top Header: Courier & Routing */}
      <div className="border-b-2 border-black pb-3">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-heading font-black text-xl tracking-wider uppercase block">
              VELORA EXPRESS
            </span>
            <span className="text-[10px] font-bold text-neutral-600 tracking-widest uppercase block">
              Islandwide Doorstep Logistics Waybill
            </span>
          </div>
          <div className="text-right">
            <span className="inline-block bg-black text-white font-mono text-xs font-black px-3 py-1 uppercase tracking-wider">
              {order.district.toUpperCase()}
            </span>
            <span className="block font-mono text-[9px] text-neutral-500 mt-1">
              Ref: {order.order_number}
            </span>
          </div>
        </div>
      </div>

      {/* Barcode & QR Code Section (Primary Scan Target) */}
      <div className="py-4 border-b-2 border-black flex items-center justify-between gap-4 bg-neutral-50/50 px-2">
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
            Courier Waybill Consignment ID (Scan Barcode)
          </span>
          <svg ref={barcodeRef} className="max-w-full h-auto bg-white border border-neutral-300 p-1" />
        </div>
        <div className="shrink-0 flex flex-col items-center pl-3 border-l border-neutral-300">
          <canvas ref={qrRef} className="w-[84px] h-[84px] bg-white border border-neutral-300 p-1" />
          <span className="text-[8px] font-mono text-neutral-600 uppercase tracking-tight mt-1 font-bold">
            Mobile Scan QR
          </span>
        </div>
      </div>

      {/* Payment & Cash Collection Notice (PREPAID - ZERO CASH) */}
      <div className="py-3 border-b-2 border-black">
        <div
          className={`p-3 border-2 flex items-center justify-between ${
            isConfirmedPaid
              ? 'bg-emerald-50 border-emerald-800 text-emerald-950'
              : 'bg-amber-50 border-amber-800 text-amber-950'
          }`}
        >
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider block">
              COURIER CASH COLLECTION STATUS:
            </span>
            <span className="font-black text-base sm:text-lg tracking-wide uppercase block">
              {isConfirmedPaid ? 'PREPAID — DO NOT COLLECT CASH' : 'PAYMENT PENDING CONFIRMATION'}
            </span>
            <span className="text-[10px] font-medium block">
              Payment Method: Online Bank Transfer to VELORA (Confirmed)
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-neutral-600 block">
              Cash Due at Doorstep
            </span>
            <span className="font-mono font-black text-xl block">
              {isConfirmedPaid ? 'Rs. 0.00' : `Rs. ${order.total_lkr.toLocaleString('en-US')}`}
            </span>
          </div>
        </div>
      </div>

      {/* Deliver To (Consignee) Details */}
      <div className="py-3 border-b-2 border-black grid grid-cols-12 gap-3 text-xs">
        <div className="col-span-12">
          <div className="flex items-center gap-1.5 text-neutral-600 text-[10px] font-black uppercase tracking-wider pb-1">
            <MapPin className="w-3.5 h-3.5 text-black" />
            <span>Deliver To (Consignee):</span>
          </div>
          <p className="font-black text-base text-black mt-0.5">
            {order.customer_name}
          </p>
          <p className="font-semibold text-neutral-900 text-sm mt-1 leading-snug">
            {order.address}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded font-bold text-xs">
              City: {order.city}
            </span>
            <span className="bg-black text-white px-2 py-0.5 rounded font-bold text-xs uppercase">
              District: {order.district}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Phones & Instructions */}
      <div className="py-3 border-b-2 border-black grid grid-cols-2 gap-4 text-xs">
        <div>
          <div className="flex items-center gap-1 text-neutral-600 text-[10px] font-bold uppercase pb-1">
            <Phone className="w-3 h-3 text-black" />
            <span>Customer Contact:</span>
          </div>
          <p className="font-mono font-black text-base text-black">
            {order.phone}
          </p>
          {order.whatsapp && order.whatsapp !== order.phone && (
            <p className="font-mono text-xs text-neutral-700 mt-0.5">
              WhatsApp: {order.whatsapp}
            </p>
          )}
        </div>

        <div>
          <span className="text-neutral-600 text-[10px] font-bold uppercase block pb-1">
            Courier Partner:
          </span>
          <p className="font-bold text-xs text-neutral-900">
            {order.courier_name || 'Islandwide Express Logistics'}
          </p>
          <p className="text-[10px] text-neutral-600 mt-0.5">
            Service: Doorstep Air/Express Delivery
          </p>
        </div>
      </div>

      {/* Rider Special Instruction if any */}
      {order.note && (
        <div className="py-2.5 px-3 bg-neutral-100 border-b-2 border-black text-xs">
          <strong className="text-neutral-800 uppercase font-black text-[10px] block">
            Special Delivery Notes:
          </strong>
          <p className="italic font-medium text-neutral-900 mt-0.5">"{order.note}"</p>
        </div>
      )}

      {/* Package Contents Snapshot & Pieces */}
      <div className="py-2.5 border-b-2 border-black flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-neutral-700" />
          <span className="font-bold">
            Contents: Luxury Apparel ({order.items.reduce((acc, it) => acc + it.qty, 0)} Pcs)
          </span>
        </div>
        <div className="font-mono text-[11px] text-neutral-600">
          Weight: Approx 0.5 - 1.0 kg
        </div>
      </div>

      {/* Sender Information & Return Address */}
      <div className="pt-3 flex justify-between items-end text-[10px] text-neutral-600">
        <div>
          <strong className="text-black uppercase font-bold block text-[11px]">
            Shipped From (Sender):
          </strong>
          <p className="font-semibold text-neutral-800">
            VELORA SRI LANKA (PVT) LTD
          </p>
          <p>Luxury Fulfilment Center, Colombo 07</p>
          <p>Tel / WhatsApp: {settings.general.whatsapp_display}</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 font-bold text-neutral-800">
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            Verified Authentic
          </span>
          <p className="text-[9px] text-neutral-500 mt-0.5">
            Date: {new Date(order.created_at).toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>
    </div>
  );
};
