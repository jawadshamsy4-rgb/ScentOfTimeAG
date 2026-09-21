import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Download, Package, ArrowRight, ShieldCheck, MapPin, Phone, User, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { generateInvoice, Order } from "@/utils/generateInvoice";

const OrderConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase.rpc("track_order_by_number", { order_num: orderId });
        if (error) throw error;
        if (data && data.length > 0) {
          setOrder(data[0] as Order);
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Navbar />
        <div className="pt-36 pb-20 px-6 max-w-xl mx-auto text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin mb-4" />
          <p className="font-display text-xl text-foreground">Preparing your luxury receipt…</p>
          <p className="font-body text-[13px] text-muted-foreground mt-1">Fetching verified order records</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Navbar />
        <div className="pt-36 pb-20 px-6 max-w-xl mx-auto text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-6">
            <Package size={28} />
          </div>
          <h1 className="font-display text-3xl font-semibold mb-3 text-foreground">Order Not Found</h1>
          <p className="font-body text-[14px] text-muted-foreground mb-8 max-w-md">
            We couldn't locate details for this order. It may still be processing or the order number was typed incorrectly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/track-order">
              <Button variant="outline" className="rounded-full px-6">
                Track by Phone
              </Button>
            </Link>
            <Link to="/">
              <Button variant="gold" className="rounded-full px-6">
                Return to Boutique
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const itemSubtotal = order.total_price - (order.delivery_charge || 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          
          {/* Celebratory Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold mb-5">
              <Sparkles size={14} className="animate-pulse" />
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.2em]">Order Confirmed & Received</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground tracking-tight mb-3">
              Thank You for Your Order
            </h1>
            
            <p className="font-body text-[14px] sm:text-[15px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Your luxury fragrance order has been officially recorded. Our concierge team is preparing your parcel with our signature protective packaging.
            </p>
          </div>

          {/* Luxury Invoice Card */}
          <div className="bg-card border border-border/80 rounded-2xl shadow-luxury overflow-hidden mb-8 transition-all">
            
            {/* Top Gold Accent Ribbon */}
            <div className="h-1.5 bg-gradient-to-r from-gold/20 via-gold to-gold/20" />

            {/* Header / Meta Bar */}
            <div className="p-6 sm:p-8 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/20">
              <div>
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  Official Order Number
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    #{order.order_number}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gold/10 text-gold border border-gold/30">
                    Cash on Delivery
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-muted-foreground font-body text-[12px]">
                  <Clock size={13} className="text-gold" />
                  <span>Placed on {new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>

              {/* Quick Invoice PDF button in header */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateInvoice(order)}
                className="self-start sm:self-auto border-gold/30 hover:border-gold hover:bg-gold/10 text-foreground font-body text-[12px] gap-2 rounded-full px-4 h-9 transition-all"
              >
                <Download size={14} className="text-gold" />
                <span>Invoice (PDF)</span>
              </Button>
            </div>

            {/* Recipient & Shipping Information */}
            <div className="p-6 sm:p-8 border-b border-border/70 grid grid-cols-1 md:grid-cols-2 gap-6 bg-background/40">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gold font-body text-[11px] uppercase tracking-[0.15em] font-semibold">
                  <User size={13} />
                  <span>Customer Details</span>
                </div>
                <p className="font-body text-[15px] font-medium text-foreground">{order.name}</p>
                <p className="font-body text-[13px] text-muted-foreground flex items-center gap-1.5">
                  <Phone size={12} className="text-muted-foreground" />
                  {order.phone}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gold font-body text-[11px] uppercase tracking-[0.15em] font-semibold">
                  <MapPin size={13} />
                  <span>Shipping Address</span>
                </div>
                <p className="font-body text-[13.5px] text-foreground leading-relaxed">
                  {order.address}
                </p>
              </div>
            </div>

            {/* Itemized Order Breakdown */}
            <div className="p-6 sm:p-8">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Ordered Item Details
              </p>

              <div className="bg-secondary/30 rounded-xl p-4 sm:p-5 border border-border/60 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {order.product}
                    </h3>
                    <p className="font-body text-[13px] text-muted-foreground mt-0.5">
                      Volume / Variant: <span className="text-foreground font-medium">{order.variant}</span>
                    </p>

                    {order.selected_perfumes && order.selected_perfumes.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="font-body text-[11px] text-muted-foreground">Fragrances selected:</span>
                        {order.selected_perfumes.map((perfume, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 rounded bg-background border border-border text-[11px] text-foreground font-medium"
                          >
                            {perfume}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-body text-[12px] text-muted-foreground">Qty: {order.quantity}</p>
                    <p className="font-display text-xl font-bold text-foreground mt-0.5">
                      ৳{Math.round(itemSubtotal).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2.5 pt-2 font-body text-[13.5px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items Subtotal</span>
                  <span className="text-foreground font-medium">৳{Math.round(itemSubtotal).toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Standard Delivery</span>
                  <span className="text-foreground font-medium">
                    {order.delivery_charge && order.delivery_charge > 0 
                      ? `৳${Number(order.delivery_charge).toLocaleString()}` 
                      : "Free Delivery"}
                  </span>
                </div>

                <div className="border-t border-border/80 pt-3.5 mt-3 flex justify-between items-baseline">
                  <div>
                    <span className="font-body font-semibold text-foreground text-[14px]">Total Payable Amount</span>
                    <p className="font-body text-[11px] text-muted-foreground">To be settled upon parcel delivery (COD)</p>
                  </div>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-gold">
                    ৳{Number(order.total_price).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Packaging & Authenticity Banner */}
            <div className="px-6 sm:px-8 py-4 bg-secondary/40 border-t border-border/70 flex items-center gap-3 text-muted-foreground font-body text-[12px]">
              <ShieldCheck size={16} className="text-gold shrink-0" />
              <span>100% Authentic luxury fragrances. Hand-inspected and sealed in tamper-proof presentation boxing.</span>
            </div>
          </div>

          {/* Action Row — prominent gold download button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gold"
              size="lg"
              onClick={() => generateInvoice(order)}
              className="w-full sm:w-auto shadow-md hover:shadow-gold/25 gap-2.5 px-8"
            >
              <Download size={16} />
              Download Invoice (PDF)
            </Button>

            <Link to={`/track-order?q=${order.order_number}`} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full border-border hover:border-gold/50 font-body font-medium tracking-wider uppercase text-[12px] px-7 gap-2"
              >
                <Package size={15} />
                Track Delivery
              </Button>
            </Link>

            <Link to="/collection" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto rounded-full font-body font-medium tracking-wider uppercase text-[12px] px-6 text-muted-foreground hover:text-foreground gap-1.5"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
