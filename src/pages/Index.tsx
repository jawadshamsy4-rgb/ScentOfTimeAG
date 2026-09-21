import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesBar from "@/components/FeaturesBar";
import ProductCard from "@/components/ProductCard";
import CtaBanner from "@/components/CtaBanner";
import StatsSection from "@/components/StatsSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import GetInTouchSection from "@/components/GetInTouchSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTrendingProducts } from "@/hooks/useTrendingProducts";
import { useReviewStats } from "@/hooks/useReviewStats";

const Index = () => {
  const { data: products = [], isLoading, isError, refetch } = useTrendingProducts();
  const { data: reviewStats = {} } = useReviewStats();
  

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesBar />

      {/* Products Section */}
      <section id="collection" className="py-4 md:py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">

          {/* Filter tabs */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 md:mb-10 max-w-xl mx-auto">
            {[
              { label: "Men", slug: "men" },
              { label: "Women", slug: "women" },
              { label: "Oud", slug: "oud" },
              { label: "Combo", slug: "combo" },
              { label: "Authentic", slug: "authentic" },
              { label: "Discovery", slug: "discovery" },
            ].map((tab) => (
              <Link
                key={tab.slug}
                to={`/collection/${tab.slug}`}
                className="font-body text-[14px] font-bold tracking-wide px-6 py-3 rounded-full transition-all duration-300 whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-muted text-center"
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Products grid — default to "men" on homepage */}
          {isError ? (
            <div className="text-center py-20">
              <p className="font-body text-muted-foreground mb-4">Could not load products. Please try again.</p>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              {isLoading
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="aspect-[3/4] rounded-lg bg-secondary/40"
                      aria-hidden="true"
                    />
                  ))
                : products.slice(0, 6).map((product, idx) => {
                    const stats = reviewStats[product.id];
                    return (
                      <ProductCard
                        key={product.id}
                        {...product}
                        rating={stats?.averageRating ?? 0}
                        reviewCount={stats?.reviewCount ?? 0}
                        delay={idx * 0.1}
                      />
                    );
                  })}
            </div>
          )}

          <div className="text-center mt-8 md:mt-16">
            <Link to="/collection/all">
              <Button variant="cta-outline" size="xl" className="gap-2">
                View All Fragrances <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <CtaBanner />
      <StatsSection />
      <ReviewsSection />
      <GetInTouchSection />
      <Footer />
    </div>
  );
};

export default Index;
