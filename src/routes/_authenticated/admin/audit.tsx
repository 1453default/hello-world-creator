import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "Audit Log · Admin" }] }),
  component: AuditPage,
});

function AuditPage() {
  const { data: events = [] } = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: async () => {
      // Aggregate from bills + inventory changes (no dedicated audit table yet)
      const { data: bills } = await supabase.from("bills").select("id, bill_number, grand_total, created_at").order("created_at", { ascending: false }).limit(50);
      return (bills ?? []).map((b) => ({
        when: b.created_at,
        what: `Bill ${b.bill_number} · ${formatINR(b.grand_total)}`,
      }));
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-admin-muted">Recent activity. A dedicated audit table is planned for Phase 13.</p>
      </header>
      <div className="rounded-xl border border-admin-border bg-admin-surface">
        <ul className="divide-y divide-admin-border">
          {events.length === 0 ? (
            <li className="px-4 py-8 text-center text-admin-muted">No events.</li>
          ) : events.map((e, i) => (
            <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{e.what}</span>
              <span className="text-admin-muted">{new Date(e.when).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
