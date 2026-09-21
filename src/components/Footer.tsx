import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 sm:py-16 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 mb-10 sm:mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-display text-2xl font-semibold">
              Scent <span className="italic text-gold">of Time</span>
            </Link>
            <p className="font-body text-[12px] text-primary-foreground/60 mt-4 leading-relaxed">Curating the finest fragrances since 2025. Every scent tells a story.


            </p>
          </div>
          <div>
            <h4 className="font-body text-[11px] font-semibold tracking-[0.2em] uppercase mb-4">Shop</h4>
            <ul className="space-y-2">
              {[
              { label: "All Perfumes", slug: "all" },
              { label: "Men", slug: "men" },
              { label: "Women", slug: "women" },
              { label: "Oud", slug: "oud" },
              { label: "New Arrivals", slug: "new-arrival" }].
              map((item) =>
              <li key={item.slug}>
                  <Link to={`/collection/${item.slug}`} className="font-body text-[12px] text-primary-foreground/60 hover:text-primary-foreground transition-colors">{item.label}</Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-body text-[11px] font-semibold tracking-[0.2em] uppercase mb-4">Support</h4>
            <ul className="space-y-2">
              {["Shipping Info", "Returns", "FAQ", "Contact Us"].map((item) =>
              <li key={item}>
                  <span className="font-body text-[12px] text-primary-foreground/60 cursor-pointer hover:text-primary-foreground transition-colors">{item}</span>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-body text-[11px] font-semibold tracking-[0.2em] uppercase mb-4">Newsletter</h4>
            <p className="font-body text-[12px] text-primary-foreground/60 mb-4">Get exclusive offers and new arrivals.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 rounded-l-md px-4 py-2.5 font-body text-[12px] text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none" />
              
              <button className="bg-gold text-primary-foreground px-4 rounded-r-md font-body text-[11px] font-semibold tracking-wider uppercase hover:bg-gold/90 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-8 text-center">
          <p className="font-body text-[11px] text-primary-foreground/40">© 2026 Scent of Time. All rights reserved.</p>
          <p className="font-body text-[11px] text-primary-foreground/40 mt-2">Shop no :- 5, C block, 1st Floor, Gulzar Tower, Chawkbazar. Chittagong, Bangladesh.</p>
        </div>
      </div>
    </footer>);
};

export default Footer;