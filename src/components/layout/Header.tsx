import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Category, SiteSettings } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { VeloraLogo } from '../common/VeloraLogo';
import { GoogleIcon } from '../auth/GoogleSignInButton';

interface HeaderProps {
  categories: Category[];
  settings: SiteSettings;
  onNavigate: (path: string) => void;
  currentPath: string;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  settings,
  onNavigate,
  currentPath,
  onOpenSearch,
}) => {
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  // Split announcement by bullet point for mobile carousel
  const announcementItems = React.useMemo(() => {
    if (!settings.announcement?.text) return [];
    if (settings.announcement.text.includes('•')) {
      return settings.announcement.text
        .split('•')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [settings.announcement.text];
  }, [settings.announcement?.text]);

  useEffect(() => {
    if (announcementItems.length <= 1) return;
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcementItems.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [announcementItems.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter root active categories
  const rootCategories = categories
    .filter((c) => !c.parent_id && c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  // Desktop priority categories
  const primaryCategories = rootCategories.slice(0, 6);
  const secondaryCategories = rootCategories.slice(6);

  const toggleMobileCategory = (catId: string) => {
    setExpandedMobileCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleLinkClick = (path: string) => {
    setActiveMegaMenu(null);
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* 1. Announcement Bar */}
      {settings.announcement?.enabled && (
        <div className="bg-[#0e0e0e] text-neutral-300 border-b border-neutral-800">
          {/* Mobile view: Clean, single-line carousel that never overflows or wraps awkwardly */}
          <div className="flex sm:hidden items-center justify-between h-9 px-3 w-full">
            <button
              onClick={() => setAnnouncementIndex((prev) => (prev - 1 + announcementItems.length) % announcementItems.length)}
              className="text-neutral-400 hover:text-white p-1 transition-colors"
              aria-label="Previous announcement"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1 flex items-center justify-center gap-2 overflow-hidden px-1 text-center">
              <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 animate-pulse"></span>
              <span className="text-[11px] font-semibold tracking-wider text-neutral-100 uppercase truncate">
                {announcementItems[announcementIndex] || settings.announcement.text}
              </span>
            </div>
            <button
              onClick={() => setAnnouncementIndex((prev) => (prev + 1) % announcementItems.length)}
              className="text-neutral-400 hover:text-white p-1 transition-colors"
              aria-label="Next announcement"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop view: Centered luxury banner with generous space */}
          <div className="hidden sm:flex items-center justify-center gap-2.5 py-2.5 px-6 text-xs lg:text-[13px] tracking-widest uppercase font-medium text-center">
            <span className="w-2 h-2 rounded-full bg-gold inline-block animate-pulse shrink-0"></span>
            <span>{settings.announcement.text}</span>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div
        className={`w-full bg-white/95 backdrop-blur-md transition-all duration-300 border-b ${
          isScrolled ? 'border-neutral-200 shadow-sm py-3' : 'border-neutral-150 py-4.5'
        }`}
      >
        <div className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between">
          {/* Mobile Hamburger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-neutral-900 hover:text-black focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={onOpenSearch}
              className="p-2 ml-1 text-neutral-900 hover:text-black focus:outline-none"
              aria-label="Search items"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center cursor-pointer transition-transform duration-200 hover:scale-[1.02]" onClick={() => handleLinkClick('/')}>
            <VeloraLogo variant="wordmark" height={36} />
          </div>

          {/* Desktop Navigation Links */}
          <nav
            ref={navRef}
            className="hidden lg:flex items-center space-x-1 xl:space-x-3 text-sm font-semibold tracking-wider text-neutral-900"
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            {primaryCategories.map((category) => {
              const hasSubs = category.subcategories && category.subcategories.length > 0;
              const isActive = currentPath === `/category/${category.slug}`;

              return (
                <div
                  key={category.id}
                  className="relative py-2"
                  onMouseEnter={() => hasSubs && setActiveMegaMenu(category.id)}
                >
                  <button
                    onClick={() => handleLinkClick(`/category/${category.slug}`)}
                    className={`px-3 py-1.5 uppercase transition-colors duration-150 flex items-center gap-1 hover:text-gold ${
                      isActive ? 'text-black border-b-2 border-gold' : 'text-neutral-800'
                    }`}
                  >
                    <span>{category.name}</span>
                    {hasSubs && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                  </button>
                </div>
              );
            })}

            {/* "More" Dropdown if categories exceed 6 */}
            {secondaryCategories.length > 0 && (
              <div
                className="relative py-2"
                onMouseEnter={() => setActiveMegaMenu('more-cats')}
              >
                <button className="px-3 py-1.5 uppercase transition-colors duration-150 flex items-center gap-1 text-neutral-800 hover:text-gold">
                  <span>MORE</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            )}
          </nav>

          {/* Right Header Actions (Search, Cart) */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <button
              onClick={onOpenSearch}
              className="hidden lg:flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-neutral-800 hover:text-black px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>

            <button
              onClick={() => handleLinkClick('/admin')}
              className="p-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-full transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Admin Portal"
              aria-label="Admin Portal"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden xl:inline text-xs uppercase tracking-wider font-semibold">Admin</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-neutral-900 hover:text-black focus:outline-none transition-transform active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.75]" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-0 bg-[#111111] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Desktop Mega Menu Dropdown */}
      {activeMegaMenu && (
        <div
          className="hidden lg:block absolute left-0 top-full w-full bg-white shadow-2xl border-b border-neutral-200 z-50 transition-all duration-200 animate-in fade-in slide-in-from-top-2"
          onMouseEnter={() => activeMegaMenu && setActiveMegaMenu(activeMegaMenu)}
          onMouseLeave={() => setActiveMegaMenu(null)}
        >
          <div className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-8 lg:px-12 xl:px-16 py-8">
            {activeMegaMenu === 'more-cats' ? (
              <div className="grid grid-cols-4 gap-8">
                {secondaryCategories.map((cat) => (
                  <div key={cat.id} className="space-y-3">
                    <button
                      onClick={() => handleLinkClick(`/category/${cat.slug}`)}
                      className="font-bold text-sm tracking-wider uppercase text-neutral-900 hover:text-gold flex items-center gap-1.5"
                    >
                      <span>{cat.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gold" />
                    </button>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <ul className="space-y-2 text-xs text-neutral-600">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.id}>
                            <button
                              onClick={() => handleLinkClick(`/category/${sub.slug}`)}
                              className="hover:text-black hover:translate-x-1 transition-transform inline-block"
                            >
                              {sub.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              (() => {
                const category = rootCategories.find((c) => c.id === activeMegaMenu);
                if (!category || !category.subcategories?.length) return null;

                return (
                  <div className="grid grid-cols-12 gap-8">
                    {/* Category Intro Column */}
                    <div className="col-span-3 border-r border-neutral-100 pr-6">
                      <h3 className="font-heading text-lg font-bold tracking-widest text-neutral-950 uppercase mb-2">
                        {category.name}
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                        {category.description || 'Explore the exclusive collection crafted with uncompromising quality.'}
                      </p>
                      <button
                        onClick={() => handleLinkClick(`/category/${category.slug}`)}
                        className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-black hover:text-gold transition-colors"
                      >
                        <span>VIEW ENTIRE COLLECTION</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subcategories Grid */}
                    <div className="col-span-6 grid grid-cols-2 gap-y-3 gap-x-6">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleLinkClick(`/category/${sub.slug}`)}
                          className="text-left text-sm text-neutral-700 hover:text-neutral-950 hover:font-medium hover:translate-x-1 transition-all py-1"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>

                    {/* Featured Visual Image Banner */}
                    <div className="col-span-3">
                      <div
                        onClick={() => handleLinkClick(`/category/${category.slug}`)}
                        className="group relative h-48 rounded-md overflow-hidden cursor-pointer shadow-sm"
                      >
                        <img
                          src={category.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop'}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                          <span className="text-white text-xs font-bold tracking-widest uppercase">
                            EXPLORE {category.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* 4. Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-300">
            <div>
              {/* Drawer Header */}
              <div className="p-4 flex items-center justify-between border-b border-neutral-200">
                <div onClick={() => { setMobileMenuOpen(false); handleLinkClick('/'); }} className="cursor-pointer">
                  <VeloraLogo variant="wordmark" height={28} />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-neutral-500 hover:text-black"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Quick Search Button */}
              <div className="p-4 border-b border-neutral-150">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSearch();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded bg-neutral-100 text-neutral-600 text-xs tracking-wider uppercase font-medium"
                >
                  <Search className="w-4 h-4 text-neutral-500" />
                  <span>Search Velora Catalog</span>
                </button>
              </div>

              {/* Accordion Categories */}
              <div className="p-2 divide-y divide-neutral-100">
                {rootCategories.map((cat) => {
                  const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                  const isExpanded = expandedMobileCategories[cat.id];

                  return (
                    <div key={cat.id} className="py-1">
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <button
                          onClick={() => handleLinkClick(`/category/${cat.slug}`)}
                          className="font-semibold text-sm tracking-wide text-neutral-900 uppercase text-left flex-1"
                        >
                          {cat.name}
                        </button>
                        {hasSubs && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMobileCategory(cat.id);
                            }}
                            className="p-1 text-neutral-500 hover:text-black"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-black' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Expanded Subcategories */}
                      {hasSubs && isExpanded && (
                        <div className="pl-6 pr-3 py-1 space-y-2 border-l-2 border-gold/30 ml-4 mb-2 bg-neutral-50/70 rounded">
                          <button
                            onClick={() => handleLinkClick(`/category/${cat.slug}`)}
                            className="block w-full text-left text-xs font-bold text-black tracking-wider uppercase py-1"
                          >
                            All {cat.name}
                          </button>
                          {cat.subcategories?.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleLinkClick(`/category/${sub.slug}`)}
                              className="block w-full text-left text-xs text-neutral-600 hover:text-black py-1"
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Footer Contact Details */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 space-y-2">
              <button
                onClick={() => handleLinkClick('/admin')}
                className="w-full py-2 px-3 bg-neutral-900 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-colors mb-2"
              >
                <Lock className="w-3.5 h-3.5 text-gold" />
                <span>Admin Login Portal</span>
              </button>
              <p className="font-semibold text-neutral-800">VELORA SRI LANKA</p>
              <p>WhatsApp: {settings.general.whatsapp_display}</p>
              <p>Email: {settings.general.email}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
