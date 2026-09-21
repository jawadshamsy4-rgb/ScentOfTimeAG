import { Truck, Shield, RotateCcw, Award } from "lucide-react";

const features = [
  { icon: Truck, label: "Fast Delivery", desc: "Within 24 hours to 72 hours " },
  { icon: Shield, label: "Authentic & Inspired", desc: "100% noble products" },
  { icon: Award, label: "Premium Quality", desc: "Curated selection" },
];

const FeaturesBar = () => {
  return (
    <section className="bg-card border-y border-border py-5 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-3 gap-3 sm:gap-6 justify-items-center">
          {features.map((f) => (
            <div key={f.label} className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <f.icon size={16} className="text-gold sm:w-[18px] sm:h-[18px]" />
              </div>
              <div>
                <p className="font-body text-[10px] sm:text-[12px] font-semibold tracking-wide text-foreground">{f.label}</p>
                <p className="font-body text-[9px] sm:text-[11px] text-muted-foreground hidden sm:block">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
