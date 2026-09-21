import React from 'react';
import { ArrowLeft, Truck, RefreshCw, Shield, FileText } from 'lucide-react';
import { SiteSettings } from '../types';

interface InfoPageProps {
  type: 'delivery' | 'returns' | 'privacy' | 'terms';
  settings: SiteSettings;
  onBack: () => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ type, settings, onBack }) => {
  const content = {
    delivery: {
      title: 'Islandwide Delivery Information',
      icon: <Truck className="w-8 h-8 text-gold" />,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          <p>
            At <strong>VELORA</strong>, we deliver to all 25 districts across Sri Lanka using our trusted express courier partners (Pronto Logistics, Prompt Xpress, Domex, and Courier LK).
          </p>
          <div className="bg-neutral-50 p-4 rounded border border-neutral-200 space-y-2">
            <h4 className="font-bold text-neutral-900 uppercase">Standard Delivery Rates</h4>
            <p>• Islandwide Flat Rate: <strong>Rs. {settings.delivery.islandwide_fee_lkr}</strong></p>
            <p>• Estimated Timeline: <strong>{settings.delivery.estimated_days}</strong></p>
            <p>• Colombo &amp; Suburbs: 1 - 2 Business Days</p>
            <p>• Outstation / Other Districts: 2 - 4 Business Days</p>
          </div>
          <p>
            Once your order is confirmed, our team will dispatch your parcel and provide an official courier waybill tracking number via WhatsApp.
          </p>
        </div>
      ),
    },
    returns: {
      title: 'Returns & Exchange Policy',
      icon: <RefreshCw className="w-8 h-8 text-gold" />,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          <p>
            We take great pride in the quality and craftsmanship of all VELORA products. If you are not completely satisfied with your size or fit, you may request an exchange within <strong>7 days</strong> of receiving your package.
          </p>
          <div className="bg-neutral-50 p-4 rounded border border-neutral-200 space-y-2">
            <h4 className="font-bold text-neutral-900 uppercase">Exchange Conditions</h4>
            <p>• Items must be unwashed, unworn, with all original tags attached.</p>
            <p>• Due to hygiene protocols, cosmetics, perfumes with opened seals, and intimate essentials cannot be returned.</p>
          </div>
          <p>
            To initiate an exchange, simply message our official WhatsApp concierge at <strong>{settings.general.whatsapp_display}</strong> with your order reference.
          </p>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      icon: <Shield className="w-8 h-8 text-gold" />,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          <p>
            Your privacy is of utmost importance to VELORA Sri Lanka. We strictly collect only the necessary details (name, contact numbers, and delivery address) required to process and dispatch your orders.
          </p>
          <p>
            We do not share, sell, or disclose your personal data to third parties, except to licensed courier services strictly for parcel delivery purposes.
          </p>
          <p>
            For any data requests or inquiries, reach out to <strong>{settings.general.email}</strong>.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms & Conditions',
      icon: <FileText className="w-8 h-8 text-gold" />,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          <p>
            All content, designs, imagery, and wordmarks associated with VELORA are the intellectual property of VELORA Sri Lanka.
          </p>
          <p>
            Product prices are displayed in Sri Lankan Rupees (LKR). While we strive for absolute accuracy, in the event of an inadvertent technical error, we reserve the right to correct prices before order dispatch.
          </p>
        </div>
      ),
    },
  }[type];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Store</span>
      </button>

      <div className="flex items-center gap-4 border-b border-neutral-200 pb-6 mb-8">
        <div className="p-3 bg-neutral-100 rounded-lg">{content.icon}</div>
        <h1 className="font-heading text-xl sm:text-3xl font-bold uppercase tracking-wider text-neutral-950">
          {content.title}
        </h1>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 shadow-xs">
        {content.body}
      </div>
    </div>
  );
};
