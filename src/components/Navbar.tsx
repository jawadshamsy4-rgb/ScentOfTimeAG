import { Link } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, ShieldCheck, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import SearchOverlay from "./SearchOverlay";

const collectionLinks = [
  { label: "All", slug: "all" },
  { label: "Men", slug: "men" },
  { label: "Women", slug: "women" },
  { label: "Oud", slug: "oud" },
  { label: "Combo", slug: "combo" },
  { label: "Authentic", slug: "authentic" },
  { label: "Discovery", slug: "discovery" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [mobileCollectionOpen, setMobileCollectionOpen] = useState(false);
  const { totalItems } = useCart();
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    };

    checkAdmin();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => checkAdmin());
    return () => subscription.unsubscribe();
  }, []);

  const navLinkClass = "font-body text-[13px] font-medium tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors";
  const mobileLinkClass = "block font-body text-[14px] font-medium tracking-wide text-foreground";

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeout.current);
    setCollectionOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setCollectionOpen(false), 150);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex items-center justify-between h-[60px] lg:h-[72px]">
          <Link to="/" className="font-display text-[26px] lg:text-[32px] font-semibold tracking-tight text-foreground">
            Scent <span className="italic text-gold">of Time</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={navLinkClass}>Home</Link>

            {/* Collection dropdown */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to="/collection/all"
                className={`${navLinkClass} flex items-center gap-1`}
              >
                Collection
                <ChevronDown size={13} className={`transition-transform duration-200 ${collectionOpen ? "rotate-180" : ""}`} />
              </Link>

              {collectionOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                  <div className="bg-background border border-border rounded-lg shadow-lg py-2 min-w-[160px]">
                    {collectionLinks.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/collection/${item.slug}`}
                        onClick={() => setCollectionOpen(false)}
                        className="block px-5 py-2.5 font-body text-[12px] font-medium tracking-wide text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            
            <Link to="/reviews" className={navLinkClass}>Reviews</Link>
            <Link to="/track-order" className={navLinkClass}>Track Order</Link>
            
            {isAdmin && (
              <Link to="/admin/products" className={`${navLinkClass} flex items-center gap-1.5 text-gold hover:text-gold/80`}>
                <ShieldCheck size={15} />
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSearchOpen(true)}>
              <Search size={20} />
            </button>
            <Link to="/cart" className="text-muted-foreground hover:text-foreground transition-colors relative">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold rounded-full flex items-center justify-center font-body text-[9px] font-bold text-primary-foreground">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-background border-b border-border px-6 pb-6 space-y-4">
            <Link to="/" className={mobileLinkClass} onClick={() => setIsOpen(false)}>Home</Link>

            {/* Mobile collection accordion */}
            <div>
              <button
                onClick={() => setMobileCollectionOpen(!mobileCollectionOpen)}
                className={`${mobileLinkClass} flex items-center justify-between w-full`}
              >
                Collection
                <ChevronDown size={16} className={`transition-transform duration-200 ${mobileCollectionOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileCollectionOpen && (
                <div className="pl-4 mt-2 space-y-2 border-l-2 border-border ml-1">
                  {collectionLinks.map((item) => (
                    <Link
                      key={item.slug}
                      to={`/collection/${item.slug}`}
                      className="block font-body text-[12px] font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => { setIsOpen(false); setMobileCollectionOpen(false); }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            
            <Link to="/reviews" className={mobileLinkClass} onClick={() => setIsOpen(false)}>Reviews</Link>
            <Link to="/track-order" className={mobileLinkClass} onClick={() => setIsOpen(false)}>Track Order</Link>
            <Link to="/cart" className={`${mobileLinkClass} flex items-center gap-2`} onClick={() => setIsOpen(false)}>
              <ShoppingBag size={14} /> Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
            {isAdmin && (
              <>
                <div className="border-t border-border pt-3" />
                <Link to="/admin/products" className={`${mobileLinkClass} flex items-center gap-2 text-gold`} onClick={() => setIsOpen(false)}>
                  <ShieldCheck size={16} />
                  Admin Dashboard
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
