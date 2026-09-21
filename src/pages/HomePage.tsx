import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw, MessageCircle } from 'lucide-react';
import { Category, Product, SiteSettings } from '../types';
import { ProductCard } from '../components/product/ProductCard';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  settings,
  onNavigate,
  onSelectProduct,
}) => {
  const activeProducts = products.filter((p) => p.is_active);
  const newArrivals = activeProducts.filter((p) => p.is_new);
  const bestSellers = activeProducts.filter((p) => p.is_best_seller);
  const womenFeatured = activeProducts.filter((p) => p.category_id === 'cat-women' || p.category?.slug === 'women');
  const menFeatured = activeProducts.filter((p) => p.category_id === 'cat-men' || p.category?.slug === 'men');
  const accessoriesFeatured = activeProducts.filter(
    (p) => p.category_id === 'cat-accessories' || p.category_id === 'cat-sunglasses'
  );
  const cosmeticsFeatured = activeProducts.filter((p) => p.category_id === 'cat-cosmetics');

  const rootCategories = categories.filter((c) => !c.parent_id && c.is_active);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Main Hero Banner */}
      <section className="relative w-full min-h-[520px] sm:min-h-[640px] lg:min-h-[720px] bg-neutral-900 flex items-center justify-center overflow-hidden">
        {/* Desktop Hero Image */}
        <picture className="absolute inset-0 w-full h-full">
          <source
            media="(max-width: 640px)"
            srcSet={settings.hero.image_mobile || settings.hero.image_desktop}
          />
          <img
            src={settings.hero.image_desktop}
            alt="VELORA Haute Couture"
            className="w-full h-full object-cover object-center brightness-75 scale-105 transition-transform duration-1000 ease-out"
          />
        </picture>

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/30" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-8 lg:px-12 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-gold/50 bg-black/50 backdrop-blur-md text-gold text-xs sm:text-[13px] font-bold tracking-[0.22em] uppercase shadow-lg">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>HAUTE COUTURE &amp; LIFESTYLE</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[0.08em] text-white uppercase leading-tight drop-shadow-md">
            {settings.hero.title}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-neutral-200 max-w-2xl mx-auto font-normal leading-relaxed tracking-wide">
            {settings.hero.subtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate(settings.hero.cta_link || '/category/women')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black text-xs sm:text-sm font-bold tracking-widest uppercase rounded hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 shadow-lg group"
            >
              <span>{settings.hero.cta_text || 'SHOP NOW'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('/category/men')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/60 text-white text-xs sm:text-sm font-bold tracking-widest uppercase rounded hover:bg-white/10 transition-all"
            >
              <span>EXPLORE MEN</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Brand Value Pillars */}
      <section className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 -mt-6 sm:-mt-10 relative z-20">
        <div className="bg-white rounded-lg shadow-lg border border-neutral-150 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Truck className="w-6 h-6 text-gold" />
            <h4 className="text-sm font-bold tracking-wider uppercase text-neutral-900">Islandwide Express</h4>
            <p className="text-xs sm:text-[13px] text-neutral-600 font-medium">Fast doorstep courier across all 25 districts</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <ShieldCheck className="w-6 h-6 text-gold" />
            <h4 className="text-sm font-bold tracking-wider uppercase text-neutral-900">100% Authentic</h4>
            <p className="text-xs sm:text-[13px] text-neutral-600 font-medium">Uncompromising fabrics and precision eyewear</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <MessageCircle className="w-6 h-6 text-gold" />
            <h4 className="text-sm font-bold tracking-wider uppercase text-neutral-900">Direct WhatsApp</h4>
            <p className="text-xs sm:text-[13px] text-neutral-600 font-medium">Instant order assistance &amp; rapid tracking</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <RefreshCw className="w-6 h-6 text-gold" />
            <h4 className="text-sm font-bold tracking-wider uppercase text-neutral-900">Easy Exchange</h4>
            <p className="text-xs sm:text-[13px] text-neutral-600 font-medium">Reliable exchange &amp; support guarantee</p>
          </div>
        </div>
      </section>

      {/* 3. New Arrivals Carousel / Grid */}
      {newArrivals.length > 0 && (
        <section className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-200">
            <div>
              <span className="text-xs sm:text-sm font-bold text-gold tracking-widest uppercase">LATEST DROPS</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-wider text-neutral-950 uppercase mt-1">
                NEW ARRIVALS
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/category/women')}
              className="text-xs sm:text-sm font-bold tracking-widest uppercase text-black hover:text-gold flex items-center gap-1.5 transition-colors"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onSelectProduct(product)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Shop By Category (Visual Tiles) */}
      <section className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs sm:text-sm font-bold text-gold tracking-widest uppercase">DISCOVER COLLECTIONS</span>
          <h2 className="font-heading text-2xl sm:text-4xl font-bold tracking-wider text-neutral-950 uppercase mt-1">
            SHOP BY CATEGORY
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
          {rootCategories.slice(0, 6).map((category) => (
            <div
              key={category.id}
              onClick={() => onNavigate(`/category/${category.slug}`)}
              className="group relative aspect-[4/5] rounded-md overflow-hidden cursor-pointer bg-neutral-100 shadow-xs"
            >
              <img
                src={category.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop'}
                alt={category.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-3 sm:p-5 text-white">
                <span className="font-heading text-sm sm:text-base lg:text-lg font-bold tracking-widest uppercase">
                  {category.name}
                </span>
                <span className="text-xs sm:text-[13px] text-white/90 font-medium tracking-wider flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform mt-1">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 text-gold" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Featured Women's Collection */}
      {womenFeatured.length > 0 && (
        <section className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-200">
            <div>
              <span className="text-xs sm:text-sm font-bold text-gold tracking-widest uppercase">CURATED SELECTION</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-wider text-neutral-950 uppercase mt-1">
                WOMEN'S COUTURE &amp; ACTIVE
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/category/women')}
              className="text-xs sm:text-sm font-bold tracking-widest uppercase text-black hover:text-gold flex items-center gap-1.5"
            >
              <span>VIEW WOMEN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {womenFeatured.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onSelectProduct(product)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Promotional Editorial Banner */}
      <section className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="relative rounded-lg overflow-hidden bg-neutral-950 text-white min-h-[380px] flex items-center">
          <div className="absolute inset-0 w-full h-full">
            <img
              src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1600&auto=format&fit=crop"
              alt="Velora Eyewear Campaign"
              className="w-full h-full object-cover object-center opacity-40 scale-105"
            />
          </div>
          <div className="relative z-10 p-8 sm:p-14 max-w-xl space-y-4">
            <span className="text-gold text-xs sm:text-sm font-bold tracking-widest uppercase">PRECISION EYEWEAR</span>
            <h3 className="font-heading text-2xl sm:text-4xl font-bold tracking-wider uppercase leading-snug">
              JAPANESE TITANIUM &amp; POLARIZED UV400
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
              Engineered with aerospace-grade metal, featherlight comfort, and polarized optical clarity for the tropics.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/category/sunglasses')}
                className="px-6 py-3.5 bg-white text-black text-xs sm:text-sm font-bold tracking-widest uppercase rounded hover:bg-gold hover:text-black transition-colors inline-flex items-center gap-2"
              >
                <span>EXPLORE SUNGLASSES</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Featured Men's Collection */}
      {menFeatured.length > 0 && (
        <section className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-200">
            <div>
              <span className="text-xs sm:text-sm font-bold text-gold tracking-widest uppercase">PRECISION FIT</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-wider text-neutral-950 uppercase mt-1">
                MEN'S HEAVYWEIGHT &amp; ESSENTIALS
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/category/men')}
              className="text-xs sm:text-sm font-bold tracking-widest uppercase text-black hover:text-gold flex items-center gap-1.5"
            >
              <span>VIEW MEN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {menFeatured.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onSelectProduct(product)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 8. Best Sellers & Trending */}
      {bestSellers.length > 0 && (
        <section className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-200">
            <div>
              <span className="text-xs sm:text-sm font-bold text-gold tracking-widest uppercase">HIGH DEMAND</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-wider text-neutral-950 uppercase mt-1">
                BEST SELLERS &amp; ICONIC PIECES
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/category/accessories')}
              className="text-xs sm:text-sm font-bold tracking-widest uppercase text-black hover:text-gold flex items-center gap-1.5"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onSelectProduct(product)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 9. Social Community Follow Section */}
      <section className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="bg-neutral-100 rounded-lg p-8 sm:p-14 text-center space-y-5 border border-neutral-200">
          <span className="text-xs sm:text-sm font-bold text-gold tracking-widest uppercase">JOIN THE COMMUNITY</span>
          <h2 className="font-heading text-2xl sm:text-4xl font-bold tracking-wider text-neutral-950 uppercase">
            FOLLOW @VELORAOFFICIALSRILANKA
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-md mx-auto">
            Stay updated with exclusive private drops, backstage runways, and style inspirations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <a
              href={settings.general.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#111111] text-white text-xs sm:text-sm font-bold tracking-wider uppercase rounded hover:bg-black transition-colors"
            >
              Instagram
            </a>
            <a
              href={settings.general.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-neutral-900 border border-neutral-300 text-xs sm:text-sm font-bold tracking-wider uppercase rounded hover:border-black transition-colors"
            >
              Facebook
            </a>
            <a
              href={`https://wa.me/${settings.general.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#25D366] text-white text-xs sm:text-sm font-bold tracking-wider uppercase rounded hover:bg-[#20b858] transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
