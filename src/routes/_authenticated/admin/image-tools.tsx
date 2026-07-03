import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getImageMigrationStats,
  listMigrationCandidates,
  processProductImage,
  type MigrationStats,
  type PendingImage,
  type ProcessResult,
} from "@/lib/image-migration.functions";

export const Route = createFileRoute("/_authenticated/admin/image-tools")({
  head: () => ({ meta: [{ title: "Image Tools · Admin" }] }),
  component: ImageToolsPage,
});

type LogRow = {
  ts: number;
  id: string;
  name: string;
  status: "done" | "failed" | "skipped";
  message?: string;
};

const CONCURRENCY = 2;

function ImageToolsPage() {
  const statsQ = useQuery({
    queryKey: ["admin", "image-migration", "stats"],
    queryFn: () => getImageMigrationStats(),
    refetchInterval: 5_000,
  });

  const pendingQ = useQuery({
    queryKey: ["admin", "image-migration", "pending"],
    queryFn: () => listMigrationCandidates({ data: { mode: "pending", limit: 1000 } }),
  });
  const failedQ = useQuery({
    queryKey: ["admin", "image-migration", "failed"],
    queryFn: () => listMigrationCandidates({ data: { mode: "failed", limit: 1000 } }),
  });

  const [running, setRunning] = useState(false);
  const stopRef = useRef(false);
  const [progress, setProgress] = useState({ done: 0, failed: 0, total: 0 });
  const [log, setLog] = useState<LogRow[]>([]);

  const processMut = useMutation({
    mutationFn: (input: { id: string; force?: boolean }) =>
      processProductImage({ data: input }) as Promise<ProcessResult>,
  });

  async function runQueue(items: PendingImage[], force = false) {
    if (running) return;
    if (items.length === 0) {
      toast("Nothing to process");
      return;
    }
    stopRef.current = false;
    setRunning(true);
    setProgress({ done: 0, failed: 0, total: items.length });
    setLog([]);

    let index = 0;
    let done = 0;
    let failed = 0;

    async function worker() {
      while (!stopRef.current) {
        const my = index++;
        if (my >= items.length) return;
        const item = items[my];
        try {
          const r = await processMut.mutateAsync({ id: item.id, force });
          if (r.status === "done") done++;
          else if (r.status === "failed") failed++;
          setLog((prev) => [
            { ts: Date.now(), id: item.id, name: item.product_name, status: r.status, message: r.error },
            ...prev.slice(0, 199),
          ]);
        } catch (e) {
          failed++;
          setLog((prev) => [
            { ts: Date.now(), id: item.id, name: item.product_name, status: "failed", message: (e as Error).message },
            ...prev.slice(0, 199),
          ]);
        }
        setProgress({ done, failed, total: items.length });
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);
    setRunning(false);
    // Refresh stats & lists.
    statsQ.refetch();
    pendingQ.refetch();
    failedQ.refetch();
    toast.success(`Migration finished — ${done} done, ${failed} failed`);
  }

  const stats: MigrationStats | undefined = statsQ.data;
  const pending = pendingQ.data ?? [];
  const failed = failedQ.data ?? [];

  const percent = useMemo(() => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.done / stats.total) * 100);
  }, [stats]);

  useEffect(() => () => { stopRef.current = true; }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 text-admin-text">
      <div>
        <h1 className="text-2xl font-semibold">Image Tools</h1>
        <p className="mt-1 text-sm text-admin-muted">
          One-time bulk migration: replace each product image's background with pure white using AI.
          Originals are preserved as backups (<code>original_url</code>). Failures are safe — the site keeps
          rendering the original image if the processed version is missing.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total" value={stats?.total ?? "—"} />
        <StatCard label="Done" value={stats?.done ?? "—"} tone="ok" />
        <StatCard label="Pending" value={stats?.pending ?? "—"} tone="warn" />
        <StatCard label="Failed" value={stats?.failed ?? "—"} tone="err" />
        <StatCard label="Skipped" value={stats?.skipped ?? "—"} />
      </div>

      <div className="rounded-lg border border-admin-border bg-admin-surface p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-sm font-medium">Overall progress</div>
          <div className="text-xs text-admin-muted">{percent}%</div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded bg-admin-bg">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        {running && (
          <div className="mt-3 text-xs text-admin-muted">
            Batch: {progress.done + progress.failed} / {progress.total} · ✓ {progress.done} · ✕ {progress.failed}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={running || pending.length === 0}
          onClick={() => runQueue(pending, false)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? "Processing…" : `Start migration (${pending.length} pending)`}
        </button>
        <button
          type="button"
          disabled={running || failed.length === 0}
          onClick={() => runQueue(failed, true)}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Retry failed ({failed.length})
        </button>
        {running && (
          <button
            type="button"
            onClick={() => { stopRef.current = true; }}
            className="rounded-md border border-admin-border px-4 py-2 text-sm font-medium hover:bg-admin-bg"
          >
            Stop
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            statsQ.refetch();
            pendingQ.refetch();
            failedQ.refetch();
          }}
          className="rounded-md border border-admin-border px-4 py-2 text-sm font-medium hover:bg-admin-bg"
        >
          Refresh
        </button>
      </div>

      {failed.length > 0 && (
        <section className="rounded-lg border border-admin-border bg-admin-surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Failed items ({failed.length})</h2>
          <ul className="max-h-64 space-y-1 overflow-auto text-xs">
            {failed.slice(0, 100).map((f) => (
              <li key={f.id} className="flex items-start justify-between gap-4 rounded px-2 py-1 hover:bg-admin-bg">
                <span className="truncate">{f.product_name || "(unnamed)"}</span>
                <span className="shrink-0 text-red-400">{f.process_error ?? "unknown error"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {log.length > 0 && (
        <section className="rounded-lg border border-admin-border bg-admin-surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Live log</h2>
          <ul className="max-h-72 space-y-1 overflow-auto text-xs font-mono">
            {log.map((l) => (
              <li key={`${l.id}-${l.ts}`} className="flex items-start justify-between gap-4">
                <span>
                  <span
                    className={
                      l.status === "done"
                        ? "text-emerald-400"
                        : l.status === "failed"
                        ? "text-red-400"
                        : "text-admin-muted"
                    }
                  >
                    ● {l.status}
                  </span>{" "}
                  <span className="text-admin-muted">{l.name}</span>
                </span>
                {l.message && <span className="text-red-400/80 truncate">{l.message}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number | string; tone?: "ok" | "warn" | "err" }) {
  const color =
    tone === "ok" ? "text-emerald-400" : tone === "warn" ? "text-amber-400" : tone === "err" ? "text-red-400" : "text-admin-text";
  return (
    <div className="rounded-lg border border-admin-border bg-admin-surface p-3">
      <div className="text-xs uppercase tracking-wide text-admin-muted">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
