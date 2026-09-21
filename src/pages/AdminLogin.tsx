import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        let { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          const { data: refreshed } = await supabase.auth.refreshSession();
          session = refreshed.session;
        }

        if (session?.user) {
          const { data: hasRole } = await supabase.rpc("has_role", {
            _user_id: session.user.id,
            _role: "admin",
          });

          if (hasRole) {
            localStorage.setItem("scent_admin_logged_in", "true");
            navigate("/admin/products", { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setInitialChecking(false);
      }
    };

    void checkExistingSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check admin role
      const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });

      let roleVerified = hasRole === true;
      if (roleError || hasRole === null) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();
        roleVerified = !!roleRow;
      }

      if (!roleVerified) {
        await supabase.auth.signOut();
        localStorage.removeItem("scent_admin_logged_in");
        throw new Error("Access denied. Admin privileges required.");
      }

      localStorage.setItem("scent_admin_logged_in", "true");
      navigate("/admin/products");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (initialChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-luxury">
        <h1 className="font-display text-2xl text-foreground text-center mb-1">Admin Login</h1>
        <p className="font-body text-[12px] text-muted-foreground text-center mb-6">Scent of Time — Order Management</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 font-body text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="font-body text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-4 pr-11 py-2.5 font-body text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
