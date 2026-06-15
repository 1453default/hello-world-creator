import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Trash2, ShoppingCart, Search } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/shop";
import { nextBillNumber } from "@/lib/admin-utils";

export const Route = createFileRoute("/_authenticated/admin/pos")({
  head: () => ({ meta: [{ title: "POS · Admin" }] }),
  component: POSPage,
});

type AvailableUnit = {
  id: string;
  imei: string | null;
  product_id: string;
  product: { id: string; name: string; selling_price: number; brand: { name: string } | null } | null;
};

type CartItem = {
  unit_id: string;
  product_id: string;
  description: string;
  unit_price: number;
  quantity: number;
};

function POSPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const { data: units = [] } = useQuery({
    queryKey: ["pos", "available"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_units")
        .select("id, imei, product_id, product:products(id, name, selling_price, brand:brands(name))")
        .eq("status", "AVAILABLE")
        .limit(200);
      if (error) throw error;
      return data as AvailableUnit[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return units.slice(0, 30);
    return units.filter(
      (u) =>
        u.imei?.toLowerCase().includes(q) ||
        u.product?.name.toLowerCase().includes(q) ||
        u.product?.brand?.name.toLowerCase().includes(q),
    ).slice(0, 30);
  }, [units, search]);

  function addToCart(u: AvailableUnit) {
    if (cart.find((c) => c.unit_id === u.id)) return toast.error("Already in cart");
    if (!u.product) return;
    setCart((c) => [
      ...c,
      {
        unit_id: u.id,
        product_id: u.product_id,
        description: `${u.product!.brand?.name ?? ""} ${u.product!.name}${u.imei ? ` (IMEI ${u.imei})` : ""}`.trim(),
        unit_price: Number(u.product!.selling_price),
        quantity: 1,
      },
    ]);
  }

  const subtotal = cart.reduce((s, c) => s + c.unit_price * c.quantity, 0);
  const grand = Math.max(0, subtotal - discount);

  const checkout = useMutation({
    mutationFn: async () => {
      if (cart.length === 0) throw new Error("Cart is empty");
      const { data: user } = await supabase.auth.getUser();
      const { data: bill, error } = await supabase
        .from("bills")
        .insert({
          bill_number: nextBillNumber(),
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          subtotal,
          discount,
          tax: 0,
          grand_total: grand,
          payment_method: paymentMethod,
          status: "COMPLETED",
          created_by: user.user?.id ?? null,
        })
        .select("id, bill_number")
        .single();
      if (error) throw error;

      const items = cart.map((c) => ({
        bill_id: bill.id,
        inventory_unit_id: c.unit_id,
        product_id: c.product_id,
        description: c.description,
        unit_price: c.unit_price,
        quantity: c.quantity,
        line_total: c.unit_price * c.quantity,
      }));
      const { error: e2 } = await supabase.from("bill_items").insert(items);
      if (e2) throw e2;

      const { error: e3 } = await supabase
        .from("inventory_units")
        .update({ status: "SOLD" })
        .in("id", cart.map((c) => c.unit_id));
      if (e3) throw e3;

      return bill;
    },
    onSuccess: (bill) => {
      toast.success(`Bill ${bill.bill_number} created`);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setDiscount(0);
      qc.invalidateQueries({ queryKey: ["pos", "available"] });
      qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
      qc.invalidateQueries({ queryKey: ["admin", "bills"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard-kpis"] });
      qc.invalidateQueries({ queryKey: ["products", "all"] });
      // Open dedicated receipt in a new tab
      try {
        window.open(`/receipt/${bill.id}`, "_blank", "noopener");
      } catch {
        /* noop */
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Point of Sale</h1>
          <p className="text-sm text-admin-muted">Search inventory and add to cart</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-admin-border bg-admin-surface px-3">
          <Search className="h-4 w-4 text-admin-muted" />
          <input
            placeholder="Search by IMEI, product, brand…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map((u) => (
            <button
              key={u.id}
              onClick={() => addToCart(u)}
              className="flex items-center justify-between rounded-md border border-admin-border bg-admin-surface p-3 text-left hover:border-amber/40"
            >
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{u.product?.brand?.name} {u.product?.name}</div>
                <div className="font-mono text-[10px] text-admin-muted">{u.imei ?? "no IMEI"}</div>
              </div>
              <div className="font-num font-semibold text-amber">{formatINR(u.product?.selling_price ?? 0)}</div>
            </button>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center text-sm text-admin-muted py-8">No matches.</div>}
        </div>
      </div>

      <aside className="space-y-3 rounded-xl border border-admin-border bg-admin-surface p-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-amber" />
          <h2 className="font-display font-bold">Cart ({cart.length})</h2>
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {cart.map((c) => (
            <div key={c.unit_id} className="flex items-center gap-2 rounded-md bg-admin-surface-2 p-2 text-xs">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{c.description}</div>
                <div className="font-num text-admin-muted">{formatINR(c.unit_price)}</div>
              </div>
              <button onClick={() => setCart((cs) => cs.filter((x) => x.unit_id !== c.unit_id))} className="text-admin-muted hover:text-ruby"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {cart.length === 0 && <div className="text-center text-xs text-admin-muted py-6">Cart is empty</div>}
        </div>
        <div className="space-y-2 border-t border-admin-border pt-3">
          <input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="admin-input" />
          <input placeholder="Customer phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="admin-input" />
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="admin-input">
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="OTHER">Other</option>
          </select>
          <div className="flex items-center justify-between text-sm">
            <span>Discount</span>
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="admin-input h-8 w-28 text-right" />
          </div>
        </div>
        <div className="space-y-1 border-t border-admin-border pt-3 text-sm">
          <div className="flex justify-between text-admin-muted"><span>Subtotal</span><span className="font-num">{formatINR(subtotal)}</span></div>
          <div className="flex justify-between text-admin-muted"><span>Discount</span><span className="font-num">−{formatINR(discount)}</span></div>
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="font-num text-amber">{formatINR(grand)}</span></div>
        </div>
        <button
          onClick={() => checkout.mutate()}
          disabled={cart.length === 0 || checkout.isPending}
          className="w-full h-11 rounded-md bg-amber font-bold text-ink hover:bg-amber-dark disabled:opacity-40"
        >
          {checkout.isPending ? "Processing…" : "Complete Sale"}
        </button>
      </aside>
    </div>
  );
}
