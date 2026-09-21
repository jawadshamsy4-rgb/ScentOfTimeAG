import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminTabNav from "@/components/AdminTabNav";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Save, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const AdminDeliveryCharges = () => {
  const [inside, setInside] = useState<number>(60);
  const [outside, setOutside] = useState<number>(120);
  const [insideLabel, setInsideLabel] = useState<string>("Inside Chittagong [Cash on delivery]");
  const [outsideLabel, setOutsideLabel] = useState<string>("Outside Chittagong [Cash on delivery]");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, handleLogout } = useAdminAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchCharges();
    }
  }, [isAdmin]);

  const fetchCharges = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "delivery_charge_inside",
        "delivery_charge_outside",
        "delivery_label_inside",
        "delivery_label_outside",
      ]);

    if (data) {
      for (const row of data) {
        if (row.key === "delivery_charge_inside") {
          setInside(typeof row.value === "number" ? row.value : Number(row.value) || 60);
        } else if (row.key === "delivery_charge_outside") {
          setOutside(typeof row.value === "number" ? row.value : Number(row.value) || 120);
        } else if (row.key === "delivery_label_inside") {
          setInsideLabel(typeof row.value === "string" ? row.value : (row.value?.text || "Inside Chittagong [Cash on delivery]"));
        } else if (row.key === "delivery_label_outside") {
          setOutsideLabel(typeof row.value === "string" ? row.value : (row.value?.text || "Outside Chittagong [Cash on delivery]"));
        }
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (inside < 0 || outside < 0) {
      toast({ title: "Charges cannot be negative", variant: "destructive" });
      return;
    }
    if (!insideLabel.trim() || !outsideLabel.trim()) {
      toast({ title: "Zone labels cannot be empty", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const updates = [
        { key: "delivery_charge_inside", value: inside as any, updated_at: new Date().toISOString() },
        { key: "delivery_charge_outside", value: outside as any, updated_at: new Date().toISOString() },
        { key: "delivery_label_inside", value: insideLabel.trim() as any, updated_at: new Date().toISOString() },
        { key: "delivery_label_outside", value: outsideLabel.trim() as any, updated_at: new Date().toISOString() },
      ];

      for (const u of updates) {
        const { error } = await supabase
          .from("site_settings")
          .upsert(u, { onConflict: "key" });
        if (error) throw error;
      }

      toast({
        title: "Delivery settings updated! ✅",
        description: `Changes have been saved and applied to checkout immediately.`,
      });
    } catch (err: any) {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground animate-pulse">Loading settings…</p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-4 py-3 font-body text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="font-body text-[11px] text-muted-foreground">Manage your store</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm">View Site</Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={14} className="mr-1.5" /> Logout
          </Button>
        </div>
      </header>

      <AdminTabNav />

      <div className="px-6 py-8 max-w-2xl">
        {/* Header Section */}
        <div className="flex items-start gap-3.5 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
            <Truck size={20} className="text-gold" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
              Delivery Charges & Labels
            </h2>
            <p className="font-body text-[13px] text-muted-foreground mt-1">
              Customize delivery zone names and prices. Changes reflect across the checkout immediately.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* ZONE 1 CARD */}
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="font-body text-[11px] font-bold tracking-[0.2em] uppercase text-gold">
              ZONE 1 (PRIMARY / LOCAL)
            </h3>

            <div>
              <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
                ZONE LABEL / TEXT
              </label>
              <input
                type="text"
                required
                value={insideLabel}
                onChange={(e) => setInsideLabel(e.target.value)}
                placeholder="e.g. Inside Chittagong [Cash on delivery]"
                className={inputClass}
              />
            </div>

            <div>
              <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
                CHARGE AMOUNT (BDT)
              </label>
              <input
                type="number"
                min={0}
                value={inside}
                onChange={(e) => setInside(Math.max(0, Number(e.target.value)))}
                className={inputClass}
              />
            </div>
          </div>

          {/* ZONE 2 CARD */}
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="font-body text-[11px] font-bold tracking-[0.2em] uppercase text-gold">
              ZONE 2 (SECONDARY / NATIONWIDE)
            </h3>

            <div>
              <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
                ZONE LABEL / TEXT
              </label>
              <input
                type="text"
                required
                value={outsideLabel}
                onChange={(e) => setOutsideLabel(e.target.value)}
                placeholder="e.g. Outside Chittagong [Cash on delivery]"
                className={inputClass}
              />
            </div>

            <div>
              <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
                CHARGE AMOUNT (BDT)
              </label>
              <input
                type="number"
                min={0}
                value={outside}
                onChange={(e) => setOutside(Math.max(0, Number(e.target.value)))}
                className={inputClass}
              />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="pt-2">
            <Button
              variant="gold"
              size="lg"
              onClick={handleSave}
              disabled={saving}
              className="gap-2 px-8"
            >
              <Save size={15} />
              <span>{saving ? "SAVING..." : "SAVE CHANGES"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDeliveryCharges;
