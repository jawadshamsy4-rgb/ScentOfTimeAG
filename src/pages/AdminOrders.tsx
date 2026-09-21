import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminTabNav from "@/components/AdminTabNav";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Download, Package, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

interface Order {
  id: string;
  order_number: string;
  name: string;
  phone: string;
  address: string;
  product: string;
  variant: string;
  quantity: number;
  total_price: number;
  delivery_charge: number;
  status: string;
  created_at: string;
  selected_perfumes: string[] | null;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) { navigate("/admin"); return; }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) { navigate("/admin"); return; }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load orders", description: error.message, variant: "destructive" });
    } else {
      setOrders((data as Order[]) || []);
    }
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
      return;
    }

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    toast({ title: "Status updated", description: `Order status changed to ${newStatus}.` });
  };

  const handleDeleteOrder = async (orderId: string) => {
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) {
      toast({ title: "Failed to delete order", description: error.message, variant: "destructive" });
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    toast({ title: "Item deleted successfully." });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const exportToCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Order ID", "Name", "Phone", "Address", "Product", "Set Products", "Variant", "Qty", "Total", "Delivery", "Status", "Date"];
    const rows = orders.map((o) => [
      "#" + o.order_number, o.name, o.phone, `"${(o.address || "Address not provided").replace(/"/g, '""')}"`,
      o.product, `"${(o.selected_perfumes || []).join(", ")}"`,
      o.variant, o.quantity, o.total_price,
      o.delivery_charge, o.status,
      new Date(o.created_at).toLocaleString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Orders exported!", description: `${orders.length} orders downloaded as CSV.` });
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "Pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Confirmed": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Processing": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "Shipped": return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
      case "Delivered": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Cancelled": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Loading orders…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">Order Management</h1>
          <p className="font-body text-[12px] text-muted-foreground">Scent of Time — Admin Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="cta-outline" size="sm" onClick={exportToCSV} disabled={orders.length === 0}>
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={14} className="mr-1.5" /> Logout
          </Button>
        </div>
      </header>

      <AdminTabNav />

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Total Orders</p>
            <p className="font-display text-3xl font-semibold text-foreground">{orders.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Total Revenue</p>
            <p className="font-display text-3xl font-semibold text-foreground">
              ৳{orders.reduce((sum, o) => sum + Number(o.total_price), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Today's Orders</p>
            <p className="font-display text-3xl font-semibold text-foreground">
              {orders.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="font-display text-xl text-foreground mb-1">No orders yet</p>
            <p className="font-body text-[13px] text-muted-foreground">Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Order ID</th>
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Name</th>
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Phone</th>
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Address</th>
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Product</th>
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Set Products</th>
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Variant</th>
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Qty</th>
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Total</th>
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Delivery</th>
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Status</th>
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Date</th>
                     <th className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground text-left px-4 py-3">Delete</th>
                   </tr>
                 </thead>
                 <tbody>
                   {orders.map((order, idx) => (
                     <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                       <td className="font-body text-[12px] font-semibold text-foreground px-4 py-3">#{order.order_number}</td>
                       <td className="font-body text-[13px] font-medium text-foreground px-4 py-3">{order.name}</td>
                       <td className="font-body text-[13px] text-foreground px-4 py-3">{order.phone}</td>
                       <td className="font-body text-[12px] text-muted-foreground px-4 py-3 max-w-[250px] break-words">{order.address || "Address not provided"}</td>
                        <td className="font-body text-[13px] font-medium text-foreground px-4 py-3">{order.product}</td>
                         <td className="font-body text-[12px] text-muted-foreground px-4 py-3 max-w-[250px]">
                           {order.selected_perfumes && order.selected_perfumes.length > 0
                             ? order.selected_perfumes.map((p, i) => (
                                 <div key={i} className="whitespace-nowrap">{i + 1}. {p}</div>
                               ))
                             : <span className="text-muted-foreground">—</span>}
                         </td>
                        <td className="font-body text-[12px] text-muted-foreground px-4 py-3">{order.variant}</td>
                        <td className="font-body text-[13px] text-foreground px-4 py-3">{order.quantity}</td>
                        <td className="font-display text-[14px] font-semibold text-foreground px-4 py-3">৳{Number(order.total_price).toLocaleString()}</td>
                         <td className="font-body text-[12px] text-muted-foreground px-4 py-3">৳{Number(order.delivery_charge || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`font-body text-[11px] font-semibold rounded-lg border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold/30 cursor-pointer ${statusColor(order.status)}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="font-body text-[12px] text-muted-foreground px-4 py-3 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}<br />
                        <span className="text-[10px]">{new Date(order.created_at).toLocaleTimeString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 size={14} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-display text-foreground">Are you sure you want to delete this item?</AlertDialogTitle>
                              <AlertDialogDescription className="font-body text-muted-foreground">This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
