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
      .in("key", ["delivery_charge_inside", "delivery_charge_outside"]);

    if (data) {
      for (const row of data) {
        const val = typeof row.value === "number" ? row.value : Number(row.value);
        if (row.key === "delivery_charge_inside") setInside(val);
        if (row.key === "delivery_charge_outside") setOutside(val);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (inside < 0 || outside < 0) {
      toast({ title: "Charges cannot be negative", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error: e1 } = await supabase
        .from("site_settings")
        .update({ value: inside as any, updated_at: new Date().toISOString() })
        .eq("key", "delivery_charge_inside");

      const { error: e2 } = await supabase
        .from("site_settings")
        .update({ value: outside as any, updated_at: new Date().toISOString() })
        .eq("key", "delivery_charge_outside");

      if (e1 || e2) throw e1 || e2;

      toast({ title: "Delivery charges updated! ✅", description: `Inside: ৳${inside} · Outside: ৳${outside}` });
    } catch (err: any) {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground animate-pulse">Loading…</p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-4 py-3 font-body text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30";

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

      <div className="px-6 py-8 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <Truck size={20} className="text-gold" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Delivery Charges</h2>
            <p className="font-body text-[11px] text-muted-foreground">
              Update delivery charges. Changes apply to new orders only.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">
              Inside Chittagong Charge (BDT)
            </label>
            <input
              type="number"
              min={0}
              value={inside}
              onChange={(e) => setInside(Math.max(0, Number(e.target.value)))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">
              Outside Chittagong Charge (BDT)
            </label>
            <input
              type="number"
              min={0}
              value={outside}
              onChange={(e) => setOutside(Math.max(0, Number(e.target.value)))}
              className={inputClass}
            />
          </div>

          <Button variant="gold" size="lg" onClick={handleSave} disabled={saving} className="mt-2">
            <Save size={14} className="mr-1.5" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDeliveryCharges;
