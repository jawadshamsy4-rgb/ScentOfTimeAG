import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Download, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { generateInvoice, Order } from "@/utils/generateInvoice";
import { toast } from "sonner";

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 px-6 max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground animate-pulse">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 px-6 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-semibold mb-4 text-foreground">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">We couldn't find the details for this order.</p>
          <Link to="/">
            <Button variant="gold">Return to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-16 px-6 max-w-2xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground font-body text-[14px]">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-semibold text-foreground">{order.order_number}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateInvoice(order)}
              className="gap-2"
            >
              <Download size={14} />
              Invoice (PDF)
            </Button>
          </div>

          <div className="space-y-4 font-body text-[14px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium text-foreground">{order.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product</span>
              <span className="font-medium text-foreground text-right">
                {order.product} ({order.variant})
                {order.selected_perfumes && `\n+ ${order.selected_perfumes.join(", ")}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-medium text-foreground">{order.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-medium text-foreground">BDT {order.delivery_charge || 0}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-4">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-foreground">BDT {order.total_price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => generateInvoice(order)}
            className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download size={16} />
            Download Invoice (PDF)
          </Button>
          <Link to={`/track-order?q=${order.order_number}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2">
              <Package size={16} />
              Track Order
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
