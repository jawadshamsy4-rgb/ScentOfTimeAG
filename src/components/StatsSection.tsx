import { useEffect, useRef, useState } from "react";

const useCountUp = (target: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
};

const StatsSection = () => {
  const { count, ref } = useCountUp(1000, 2200);

  return (
    <section ref={ref} className="py-8 md:py-12 lg:py-20 pb-4 md:pb-6 lg:pb-10 bg-background">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-10 lg:gap-20">
          {/* Left: Text */}
          <div className="text-center md:text-left max-w-md">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-2 lg:mb-3">
              <span>We Have Served Clients</span>
              <br />
              <span className="italic font-semibold text-gold">
                Both Online &amp; Offline
              </span>
            </h2>
            <p className="font-body text-[13px] lg:text-[14px] text-muted-foreground leading-snug lg:leading-relaxed">
              Trusted by fragrance lovers across Bangladesh — and counting.
            </p>
          </div>

          {/* Right: Counter */}
          <div className="text-center">
            <span className="inline-flex items-center" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              <span className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black text-foreground leading-none tracking-wide">{count}</span>
              <span className="text-gold text-4xl sm:text-5xl md:text-5xl lg:text-7xl font-bold ml-0.5 lg:ml-2">+</span>
            </span>
            <p className="font-body text-[10px] lg:text-[11px] tracking-[0.2em] lg:tracking-[0.3em] uppercase text-muted-foreground mt-3 lg:mt-5">
              Happy Customers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
