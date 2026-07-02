import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Trash2, ShoppingCart, Search, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/shop";
import { nextBillNumber } from "@/lib/admin-utils";
import { parseSearchQuery, priceMatches, priceRelevanceCompare } from "@/lib/price-search";

export const Route = createFileRoute("/_authenticated/admin/pos")({
  head: () => ({ meta: [{ title: "POS · Admin" }] }),
  component: POSPage,
});

type AvailableUnit = {
  id: string;
  imei: string | null;
  imei2: string | null;
  serial: string | null;
  product_id: string;
  product: { id: string; name: string; selling_price: number; brand: { name: string } | null } | null;
};

type CartItem = {
  unit_id: string;
  product_id: string;
  product_label: string;
  imei: string | null;
  imei2: string | null;
  serial: string | null;
  unit_price: number;
  quantity: number;
  // user-entered values while billing (only used when stored ones are missing)
  imei_input: string;
  imei2_input: string;
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
        .select("id, imei, imei2, serial, product_id, product:products(id, name, selling_price, brand:brands(name))")
        .eq("status", "AVAILABLE")
        .limit(200);
      if (error) throw error;
      return data as AvailableUnit[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return units.slice(0, 30);
    const digits = q.replace(/[^\d.]/g, "");
    const num = Number(digits);
    const isNumeric = digits.length > 0 && !Number.isNaN(num) && num > 0;
    return units.filter((u) => {
      if (
        u.imei?.toLowerCase().includes(q) ||
        u.imei2?.toLowerCase().includes(q) ||
        u.product?.name.toLowerCase().includes(q) ||
        u.product?.brand?.name.toLowerCase().includes(q)
      ) return true;
      if (isNumeric) {
        const price = Number(u.product?.selling_price ?? 0);
        if (String(Math.round(price)).includes(digits.replace(/\..*$/, ""))) return true;
        if (Math.abs(price - num) <= Math.max(50, num * 0.05)) return true;
      }
      return false;
    }).slice(0, 30);
  }, [units, search]);

  function addToCart(u: AvailableUnit) {
    if (cart.find((c) => c.unit_id === u.id)) return toast.error("Already in cart");
    if (!u.product) return;
    setCart((c) => [
      ...c,
      {
        unit_id: u.id,
        product_id: u.product_id,
        product_label: `${u.product!.brand?.name ?? ""} ${u.product!.name}`.trim(),
        imei: u.imei,
        imei2: u.imei2,
        serial: u.serial,
        unit_price: Number(u.product!.selling_price),
        quantity: 1,
        imei_input: "",
        imei2_input: "",
      },
    ]);
  }

  function swapUnit(currentUnitId: string, nextUnitId: string) {
    if (currentUnitId === nextUnitId) return;
    if (cart.find((c) => c.unit_id === nextUnitId)) return toast.error("That IMEI is already in the cart");
    const next = units.find((u) => u.id === nextUnitId);
    if (!next || !next.product) return;
    setCart((cs) =>
      cs.map((c) =>
        c.unit_id === currentUnitId
          ? { ...c, unit_id: next.id, imei: next.imei, imei2: next.imei2, serial: next.serial, imei_input: "", imei2_input: "" }
          : c,
      ),
    );
  }

  function updateImeiInput(unitId: string, field: "imei_input" | "imei2_input", value: string) {
    setCart((cs) => cs.map((c) => (c.unit_id === unitId ? { ...c, [field]: value } : c)));
  }

  const subtotal = cart.reduce((s, c) => s + c.unit_price * c.quantity, 0);
  const grand = Math.max(0, subtotal - discount);

  // Items needing IMEI capture (no stored IMEI 1)
  const missingImei = cart.filter((c) => !c.imei && !c.imei_input.trim());

  const checkout = useMutation({
    mutationFn: async () => {
      if (cart.length === 0) throw new Error("Cart is empty");

      // 1. Validate IMEI capture for items that don't have stored IMEI 1
      const seen = new Set<string>();
      for (const c of cart) {
        const effImei = (c.imei ?? c.imei_input.trim()) || null;
        const effImei2 = (c.imei2 ?? c.imei2_input.trim()) || null;
        if (!effImei) {
          throw new Error(`${c.product_label}: IMEI 1 is required to complete the sale`);
        }
        if (effImei2 && effImei === effImei2) {
          throw new Error(`${c.product_label}: IMEI 1 and IMEI 2 must differ`);
        }
        for (const v of [effImei, effImei2]) {
          if (!v) continue;
          if (seen.has(v)) throw new Error(`Duplicate IMEI in cart: ${v}`);
          seen.add(v);
        }
      }

      // 2. Persist any newly-entered IMEIs onto inventory_units BEFORE creating the bill
      for (const c of cart) {
        const patch: { imei?: string; imei2?: string } = {};
        if (!c.imei && c.imei_input.trim()) patch.imei = c.imei_input.trim();
        if (!c.imei2 && c.imei2_input.trim()) patch.imei2 = c.imei2_input.trim();
        if (Object.keys(patch).length > 0) {
          const { error } = await supabase.from("inventory_units").update(patch).eq("id", c.unit_id);
          if (error) throw new Error(`IMEI save failed for ${c.product_label}: ${error.message}`);
        }
      }

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

      const items = cart.map((c) => {
        const effImei = c.imei ?? c.imei_input.trim();
        const effImei2 = c.imei2 ?? c.imei2_input.trim();
        const imeiTag = [effImei, effImei2].filter(Boolean).join(" / ");
        return {
          bill_id: bill.id,
          inventory_unit_id: c.unit_id,
          product_id: c.product_id,
          description: `${c.product_label}${imeiTag ? ` (IMEI ${imeiTag})` : ""}`.trim(),
          unit_price: c.unit_price,
          quantity: c.quantity,
          line_total: c.unit_price * c.quantity,
        };
      });
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
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
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
            placeholder="Search by IMEI, product, brand, or price…"
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
                <div className="font-mono text-[10px] text-admin-muted truncate">
                  {u.imei ?? "no IMEI"}{u.imei2 ? ` · ${u.imei2}` : ""}
                </div>
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
        <div className="max-h-[28rem] space-y-2 overflow-y-auto">
          {cart.map((c) => {
            const alternates = units.filter((u) => u.product_id === c.product_id && u.id !== c.unit_id);
            const cartUnitIds = new Set(cart.map((x) => x.unit_id));
            const needsImei = !c.imei;
            const needsImei2 = !c.imei2;
            return (
              <div key={c.unit_id} className="space-y-1.5 rounded-md bg-admin-surface-2 p-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{c.product_label}</div>
                    <div className="font-num text-admin-muted">{formatINR(c.unit_price)}</div>
                  </div>
                  <button onClick={() => setCart((cs) => cs.filter((x) => x.unit_id !== c.unit_id))} className="text-admin-muted hover:text-ruby"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>

                {/* IMEI 1 */}
                {needsImei ? (
                  <div className="space-y-1 rounded border border-amber/40 bg-amber/5 p-1.5">
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber font-bold">
                      <AlertCircle className="h-3 w-3" /> IMEI 1 required *
                    </div>
                    <input
                      value={c.imei_input}
                      onChange={(e) => updateImeiInput(c.unit_id, "imei_input", e.target.value)}
                      placeholder="Enter IMEI 1 (will be saved permanently)"
                      maxLength={20}
                      className="admin-input h-7 w-full font-mono text-[11px]"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-admin-muted">IMEI 1</span>
                    {alternates.length > 0 ? (
                      <select
                        value={c.unit_id}
                        onChange={(e) => swapUnit(c.unit_id, e.target.value)}
                        className="admin-input h-7 flex-1 font-mono text-[11px]"
                        title="Change to another available unit"
                      >
                        <option value={c.unit_id}>{c.imei} (current)</option>
                        {alternates
                          .filter((u) => !cartUnitIds.has(u.id))
                          .map((u) => (
                            <option key={u.id} value={u.id}>{u.imei ?? "no IMEI"}</option>
                          ))}
                      </select>
                    ) : (
                      <span className="font-mono text-[11px]">{c.imei}</span>
                    )}
                  </div>
                )}

                {/* IMEI 2 */}
                {needsImei2 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-admin-muted whitespace-nowrap">IMEI 2</span>
                    <input
                      value={c.imei2_input}
                      onChange={(e) => updateImeiInput(c.unit_id, "imei2_input", e.target.value)}
                      placeholder="Optional"
                      maxLength={20}
                      className="admin-input h-7 flex-1 font-mono text-[11px]"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-admin-muted">IMEI 2</span>
                    <span className="font-mono text-[11px]">{c.imei2}</span>
                  </div>
                )}

                {c.serial && (
                  <div className="font-mono text-[10px] text-admin-muted">SN: {c.serial}</div>
                )}
              </div>
            );
          })}
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
        {missingImei.length > 0 && (
          <div className="rounded-md border border-amber/40 bg-amber/10 p-2 text-[11px] text-amber">
            Enter IMEI 1 for {missingImei.length} item{missingImei.length > 1 ? "s" : ""} above before completing the sale.
          </div>
        )}
        <button
          onClick={() => checkout.mutate()}
          disabled={cart.length === 0 || checkout.isPending || missingImei.length > 0}
          className="w-full h-11 rounded-md bg-amber font-bold text-ink hover:bg-amber-dark disabled:opacity-40"
        >
          {checkout.isPending ? "Processing…" : "Complete Sale"}
        </button>
      </aside>
    </div>
  );
}
