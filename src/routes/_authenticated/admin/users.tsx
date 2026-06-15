import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users · Admin" }] }),
  component: UsersPage,
});

function UsersPage() {
  const { isAdmin, loading } = useCurrentUser();
  const qc = useQueryClient();

  const { data: roles = [] } = useQuery({
    queryKey: ["admin", "user-roles"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("id, user_id, role, created_at").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role removed");
      qc.invalidateQueries({ queryKey: ["admin", "user-roles"] });
    },
  });

  if (loading) return <div className="text-admin-muted">Loading…</div>;
  if (!isAdmin) return <div className="rounded-xl border border-admin-border bg-admin-surface p-6 text-admin-muted">Admin access required.</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Users & Roles</h1>
        <p className="text-sm text-admin-muted">Manage staff and admin role assignments. To add a user, sign them in via /auth, then grant a role via SQL or here once their user_id is known.</p>
      </header>
      <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
        <table className="w-full text-sm">
          <thead className="bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted">
            <tr><th className="px-4 py-3">User ID</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Granted</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {roles.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-admin-muted">No role assignments.</td></tr>
            ) : roles.map((r: any) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-mono text-xs">{r.user_id}</td>
                <td className="px-4 py-3"><span className="rounded bg-amber/20 px-2 py-1 text-xs font-bold text-amber">{r.role}</span></td>
                <td className="px-4 py-3 text-admin-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => confirm("Remove this role?") && del.mutate(r.id)} className="inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-ruby/20 hover:text-ruby"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
