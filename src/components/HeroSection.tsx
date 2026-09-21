import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[55vh] md:min-h-screen flex items-center pt-12 md:pt-20">
      <div className="absolute inset-0">
        <img src={heroBg} alt="Luxury perfume collection" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent shadow-none px-0 bg-white/[0.46]" />
      </div>
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-20 flex items-center justify-center">
        <div className="max-w-2xl text-center mx-auto">
          <span className="font-body tracking-[0.2em] sm:tracking-[0.4em] uppercase text-gold block mb-4 md:mb-6 animate-fade-in text-base sm:text-lg md:text-2xl font-serif font-extrabold">
            Luxury Fragrance House in Bangladesh      
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-4 md:mb-6 animate-fade-in text-center font-extrabold text-[#38260f]" style={{ animationDelay: "0.1s" }}>
            THE RIGHT SCENT FOR EVERY SECOND
          </h1>
          <p className="font-body text-[13px] md:text-[14px] text-muted-foreground max-w-md leading-relaxed mb-8 md:mb-10 animate-fade-in text-center mx-auto px-2" style={{ animationDelay: "0.2s" }}>
            Shop no :- 5, C block, 1st Floor, Gulzar Tower, Chawkbazar. Chittagong, Bangladesh
          </p>
          <div className="flex-wrap gap-4 animate-fade-in flex items-start justify-center" style={{ animationDelay: "0.3s" }}>
            <Button variant="cta" size="xl" className="gap-3" asChild>
              <Link to="/collection/all">
                Explore Collection <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
