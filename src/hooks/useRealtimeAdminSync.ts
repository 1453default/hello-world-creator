import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes once to postgres_changes on the tables that drive every admin and
 * public surface, and invalidates the React Query caches that depend on them.
 *
 * Mounted at the admin layout so any mutation — local or remote — flows into
 * Products, Inventory, Bills, Customers, Dashboard, Reports, POS, Receipts,
 * Search, Audit and public catalog without manual refresh.
 *
 * Invalidation is keyed by table → list of query-key prefixes. React Query
 * only refetches *active* queries by default, so this stays cheap.
 */

const TABLE_INVALIDATIONS: Record<string, string[][]> = {
  products: [
    ["admin", "products"],
    ["admin", "product-bills"],
    ["admin", "dashboard-kpis"],
    ["admin", "reports"],
    ["admin", "audit"],
    ["pos", "available"],
    ["products", "all"],
    ["products", "recently-sold"],
    ["product"],
    ["brands"],
    ["admin", "brands"],
  ],
  inventory_units: [
    ["admin", "products"],
    ["admin", "product-bills"],
    ["admin", "inventory"],
    ["admin", "dashboard-kpis"],
    ["admin", "reports"],
    ["admin", "audit"],
    ["pos", "available"],
    ["products", "all"],
    ["products", "recently-sold"],
    ["product"],
    ["receipt"],
  ],
  bills: [
    ["admin", "bills"],
    ["admin", "product-bills"],
    ["admin", "customers", "bills"],
    ["admin", "dashboard-kpis"],
    ["admin", "reports"],
    ["admin", "audit"],
    ["products", "recently-sold"],
    ["receipt"],
  ],
  bill_items: [
    ["admin", "bills"],
    ["admin", "product-bills"],
    ["admin", "customers", "bills"],
    ["admin", "dashboard-kpis"],
    ["admin", "reports"],
    ["products", "recently-sold"],
    ["receipt"],
  ],
  product_images: [
    ["admin", "products"],
    ["products", "all"],
    ["product"],
    ["products", "recently-sold"],
  ],
  brands: [
    ["admin", "brands"],
    ["admin", "brands-list"],
    ["admin", "products"],
    ["brands"],
    ["products", "all"],
    ["product"],
  ],
  shop_settings: [
    ["shop_settings"],
  ],
};

export function useRealtimeAdminSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel("admin-sync");

    for (const table of Object.keys(TABLE_INVALIDATIONS)) {
      channel.on(
        // @ts-expect-error supabase-js typing for postgres_changes is overly strict
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          const keys = TABLE_INVALIDATIONS[table];
          for (const key of keys) {
            qc.invalidateQueries({ queryKey: key });
          }
        },
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
