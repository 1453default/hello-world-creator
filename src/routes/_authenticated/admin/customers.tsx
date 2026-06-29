import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Download,
  Printer,
  Search,
  X,
  MessageCircle,
  Phone,
  Pencil,
  MoreVertical,
  User,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
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
  inventory_unit: {
    imei: string | null;
    serial: string | null;
    cost_price: number | null;
    notes: string | null;
  } | null;
  product:
    | {
        name: string | null;
        model: string | null;
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
  subtotal: number;
  discount: number;
  tax: number;
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
  latestBill: Bill;
  latestItem: BillItem | null;
};

type FilterId =
  | "all"
  | "recent"
  | "returning"
  | "onetime"
  | "top"
  | "cash"
  | "upi"
  | "card"
  | "pending"
  | "paid"
  | "month"
  | "year";

type SortId =
  | "spend_desc"
  | "spend_asc"
  | "orders_desc"
  | "last_desc"
  | "last_asc"
  | "name_asc";

function customerKey(b: Pick<Bill, "customer_phone" | "customer_name">) {
  return (b.customer_phone || b.customer_name || "guest").toString().trim().toLowerCase();
}

function productLabel(it: BillItem | null): string {
  if (!it) return "—";
  if (it.product) {
    const brand = it.product.brand?.name ?? "";
    const name = it.product.name ?? it.product.model ?? "";
    return `${brand} ${name}`.trim() || (it.description ?? "—");
  }
  return it.description ?? "—";
}

function specLabel(it: BillItem | null): string {
  if (!it?.product) return "";
  return [it.product.ram, it.product.storage, it.product.color].filter(Boolean).join(" · ");
}

function whatsappHref(phone: string, msg?: string) {
  const num = phone.replace(/\D/g, "");
  const base = `https://wa.me/${num.length === 10 ? "91" + num : num}`;
  return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
}

function CustomersPage() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<SortId>("spend_desc");
  const [drawer, setDrawer] = useState<Customer | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["admin", "customers", "bills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bills")
        .select(
          "id, bill_number, created_at, customer_name, customer_phone, payment_method, status, subtotal, discount, tax, grand_total, items:bill_items(id, description, quantity, unit_price, line_total, inventory_unit:inventory_units(imei, serial, cost_price, notes), product:products(name, model, ram, storage, color, brand:brands(name)))",
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
      b.created_at.slice(0, 10),
      formatINR(b.grand_total),
    ];
    for (const it of b.items ?? []) {
      fields.push(
        it.description,
        it.inventory_unit?.imei,
        it.inventory_unit?.serial,
        it.product?.name,
        it.product?.model,
        it.product?.ram,
        it.product?.storage,
        it.product?.color,
        it.product?.brand?.name,
      );
    }
    return fields.some((f) => f && f.toString().toLowerCase().includes(q));
  }

  const filteredBills = useMemo(() => bills.filter(billMatches), [bills, q]);

  const allCustomers: Customer[] = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const b of filteredBills) {
      const key = customerKey(b);
      let cur = map.get(key);
      if (!cur) {
        cur = {
          key,
          name: b.customer_name ?? "Guest",
          phone: b.customer_phone ?? "",
          orders: 0,
          spend: 0,
          first: b.created_at,
          last: b.created_at,
          bills: [],
          latestBill: b,
          latestItem: b.items?.[0] ?? null,
        };
        map.set(key, cur);
      }
      cur.orders += 1;
      cur.spend += Number(b.grand_total);
      if (b.created_at > cur.last) {
        cur.last = b.created_at;
        cur.latestBill = b;
        cur.latestItem = b.items?.[0] ?? null;
      }
      if (b.created_at < cur.first) cur.first = b.created_at;
      cur.bills.push(b);
    }
    return Array.from(map.values());
  }, [filteredBills]);

  const customers: Customer[] = useMemo(() => {
    const now = Date.now();
    const month = new Date();
    month.setDate(1);
    month.setHours(0, 0, 0, 0);
    const year = new Date(new Date().getFullYear(), 0, 1).getTime();
    const thirtyDays = now - 30 * 86400000;

    let list = allCustomers.filter((c) => {
      switch (filter) {
        case "recent":
          return new Date(c.last).getTime() >= thirtyDays;
        case "returning":
          return c.orders > 1;
        case "onetime":
          return c.orders === 1;
        case "top":
          return true; // sorted by spend
        case "cash":
          return c.bills.some((b) => (b.payment_method ?? "").toLowerCase() === "cash");
        case "upi":
          return c.bills.some((b) => (b.payment_method ?? "").toLowerCase() === "upi");
        case "card":
          return c.bills.some((b) => (b.payment_method ?? "").toLowerCase().includes("card"));
        case "pending":
          return c.bills.some((b) => (b.status ?? "").toLowerCase() === "pending");
        case "paid":
          return c.bills.some((b) => (b.status ?? "").toLowerCase() === "paid");
        case "month":
          return new Date(c.last).getTime() >= month.getTime();
        case "year":
          return new Date(c.last).getTime() >= year;
        default:
          return true;
      }
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "spend_asc":
          return a.spend - b.spend;
        case "orders_desc":
          return b.orders - a.orders;
        case "last_desc":
          return b.last.localeCompare(a.last);
        case "last_asc":
          return a.last.localeCompare(b.last);
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "spend_desc":
        default:
          return b.spend - a.spend;
      }
    });
    return list;
  }, [allCustomers, filter, sort]);

  // Pagination
  const [page, setPage] = useState(0);
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(customers.length / pageSize));
  const pageRows = customers.slice(page * pageSize, page * pageSize + pageSize);

  async function exportAll() {
    try {
      const rows: Record<string, string | number>[] = [];
      // Per-customer aggregates
      const aggByKey = new Map(allCustomers.map((c) => [c.key, c]));
      for (const b of filteredBills) {
        const cust = aggByKey.get(customerKey(b));
        const items = b.items ?? [];
        const list = items.length ? items : [null];
        for (const it of list) {
          rows.push({
            "Customer Name": b.customer_name ?? "Guest",
            "Phone": b.customer_phone ?? "",
            "Bill Number": b.bill_number ?? "",
            "Bill Date": new Date(b.created_at).toLocaleString(),
            "Brand": it?.product?.brand?.name ?? "",
            "Product": it?.product?.name ?? it?.description ?? "",
            "Model": it?.product?.model ?? "",
            "RAM": it?.product?.ram ?? "",
            "Storage": it?.product?.storage ?? "",
            "Colour": it?.product?.color ?? "",
            "IMEI": it?.inventory_unit?.imei ?? "",
            "Serial": it?.inventory_unit?.serial ?? "",
            "Purchase Cost (INR)": Number(it?.inventory_unit?.cost_price ?? 0),
            "Selling Price (INR)": Number(it?.unit_price ?? 0),
            "Quantity": Number(it?.quantity ?? 0),
            "Line Total (INR)": Number(it?.line_total ?? 0),
            "Subtotal (INR)": Number(b.subtotal ?? 0),
            "Discount (INR)": Number(b.discount ?? 0),
            "Tax (INR)": Number(b.tax ?? 0),
            "Grand Total (INR)": Number(b.grand_total),
            "Payment Method": b.payment_method ?? "",
            "Bill Status": b.status ?? "",
            "Customer Order Count": cust?.orders ?? 0,
            "Customer Total Spent (INR)": cust ? Math.round(cust.spend) : 0,
            "Customer Last Purchase": cust ? new Date(cust.last).toLocaleDateString() : "",
          });
        }
      }
      exportToXLSX(rows, "Customer Purchases", "customers-purchases");
      toast.success(`Exported ${rows.length} rows`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function saveCustomerEdit(c: Customer, newName: string, newPhone: string) {
    try {
      const billIds = c.bills.map((b) => b.id);
      const { error } = await supabase
        .from("bills")
        .update({ customer_name: newName, customer_phone: newPhone })
        .in("id", billIds);
      if (error) throw error;
      toast.success("Customer updated");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "customers", "bills"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function deleteCustomer(c: Customer) {
    if (
      !confirm(
        `Delete ALL ${c.orders} bill(s) for ${c.name}? This unlinks inventory units and cannot be undone.`,
      )
    )
      return;
    try {
      const billIds = c.bills.map((b) => b.id);
      const { error: itemsErr } = await supabase.from("bill_items").delete().in("bill_id", billIds);
      if (itemsErr) throw itemsErr;
      const { error: billsErr } = await supabase.from("bills").delete().in("id", billIds);
      if (billsErr) throw billsErr;
      toast.success("Customer & bills deleted");
      qc.invalidateQueries({ queryKey: ["admin", "customers", "bills"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const searching = q.length > 0;

  const filterChips: { id: FilterId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "recent", label: "Recent 30d" },
    { id: "returning", label: "Returning" },
    { id: "onetime", label: "One-time" },
    { id: "top", label: "Top spenders" },
    { id: "month", label: "This month" },
    { id: "year", label: "This year" },
    { id: "cash", label: "Cash" },
    { id: "upi", label: "UPI" },
    { id: "card", label: "Card" },
    { id: "paid", label: "Paid" },
    { id: "pending", label: "Pending" },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Customers</h1>
          <p className="text-sm text-admin-muted">
            {customers.length} customer{customers.length === 1 ? "" : "s"} ·{" "}
            {filteredBills.length} bill{filteredBills.length === 1 ? "" : "s"}
            {searching ? " (filtered)" : ""}
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
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Search name, phone, bill #, IMEI, brand, model, RAM, storage, colour, payment, status, date…"
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

      <div className="flex flex-wrap items-center gap-2">
        {filterChips.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id);
              if (f.id === "top") setSort("spend_desc");
              setPage(0);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              filter === f.id
                ? "border-amber bg-amber/15 text-amber"
                : "border-admin-border bg-admin-surface text-admin-muted hover:text-admin-text"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-admin-muted">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
            className="h-8 rounded-md border border-admin-border bg-admin-surface px-2 text-xs text-admin-text outline-none focus:border-amber/60"
          >
            <option value="spend_desc">Total spend (high→low)</option>
            <option value="spend_asc">Total spend (low→high)</option>
            <option value="orders_desc">Most orders</option>
            <option value="last_desc">Latest purchase</option>
            <option value="last_asc">Oldest purchase</option>
            <option value="name_asc">Name (A→Z)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-admin-border bg-admin-surface">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted">
            <tr>
              <th className="w-8 px-2 py-3"></th>
              <th className="px-3 py-3">Customer</th>
              <th className="px-3 py-3">Latest Device</th>
              <th className="px-3 py-3">IMEI</th>
              <th className="px-3 py-3">Bill #</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3 text-right">Amount</th>
              <th className="px-3 py-3">Pay</th>
              <th className="px-3 py-3 text-center">Orders</th>
              <th className="px-3 py-3 text-right">Total Spend</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {isLoading ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-admin-muted">
                  Loading…
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-admin-muted">
                  {searching ? "No matches." : "No customers yet."}
                </td>
              </tr>
            ) : (
              pageRows.map((c) => {
                const open = expanded === c.key || (searching && c.bills.length <= 3);
                const lb = c.latestBill;
                const li = c.latestItem;
                const imei = li?.inventory_unit?.imei ?? "";
                return (
                  <Fragment key={c.key}>
                    <tr
                      onClick={() => setExpanded(open ? null : c.key)}
                      className={`cursor-pointer align-middle hover:bg-admin-surface-2/50 ${open ? "bg-admin-surface-2" : ""}`}
                    >
                      <td className="px-2 py-3 text-admin-muted">
                        {open ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-admin-text">{highlight(c.name, q)}</div>
                        <div className="font-mono text-[11px] text-admin-muted">
                          {highlight(c.phone || "—", q)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-admin-text">{highlight(productLabel(li), q)}</div>
                        <div className="text-[11px] text-admin-muted">
                          {highlight(specLabel(li) || "—", q)}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-admin-muted">
                        {imei ? highlight(imei, q) : "—"}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">
                        {highlight(lb.bill_number ?? "—", q)}
                      </td>
                      <td className="px-3 py-3 text-xs text-admin-muted">
                        {new Date(lb.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3 text-right font-num">
                        {formatINR(lb.grand_total)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-admin-surface px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-admin-muted">
                          {lb.payment_method ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold">{c.orders}</td>
                      <td className="px-3 py-3 text-right font-num font-bold text-amber">
                        {formatINR(c.spend)}
                      </td>
                      <td
                        className="px-3 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1">
                          <IconBtn
                            title="View profile"
                            onClick={() => setDrawer(c)}
                            icon={<User className="h-3.5 w-3.5" />}
                          />
                          <IconLink
                            title="View latest bill"
                            to="/receipt/$id"
                            params={{ id: lb.id }}
                            icon={<Eye className="h-3.5 w-3.5" />}
                          />
                          <IconAnchor
                            title="Print latest bill"
                            href={`/receipt/${lb.id}?print=1`}
                            icon={<Printer className="h-3.5 w-3.5" />}
                          />
                          {c.phone && (
                            <>
                              <IconAnchor
                                title="WhatsApp"
                                href={whatsappHref(
                                  c.phone,
                                  `Hi ${c.name}, thanks for your purchase from Used Mobiles.`,
                                )}
                                icon={<MessageCircle className="h-3.5 w-3.5" />}
                              />
                              <IconAnchor
                                title="Call"
                                href={`tel:${c.phone}`}
                                icon={<Phone className="h-3.5 w-3.5" />}
                              />
                            </>
                          )}
                          <MoreMenu
                            onEdit={() => setEditing(c)}
                            onDelete={() => deleteCustomer(c)}
                          />
                        </div>
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={11} className="bg-admin-surface-2/40 px-4 py-4">
                          <CustomerHistory customer={c} highlightQ={q} />
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

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-xs text-admin-muted">
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded border border-admin-border px-3 py-1 hover:text-admin-text disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(pageCount - 1, page + 1))}
              disabled={page >= pageCount - 1}
              className="rounded border border-admin-border px-3 py-1 hover:text-admin-text disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {drawer && <ProfileDrawer customer={drawer} onClose={() => setDrawer(null)} />}
      {editing && (
        <EditCustomerDialog
          customer={editing}
          onClose={() => setEditing(null)}
          onSave={saveCustomerEdit}
        />
      )}
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

function IconBtn({
  title,
  onClick,
  icon,
}: {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded border border-admin-border text-admin-muted hover:border-amber/40 hover:text-amber"
    >
      {icon}
    </button>
  );
}

function IconReceiptLink({ title, id, icon }: { title: string; id: string; icon: React.ReactNode }) {
  return (
    <Link
      to="/receipt/$id"
      params={{ id }}
      target="_blank"
      title={title}
      className="inline-flex h-7 w-7 items-center justify-center rounded border border-admin-border text-admin-muted hover:border-amber/40 hover:text-amber"
    >
      {icon}
    </Link>
  );
}

function IconAnchor({
  title,
  href,
  icon,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      title={title}
      className="inline-flex h-7 w-7 items-center justify-center rounded border border-admin-border text-admin-muted hover:border-amber/40 hover:text-amber"
    >
      {icon}
    </a>
  );
}

function MoreMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        title="More"
        className="inline-flex h-7 w-7 items-center justify-center rounded border border-admin-border text-admin-muted hover:border-amber/40 hover:text-amber"
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-md border border-admin-border bg-admin-surface shadow-lg">
          <button
            onClick={onEdit}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-admin-text hover:bg-admin-surface-2"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit customer
          </button>
          <button
            onClick={onDelete}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-400 hover:bg-admin-surface-2"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete customer
          </button>
        </div>
      )}
    </div>
  );
}

function CustomerHistory({ customer, highlightQ }: { customer: Customer; highlightQ: string }) {
  const bills = [...customer.bills].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <Info label="First Purchase" value={new Date(customer.first).toLocaleDateString()} />
        <Info label="Last Purchase" value={new Date(customer.last).toLocaleDateString()} />
        <Info label="Total Orders" value={String(customer.orders)} />
        <Info label="Total Spend" value={formatINR(customer.spend)} />
      </div>
      <div className="space-y-3">
        {bills.map((b) => (
          <div key={b.id} className="rounded-md border border-admin-border bg-admin-surface p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-admin-text">
                  #{highlight(b.bill_number ?? "", highlightQ)}
                </span>
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
                  <th className="py-1 text-right">Cost</th>
                  <th className="py-1 text-right">Sell</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {b.items.map((it) => (
                  <tr key={it.id} className="border-t border-admin-border/60">
                    <td className="py-1.5">{highlight(productLabel(it), highlightQ)}</td>
                    <td className="py-1.5 text-admin-muted">
                      {highlight(specLabel(it) || "—", highlightQ)}
                    </td>
                    <td className="py-1.5 font-mono text-[10px] text-admin-muted">
                      {highlight(it.inventory_unit?.imei || "—", highlightQ)}
                    </td>
                    <td className="py-1.5 text-right font-num text-admin-muted">
                      {it.inventory_unit?.cost_price
                        ? formatINR(it.inventory_unit.cost_price)
                        : "—"}
                    </td>
                    <td className="py-1.5 text-right font-num">{formatINR(it.unit_price)}</td>
                    <td className="py-1.5 text-center">{it.quantity}</td>
                    <td className="py-1.5 text-right font-num font-semibold">
                      {formatINR(it.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(b.discount > 0 || b.tax > 0) && (
              <div className="mt-2 flex justify-end gap-4 text-[11px] text-admin-muted">
                <span>Subtotal: {formatINR(b.subtotal)}</span>
                {b.discount > 0 && <span>Discount: −{formatINR(b.discount)}</span>}
                {b.tax > 0 && <span>Tax: {formatINR(b.tax)}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileDrawer({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <aside className="flex h-full w-full max-w-xl flex-col bg-admin-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-admin-border px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-admin-text">{customer.name}</h2>
            <p className="font-mono text-xs text-admin-muted">{customer.phone || "—"}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-admin-muted hover:text-admin-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex flex-wrap gap-2 border-b border-admin-border px-5 py-3">
          {customer.phone && (
            <>
              <a
                href={whatsappHref(customer.phone, `Hi ${customer.name}`)}
                target="_blank"
                rel="noopener"
                className="inline-flex h-8 items-center gap-1 rounded border border-admin-border px-3 text-xs font-semibold text-admin-text hover:border-amber/40 hover:text-amber"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex h-8 items-center gap-1 rounded border border-admin-border px-3 text-xs font-semibold text-admin-text hover:border-amber/40 hover:text-amber"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
            </>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <CustomerHistory customer={customer} highlightQ="" />
        </div>
      </aside>
    </div>
  );
}

function EditCustomerDialog({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer;
  onClose: () => void;
  onSave: (c: Customer, name: string, phone: string) => void;
}) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-admin-border bg-admin-surface p-5">
        <h3 className="mb-1 text-lg font-bold text-admin-text">Edit Customer</h3>
        <p className="mb-4 text-xs text-admin-muted">
          Updates name & phone across all {customer.orders} bill(s).
        </p>
        <label className="mb-3 block text-xs font-semibold text-admin-muted">
          Customer Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-admin-border bg-admin-surface-2 px-3 text-sm text-admin-text outline-none focus:border-amber/60"
          />
        </label>
        <label className="mb-4 block text-xs font-semibold text-admin-muted">
          Phone Number
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-admin-border bg-admin-surface-2 px-3 text-sm text-admin-text outline-none focus:border-amber/60"
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 rounded-md border border-admin-border px-3 text-xs font-semibold text-admin-muted hover:text-admin-text"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(customer, name.trim(), phone.trim())}
            className="h-9 rounded-md bg-amber px-3 text-xs font-semibold text-black hover:opacity-90"
          >
            Save
          </button>
        </div>
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
