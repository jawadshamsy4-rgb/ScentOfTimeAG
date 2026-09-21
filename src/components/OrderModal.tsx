import { useState, useEffect } from "react";
import { trackPurchase } from "@/lib/tracking";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDeliveryCharges } from "@/hooks/useDeliveryCharges";
import type { ProductVariant } from "@/hooks/useProducts";

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  variants: ProductVariant[];
  selectedVariant: number;
  selectedPerfumes?: string[];
}

const OrderModal = ({ open, onOpenChange, productName, variants, selectedVariant, selectedPerfumes }: OrderModalProps) => {
  const { toast } = useToast();
  const { data: charges } = useDeliveryCharges();
  const insideCharge = charges?.inside ?? 60;
  const outsideCharge = charges?.outside ?? 120;
  const insideLabel = charges?.insideLabel ?? "Inside Chittagong [Cash on delivery]";
  const outsideLabel = charges?.outsideLabel ?? "Outside Chittagong [Cash on delivery]";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    variant: selectedVariant,
    quantity: 1,
    delivery: "" as "" | "inside" | "outside",
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, variant: selectedVariant }));
  }, [selectedVariant]);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (!/^01\d{9}$/.test(form.phone.trim())) {
      toast({ title: "Enter a valid 11-digit Bangladeshi phone number", description: "Example: 01890080280", variant: "destructive" });
      return;
    }
    if (!form.delivery) {
      toast({ title: "Please select a delivery zone", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const variantSize = variants[form.variant].size;
    const deliveryCharge = form.delivery === "inside" ? insideCharge : outsideCharge;
    const totalPrice = variants[form.variant].price * form.quantity + deliveryCharge;

    try {
      const { data, error } = await supabase.rpc("place_order", {
        order_data: [{
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          product: productName,
          variant: variantSize,
          quantity: form.quantity,
          total_price: totalPrice,
          delivery_charge: deliveryCharge,
          ...(selectedPerfumes && selectedPerfumes.length > 0 ? { selected_perfumes: selectedPerfumes } : {}),
        }]
      });

      if (error) throw error;

      // Fetch admin notification email and send order notification
      const orderTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
      const { data: setting } = await supabase.from("site_settings").select("value").eq("key", "notification_email").maybeSingle();
      const notifEmail = (setting?.value as any)?.email || "scentoftimebd2025@gmail.com";
      if (notifEmail) {
        fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templateName: "order-notification",
            recipientEmail: notifEmail,
            idempotencyKey: `order-notif-${data[0]}`,
            templateData: {
              productName: productName,
              quantity: form.quantity,
              totalPrice: `৳${totalPrice.toLocaleString()}`,
              variant: variantSize,
              customerName: form.name.trim(),
              customerPhone: form.phone.trim(),
              customerAddress: form.address.trim(),
              deliveryCharge: `৳${deliveryCharge.toLocaleString()}`,
              orderTime,
              ...(selectedPerfumes?.length ? { selectedPerfumes: selectedPerfumes.join(", ") } : {}),
            },
          }),
        }).catch(console.error);
      }

      trackPurchase({
        product_name: productName,
        quantity: form.quantity,
        total_price: totalPrice,
        currency: "BDT",
        order_id: data[0],
      });

      window.location.href = `/order-confirmation?order_id=${data[0]}`;
    } catch (err: any) {
      toast({ title: "Failed to place order", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const productTotal = variants[form.variant].price * form.quantity;
  const deliveryCharge = form.delivery === "inside" ? insideCharge : form.delivery === "outside" ? outsideCharge : 0;
  const selectedPrice = productTotal + deliveryCharge;

  const inputClass = "w-full bg-background border border-border rounded-lg px-4 py-2.5 font-body text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">Place Your Order</DialogTitle>
          <DialogDescription className="font-body text-[13px] text-muted-foreground">
            Complete the form below to order <span className="font-semibold text-gold">{productName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">Full Name *</label>
            <input type="text" required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="Your full name" />
          </div>

          <div>
            <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">Phone Number *</label>
            <input type="tel" required maxLength={11} value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 11))} className={inputClass} placeholder="01XXXXXXXXX" />
          </div>

          <div>
            <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">Full Address *</label>
            <textarea required value={form.address} onChange={(e) => update("address", e.target.value)} className={`${inputClass} resize-none h-20`} placeholder="Street, City, Country" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">Variant</label>
              <select value={form.variant} onChange={(e) => update("variant", Number(e.target.value))} className={inputClass}>
                {variants.map((v, i) => (
                  <option key={v.size} value={i}>{v.size} — ৳{v.price}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">Quantity</label>
              <input type="number" min={1} max={10} value={form.quantity} onChange={(e) => update("quantity", Math.max(1, Number(e.target.value)))} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">Delivery Zone *</label>
            <select value={form.delivery} onChange={(e) => update("delivery", e.target.value)} className={inputClass}>
              <option value="" disabled>Select delivery zone</option>
              <option value="inside">{insideLabel} — ৳{insideCharge}</option>
              <option value="outside">{outsideLabel} — ৳{outsideCharge}</option>
            </select>
          </div>

          <div className="pt-2 border-t border-border space-y-1">
            <div className="flex justify-between">
              <p className="font-body text-[11px] text-muted-foreground">Product Total</p>
              <p className="font-body text-[13px] font-medium text-foreground">৳{productTotal}</p>
            </div>
            {form.delivery && (
              <div className="flex justify-between">
                <p className="font-body text-[11px] text-muted-foreground">Delivery Charge</p>
                <p className="font-body text-[13px] font-medium text-foreground">৳{deliveryCharge}</p>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                <p className="font-body text-xl sm:text-2xl font-bold text-foreground">৳{selectedPrice}</p>
              </div>
              <Button type="submit" variant="gold" size="lg" disabled={submitting}>
                {submitting ? "Placing Order…" : "Place Order"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
