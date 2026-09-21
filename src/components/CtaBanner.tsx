import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CtaBanner = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 gradient-luxury">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
        <span className="font-body text-[11px] font-semibold tracking-[0.35em] uppercase text-gold mb-4 block">
          Limited Edition
        </span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-4 md:mb-6">
          Exclusive <span className="italic font-semibold text-gold">Discovery</span> Set
        </h2>
        <p className="font-body text-[14px] text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed whitespace-pre-line">
          Discover iconic scents in a sleek, travel-friendly format. Each bottle features premium-inspired fragrances designed to deliver a long-lasting scent experience.

          Choose your perfect set: 5 pieces or 10 pieces, curated from some of the world’s most loved perfumes.
        </p>
        <Button variant="cta" size="xl" className="gap-3" asChild>
          <Link to="/collection/discovery">
            Shop Discovery Set <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CtaBanner;
