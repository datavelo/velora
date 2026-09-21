import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface WaybillBarcodeProps {
  waybillNumber: string;
  qrPayload?: string;
  height?: number;
  width?: number;
  showQr?: boolean;
}

export const WaybillBarcode: React.FC<WaybillBarcodeProps> = ({
  waybillNumber,
  qrPayload,
  height = 42,
  width = 1.6,
  showQr = true,
}) => {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (barcodeRef.current && waybillNumber) {
      try {
        JsBarcode(barcodeRef.current, waybillNumber, {
          format: 'CODE128',
          width: width,
          height: height,
          displayValue: true,
          font: 'monospace',
          fontSize: 11,
          textMargin: 3,
          margin: 6,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (err) {
        console.error('Failed to generate Code128 barcode:', err);
      }
    }
  }, [waybillNumber, height, width]);

  useEffect(() => {
    if (qrCanvasRef.current && showQr) {
      const payload = qrPayload || `https://track.velora.lk/waybill/${waybillNumber}`;
      QRCode.toCanvas(
        qrCanvasRef.current,
        payload,
        {
          width: 72,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        },
        (err) => {
          if (err) console.error('Failed to generate QR Code:', err);
        }
      );
    }
  }, [waybillNumber, qrPayload, showQr]);

  return (
    <div className="flex items-center gap-3 bg-white p-2 rounded border border-neutral-300">
      {/* Code128 Crisp SVG Barcode */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        <svg ref={barcodeRef} className="max-w-full h-auto" />
      </div>

      {/* Scannable QR Code */}
      {showQr && (
        <div className="shrink-0 flex flex-col items-center justify-center pl-2 border-l border-neutral-200">
          <canvas ref={qrCanvasRef} className="w-[68px] h-[68px] rounded-xs" />
          <span className="text-[7.5px] font-mono text-neutral-500 uppercase tracking-tighter mt-0.5">
            Scan to verify
          </span>
        </div>
      )}
    </div>
  );
};
