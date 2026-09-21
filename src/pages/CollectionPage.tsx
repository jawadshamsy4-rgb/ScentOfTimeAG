import React from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useReviewStats } from "@/hooks/useReviewStats";
import {
  useCategoryDiscounts,
  getDiscountedPrice,
  type CategoryDiscount,
} from "@/hooks/useCategoryDiscounts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, ArrowUpDown, Check } from "lucide-react";

type SortOption = "recommended" | "price-asc" | "price-desc";

const getEffectivePrice = (
  product: { price: number; variants?: { price: number }[]; category: string },
  discounts: CategoryDiscount[],
) => {
  const variantPrices = (product.variants || [])
    .map((v) => Number(v.price))
    .filter((n) => !isNaN(n));
  const base = variantPrices.length > 0 ? Math.min(...variantPrices) : product.price;
  const discounted = getDiscountedPrice(base, product.category, discounts);
  return discounted ?? base;
};

const categories = [
  { label: "All", slug: "all" },
  { label: "Men", slug: "men" },
  { label: "Women", slug: "women" },
  { label: "Oud", slug: "oud" },
  { label: "Combo", slug: "combo" },
  { label: "Authentic", slug: "authentic" },
  { label: "Discovery", slug: "discovery" },
  
];

const CollectionPage = () => {
  const { category } = useParams<{ category: string }>();
  const activeSlug = category || "all";
  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const { data: reviewStats = {} } = useReviewStats();
  const { data: discounts = [] } = useCategoryDiscounts();
  const [sortBy, setSortBy] = React.useState<SortOption>("recommended");

  const filtered = React.useMemo(() => {
    if (activeSlug === "all") return products;
    if (activeSlug === "new-arrival")
      return products.filter((p) => p.badge?.toLowerCase().includes("new"));
    if (activeSlug === "oud")
      return products.filter((p) => p.category.toLowerCase() === "oud" || p.category.toLowerCase() === "unisex");
    if (activeSlug === "combo")
      return products.filter((p) => p.category.toLowerCase() === "combo");
    if (activeSlug === "authentic")
      return products.filter((p) => p.category.toLowerCase() === "authentic");
    if (activeSlug === "discovery")
      return products.filter((p) => p.category.toLowerCase() === "discovery");
    return products.filter(
      (p) => p.category.toLowerCase() === activeSlug.toLowerCase()
    );
  }, [products, activeSlug]);

  const sorted = React.useMemo(() => {
    if (sortBy === "recommended") return filtered;
    const indexed = filtered.map((p, i) => ({ p, i }));
    indexed.sort((a, b) => {
      const pa = getEffectivePrice(a.p as any, discounts);
      const pb = getEffectivePrice(b.p as any, discounts);
      if (pa === pb) return a.i - b.i;
      return sortBy === "price-asc" ? pa - pb : pb - pa;
    });
    return indexed.map((x) => x.p);
  }, [filtered, sortBy, discounts]);

  const activeLabel =
    categories.find((c) => c.slug === activeSlug)?.label || "All";

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <section className="pt-24 sm:pt-28 lg:pt-36 pb-16 sm:pb-24 lg:pb-32">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-14">
            <span className="font-body text-[11px] font-semibold tracking-[0.35em] uppercase text-muted-foreground mb-4 block">
              Our Collection
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
              {activeLabel === "All" ? (
                <>
                  All <span className="font-semibold italic text-gold">Fragrances</span>
                </>
              ) : (
                <>
                  {activeLabel}{" "}
                  <span className="font-semibold italic text-gold">Collection</span>
                </>
              )}
            </h1>
          </div>

          {/* Category tabs + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0 sm:gap-4 mb-6 md:mb-10">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-0 sm:pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 flex-1 min-w-0 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/collection/${cat.slug}`}
                  className={`font-body text-[12px] font-medium tracking-wide px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap ${
                    activeSlug === cat.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center shrink-0 pr-4 sm:px-0 self-end sm:self-auto mt-2 sm:mt-0">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-8 sm:h-10 px-2 bg-transparent text-muted-foreground hover:text-foreground transition-colors font-body text-[12px] font-medium tracking-wide focus:outline-none focus-visible:ring-0">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Sort
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="font-body min-w-[200px]">
                  <DropdownMenuRadioGroup
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as SortOption)}
                  >
                    <DropdownMenuRadioItem value="recommended">Recommended</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="price-asc">Price: Low to High</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="price-desc">Price: High to Low</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Products grid */}
          {isError ? (
            <div className="text-center py-20">
              <p className="font-body text-muted-foreground mb-4">Could not load products. Please try again.</p>
              <button onClick={() => refetch()} className="font-body text-sm px-5 py-2.5 rounded-full bg-primary text-primary-foreground">Retry</button>
            </div>
          ) : !isLoading && sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-body text-muted-foreground">
                No products in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 transition-all duration-300">
              {isLoading
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="aspect-[3/4] rounded-lg bg-secondary/40"
                      aria-hidden="true"
                    />
                  ))
                : sorted.map((product, idx) => {
                    const stats = reviewStats[product.id];
                    return (
                      <ProductCard
                        key={product.id}
                        {...product}
                        image={product.image}
                        rating={stats?.averageRating ?? 0}
                        reviewCount={stats?.reviewCount ?? 0}
                        delay={idx * 0.05}
                      />
                    );
                  })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CollectionPage;
