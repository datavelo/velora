import React from 'react';
import { MessageCircle, Mail, ArrowUpRight, Lock, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../../types';
import { VeloraLogo } from '../common/VeloraLogo';
import { GoogleSignInButton, GoogleIcon } from '../auth/GoogleSignInButton';
import { useAuth } from '../../context/AuthContext';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  return (
    <footer className="bg-[#0c0c0c] text-neutral-300 border-t border-neutral-800 pt-16 pb-12">
      <div className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4 pr-4">
            <div className="cursor-pointer inline-block" onClick={() => onNavigate('/')}>
              <VeloraLogo variant="full" theme="dark" height={56} className="items-start text-left" />
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              Sri Lanka's premier destination for minimalist haute couture, technical athleisure,
              designer eyewear, and artisanal fragrances. Handcrafted for modern elegance.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={settings.general.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:border-gold transition-colors text-xs font-semibold"
                aria-label="Facebook"
              >
                FB
              </a>
              <a
                href={settings.general.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:border-gold transition-colors text-xs font-semibold"
                aria-label="Instagram"
              >
                IG
              </a>
              <a
                href={`https://wa.me/${settings.general.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:border-gold transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-gold" />
              </a>
            </div>
          </div>

          {/* Col 2: Collections */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold tracking-widest text-white uppercase">Collections</h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <button onClick={() => onNavigate('/category/women')} className="hover:text-white transition-colors">
                  Women's Wear
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/category/men')} className="hover:text-white transition-colors">
                  Men's Active &amp; Casual
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/category/sunglasses')} className="hover:text-white transition-colors">
                  Titanium Sunglasses
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/category/perfumes')} className="hover:text-white transition-colors">
                  Artisanal Perfumes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/category/accessories')} className="hover:text-white transition-colors">
                  Lifestyle Accessories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/category/cosmetics')} className="hover:text-white transition-colors">
                  Cosmetics &amp; Skincare
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold tracking-widest text-white uppercase">Customer Care</h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <button onClick={() => onNavigate('/delivery-info')} className="hover:text-white transition-colors">
                  Islandwide Delivery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/returns-info')} className="hover:text-white transition-colors">
                  Returns &amp; Exchanges
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li className="pt-1">
                <button
                  onClick={() => onNavigate('/admin')}
                  className="hover:text-gold text-neutral-400 transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-gold" />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Contact */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold tracking-widest text-white uppercase">Direct Contact</h4>
            <div className="space-y-3 text-sm text-neutral-400">
              <a
                href={`https://wa.me/${settings.general.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors group"
              >
                <MessageCircle className="w-4 h-4 text-gold shrink-0" />
                <span>WhatsApp: {settings.general.whatsapp_display}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href={`mailto:${settings.general.email}`}
                className="flex items-center gap-2 hover:text-white transition-colors break-all group"
              >
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span>{settings.general.email}</span>
              </a>
              <div className="pt-2 text-xs text-neutral-400 space-y-1">
                <p className="font-medium text-neutral-300">VELORA Luxury Boutique &amp; Dispatch Hub</p>
                <p>Monday - Saturday: 9:00 AM - 7:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Sign-In & Verification Ribbon at the bottom */}
        <div className="py-6 border-b border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
              <GoogleIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                  Google Account Sign-In
                </h5>
                <span className="bg-neutral-800 text-neutral-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-neutral-700">
                  Instant Sync
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Sign in with your Google account for 1-tap fast checkout, parcel tracking, and verified admin access.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <GoogleSignInButton
              variant="light"
              size="sm"
              onSuccess={() => {
                // If user is admin, they can easily access admin portal
              }}
            />
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-neutral-400">
          <p>© {new Date().getFullYear()} VELORA SRI LANKA. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-400">
            <span>Fast Express Courier</span>
            <span>•</span>
            <span>Islandwide Delivery</span>
            <span>•</span>
            <span>Secure WhatsApp Checkout</span>
            <span>•</span>
            <button
              onClick={() => onNavigate('/admin')}
              className="text-neutral-400 hover:text-gold transition-colors flex items-center gap-1 font-medium"
            >
              <Lock className="w-3 h-3 text-gold" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
