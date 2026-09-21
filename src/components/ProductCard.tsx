import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCategoryDiscounts, getDiscountedPrice, getDiscountLabel } from "@/hooks/useCategoryDiscounts";

interface ProductVariant {
  size: string;
  price: number;
  bestFor: string;
}

interface ProductCardProps {
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  description: string;
  badge?: string;
  delay?: number;
  id?: string;
  variants?: ProductVariant[];
  inStock?: boolean;
}

const ProductCard = ({ name, brand, price, originalPrice, rating, reviewCount, image, category, description, badge, delay = 0, id, variants = [], inStock = true }: ProductCardProps) => {
  const slug = id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const { data: discounts } = useCategoryDiscounts();
  
  const cheapestPrice = variants.length > 0
    ? Math.min(...variants.map(v => v.price))
    : price;

  const discountedPrice = getDiscountedPrice(cheapestPrice, category, discounts);
  const discountLabel = getDiscountLabel(category, discounts);
  const isOutOfStock = !inStock;

  return (
    <Link
      to={`/product/${slug}`}
      className={`group block bg-card rounded-lg overflow-hidden border border-border hover:shadow-luxury-lg transition-all duration-500 animate-fade-in ${isOutOfStock ? 'opacity-70' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={image}
          alt={name}
          loading="lazy"
          width={800}
          height={1024}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {discountLabel && !isOutOfStock && (
          <span className="absolute top-2 left-2 sm:top-4 sm:left-4 font-body text-[8px] sm:text-[10px] font-bold tracking-[0.15em] uppercase bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full z-10">
            {discountLabel}
          </span>
        )}
        {badge && !isOutOfStock && !discountLabel && (
          <span className="absolute top-2 left-2 sm:top-4 sm:left-4 font-body text-[8px] sm:text-[10px] font-bold tracking-[0.15em] uppercase bg-gold text-primary-foreground px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
            {badge}
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute top-2 left-2 sm:top-4 sm:left-4 font-body text-[8px] sm:text-[10px] font-bold tracking-[0.15em] uppercase bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
            Out of Stock
          </span>
        )}
        <span className="absolute top-2 right-2 sm:top-4 sm:right-4 font-body text-[8px] sm:text-[10px] font-medium tracking-wide text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
          {category}
        </span>
      </div>
      <div className="p-3 sm:p-5">
        <p className="font-body text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase text-gold mb-1">{brand}</p>
        <h3 className="font-display text-base sm:text-xl font-semibold text-foreground mb-1 line-clamp-1">{name}</h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="font-body text-[10px] sm:text-[11px] text-muted-foreground">From</span>
            {discountedPrice !== null ? (
              <>
                <span className="font-body text-[11px] sm:text-sm text-muted-foreground line-through">৳{cheapestPrice}</span>
                <span className="font-body text-sm sm:text-lg font-bold text-red-600">৳{discountedPrice}</span>
              </>
            ) : (
              <span className="font-body text-sm sm:text-lg font-bold text-foreground">৳{cheapestPrice}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-gold text-gold sm:w-3 sm:h-3" />
            <span className="font-body text-[11px] sm:text-[12px] font-medium text-foreground">{rating}</span>
            <span className="font-body text-[10px] sm:text-[11px] text-muted-foreground">({reviewCount})</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
