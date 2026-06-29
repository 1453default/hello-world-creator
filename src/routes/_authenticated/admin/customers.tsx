import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Eye, Download, Printer, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/shop";
import { exportToXLSX } from "@/lib/xlsx-export";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  head: () => ({ meta: [{ title: "Customers · Admin" }] }),
  component: CustomersPage,
});

type BillItem = {
  id: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  inventory_unit: { imei: string | null; serial: string | null } | null;
  product:
    | {
        name: string | null;
        ram: string | null;
        storage: string | null;
        color: string | null;
        brand: { name: string | null } | null;
      }
    | null;
};

type Bill = {
  id: string;
  bill_number: string | null;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  payment_method: string | null;
  status: string | null;
  grand_total: number;
  items: BillItem[];
};

type Customer = {
  key: string;
  name: string;
  phone: string;
  orders: number;
  spend: number;
  first: string;
  last: string;
  bills: Bill[];
};

function customerKey(b: Pick<Bill, "customer_phone" | "customer_name">) {
  return (b.customer_phone || b.customer_name || "guest").toString();
}

function CustomersPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["admin", "customers", "bills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bills")
        .select(
          "id, bill_number, created_at, customer_name, customer_phone, payment_method, status, grand_total, items:bill_items(id, description, quantity, unit_price, line_total, inventory_unit:inventory_units(imei, serial), product:products(name, ram, storage, color, brand:brands(name)))",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Bill[];
    },
  });

  const q = query.trim().toLowerCase();

  function billMatches(b: Bill): boolean {
    if (!q) return true;
    const fields: (string | null | undefined)[] = [
      b.customer_name,
      b.customer_phone,
      b.bill_number,
      b.payment_method,
      b.status,
      new Date(b.created_at).toLocaleDateString(),
      new Date(b.created_at).toLocaleString(),
      b.created_at.slice(0, 10),
      formatINR(b.grand_total),
    ];
    for (const it of b.items ?? []) {
      fields.push(
        it.description,
        it.inventory_unit?.imei,
        it.inventory_unit?.serial,
        it.product?.name,
        it.product?.ram,
        it.product?.storage,
        it.product?.color,
        it.product?.brand?.name,
      );
    }
    return fields.some((f) => f && f.toString().toLowerCase().includes(q));
  }

  const filteredBills = useMemo(() => bills.filter(billMatches), [bills, q]);

  const customers: Customer[] = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const b of filteredBills) {
      const key = customerKey(b);
      const cur =
        map.get(key) ?? {
          key,
          name: b.customer_name ?? "Guest",
          phone: b.customer_phone ?? "",
          orders: 0,
          spend: 0,
          first: b.created_at,
          last: b.created_at,
          bills: [],
        };
      cur.orders += 1;
      cur.spend += Number(b.grand_total);
      if (b.created_at > cur.last) cur.last = b.created_at;
      if (b.created_at < cur.first) cur.first = b.created_at;
      cur.bills.push(b);
      map.set(key, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.spend - a.spend);
  }, [filteredBills]);

  async function exportAll() {
    try {
      const rows: Record<string, string | number>[] = [];
      for (const b of filteredBills) {
        const items = b.items ?? [];
        if (items.length === 0) {
          rows.push({
            "Customer Name": b.customer_name ?? "Guest",
            "Phone": b.customer_phone ?? "",
            "Bill Number": b.bill_number ?? "",
            "Bill Date": new Date(b.created_at).toLocaleString(),
            "Brand": "",
            "Product": "",
            "RAM": "",
            "Storage": "",
            "Color": "",
            "IMEI": "",
            "Serial": "",
            "Quantity": 0,
            "Unit Price (INR)": 0,
            "Line Total (INR)": 0,
            "Bill Total (INR)": Number(b.grand_total),
            "Payment Method": b.payment_method ?? "",
            "Status": b.status ?? "",
          });
          continue;
        }
        for (const it of items) {
          rows.push({
            "Customer Name": b.customer_name ?? "Guest",
            "Phone": b.customer_phone ?? "",
            "Bill Number": b.bill_number ?? "",
            "Bill Date": new Date(b.created_at).toLocaleString(),
            "Brand": it.product?.brand?.name ?? "",
            "Product": it.product?.name ?? it.description ?? "",
            "RAM": it.product?.ram ?? "",
            "Storage": it.product?.storage ?? "",
            "Color": it.product?.color ?? "",
            "IMEI": it.inventory_unit?.imei ?? "",
            "Serial": it.inventory_unit?.serial ?? "",
            "Quantity": Number(it.quantity ?? 0),
            "Unit Price (INR)": Number(it.unit_price ?? 0),
            "Line Total (INR)": Number(it.line_total ?? 0),
            "Bill Total (INR)": Number(b.grand_total),
            "Payment Method": b.payment_method ?? "",
            "Status": b.status ?? "",
          });
        }
      }
      exportToXLSX(rows, "Customer Purchases", "used-mobiles-customer-purchases");
      toast.success(`Exported ${rows.length} purchase rows`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const searching = q.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Customers</h1>
          <p className="text-sm text-admin-muted">
            {searching
              ? `${customers.length} customer${customers.length === 1 ? "" : "s"} · ${filteredBills.length} matching bill${filteredBills.length === 1 ? "" : "s"}`
              : `Derived from bills · ${customers.length} unique · click a row to view purchase history`}
          </p>
        </div>
        <button
          onClick={exportAll}
          disabled={!filteredBills.length}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-admin-border bg-admin-surface px-4 text-sm font-semibold text-admin-text hover:border-amber/40 disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export XLSX
        </button>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, bill #, IMEI, serial, brand, model, RAM, storage, colour, payment, status, date…"
          className="h-11 w-full rounded-md border border-admin-border bg-admin-surface pl-10 pr-10 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-amber/60"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-admin-muted hover:text-admin-text"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
        <table className="w-full text-sm">
          <thead className="bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted">
            <tr>
              <th className="w-8 px-2 py-3"></th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total Spend</th>
              <th className="px-4 py-3">Last Visit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-admin-muted">Loading…</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-admin-muted">{searching ? "No matches." : "No customers yet."}</td></tr>
            ) : (
              customers.map((c) => {
                const open = searching || expanded === c.key;
                return (
                  <Fragment key={c.key}>
                    <tr
                      onClick={() => !searching && setExpanded(open ? null : c.key)}
                      className={`cursor-pointer hover:bg-admin-surface-2/50 ${open ? "bg-admin-surface-2" : ""}`}
                    >
                      <td className="px-2 py-3 text-admin-muted">
                        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </td>
                      <td className="px-4 py-3 font-semibold">{highlight(c.name, q)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{highlight(c.phone || "—", q)}</td>
                      <td className="px-4 py-3">{c.orders}</td>
                      <td className="px-4 py-3 font-num text-amber font-bold">{formatINR(c.spend)}</td>
                      <td className="px-4 py-3 text-admin-muted">{new Date(c.last).toLocaleDateString()}</td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={6} className="bg-admin-surface-2/40 px-4 py-4">
                          <CustomerDetail
                            customer={c}
                            bills={searching ? c.bills : undefined}
                            highlightQ={q}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-amber/30 px-0.5 text-admin-text">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function CustomerDetail({
  customer,
  bills: providedBills,
  highlightQ = "",
}: {
  customer: Customer;
  bills?: Bill[];
  highlightQ?: string;
}) {
  const { data: fetchedBills = [], isLoading } = useQuery({
    queryKey: ["admin", "customer-history", customer.key],
    enabled: !providedBills,
    queryFn: async () => {
      let qy = supabase
        .from("bills")
        .select(
          "id, bill_number, created_at, customer_name, customer_phone, payment_method, status, grand_total, items:bill_items(id, description, quantity, unit_price, line_total, inventory_unit:inventory_units(imei, serial), product:products(name, ram, storage, color, brand:brands(name)))",
        )
        .order("created_at", { ascending: false });
      if (customer.phone) qy = qy.eq("customer_phone", customer.phone);
      else qy = qy.eq("customer_name", customer.name);
      const { data, error } = await qy;
      if (error) throw error;
      return (data ?? []) as unknown as Bill[];
    },
  });

  const bills = providedBills ?? fetchedBills;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <Info label="First Purchase" value={new Date(customer.first).toLocaleDateString()} />
        <Info label="Last Purchase" value={new Date(customer.last).toLocaleDateString()} />
        <Info label="Total Orders" value={String(customer.orders)} />
        <Info label="Total Spend" value={formatINR(customer.spend)} />
      </div>
      <div className="mt-2">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-muted">
          {providedBills ? "Matching Bills" : "Purchase History"}
        </div>
        {!providedBills && isLoading ? (
          <div className="text-xs text-admin-muted">Loading…</div>
        ) : bills.length === 0 ? (
          <div className="text-xs text-admin-muted">No bills.</div>
        ) : (
          <div className="space-y-3">
            {bills.map((b) => (
              <div key={b.id} className="rounded-md border border-admin-border bg-admin-surface p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-admin-text">#{highlight(b.bill_number ?? "", highlightQ)}</span>
                    <span className="text-admin-muted">
                      {new Date(b.created_at).toLocaleString()}
                    </span>
                    <span className="rounded bg-admin-surface-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-admin-muted">
                      {highlight(b.payment_method ?? "—", highlightQ)}
                    </span>
                    {b.status && (
                      <span className="rounded bg-admin-surface-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-admin-muted">
                        {highlight(b.status, highlightQ)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-num font-bold text-amber">{formatINR(b.grand_total)}</span>
                    <Link
                      to="/receipt/$id"
                      params={{ id: b.id }}
                      target="_blank"
                      className="inline-flex h-7 items-center gap-1 rounded border border-admin-border px-2 text-[11px] font-semibold text-admin-muted hover:text-admin-text"
                    >
                      <Eye className="h-3 w-3" /> Receipt
                    </Link>
                    <a
                      href={`/receipt/${b.id}?print=1`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex h-7 items-center gap-1 rounded border border-admin-border px-2 text-[11px] font-semibold text-admin-muted hover:text-amber"
                    >
                      <Printer className="h-3 w-3" /> Print
                    </a>
                  </div>
                </div>
                <table className="w-full text-xs">
                  <thead className="text-left text-[10px] uppercase tracking-wider text-admin-subtle">
                    <tr>
                      <th className="py-1">Product</th>
                      <th className="py-1">Specs</th>
                      <th className="py-1">IMEI</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Unit</th>
                      <th className="py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.items.map((it) => {
                      const name = it.product
                        ? `${it.product.brand?.name ?? ""} ${it.product.name ?? ""}`.trim()
                        : it.description ?? "—";
                      const specs = [it.product?.ram, it.product?.storage, it.product?.color]
                        .filter(Boolean)
                        .join(" · ");
                      return (
                        <tr key={it.id} className="border-t border-admin-border/60">
                          <td className="py-1.5">{highlight(name, highlightQ)}</td>
                          <td className="py-1.5 text-admin-muted">{highlight(specs || "—", highlightQ)}</td>
                          <td className="py-1.5 font-mono text-[10px] text-admin-muted">
                            {highlight(it.inventory_unit?.imei || "—", highlightQ)}
                          </td>
                          <td className="py-1.5 text-center">{it.quantity}</td>
                          <td className="py-1.5 text-right font-num">{formatINR(it.unit_price)}</td>
                          <td className="py-1.5 text-right font-num font-semibold">{formatINR(it.line_total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-admin-border bg-admin-surface p-2">
      <div className="text-[10px] uppercase tracking-wider text-admin-subtle">{label}</div>
      <div className="mt-0.5 font-semibold text-admin-text">{value}</div>
    </div>
  );
}
