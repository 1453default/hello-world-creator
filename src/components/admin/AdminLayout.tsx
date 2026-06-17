import { type ReactNode, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Tags,
  Smartphone,
  Boxes,
  ShoppingCart,
  Receipt,
  Users,
  BarChart3,
  Settings,
  ScrollText,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import logoAsset from "@/assets/used-mobiles-logo.png.asset.json";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  adminOnly?: boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/brands", label: "Brands", icon: Tags },
  { to: "/admin/products", label: "Products", icon: Smartphone },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/pos", label: "POS / Billing", icon: ShoppingCart },
  { to: "/admin/bills", label: "Bills", icon: Receipt },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: Users, adminOnly: true },
  { to: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
  { to: "/admin/audit", label: "Audit Log", icon: ScrollText, adminOnly: true },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-admin-bg text-admin-text">
      <Toaster position="top-right" toastOptions={{ style: { background: "#21262D", color: "#E6EDF3" } }} />
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex sticky top-0 h-screen w-60 shrink-0 flex-col border-r border-admin-border bg-admin-surface">
          <SidebarContent />
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              />
              <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ type: "spring", damping: 25, stiffness: 240 }}
                className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-admin-border bg-admin-surface lg:hidden"
              >
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          <TopBar onMenu={() => setMobileOpen(true)} />
          <motion.main
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-4 sm:p-6 lg:p-8"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { isAdmin } = useCurrentUser();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = NAV.filter((n) => !n.adminOnly || isAdmin);

  return (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-admin-border px-4">
        <img src={logoAsset.url} alt="" className="h-10 w-10 object-contain" onError={(e) => ((e.currentTarget.style.display = "none"))} />
        <div className="min-w-0">
          <div className="font-display text-sm font-extrabold leading-tight tracking-tight">
            USED MOBILES
          </div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-admin-muted">
            Admin Console
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-subtle">
          Operations
        </div>
        <ul className="space-y-1">
          {items.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                    active
                      ? "bg-admin-surface-2 text-admin-text"
                      : "text-admin-muted hover:bg-admin-surface-2 hover:text-admin-text"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-admin-border p-3">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex h-9 items-center gap-2 rounded-md px-3 text-xs font-medium text-admin-muted hover:bg-admin-surface-2 hover:text-admin-text"
        >
          <ExternalLink className="h-3.5 w-3.5" /> View public site
        </Link>
      </div>
    </>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { user, isAdmin } = useCurrentUser();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-admin-border bg-admin-bg/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenu}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-admin-border text-admin-muted hover:text-admin-text lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="text-xs text-admin-muted">
          Used Mobiles · Toli Chowki
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="text-xs font-semibold text-admin-text leading-tight">
            {user?.email}
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-admin-muted">
            {isAdmin ? "Admin" : "Staff"}
          </div>
        </div>
        <button
          onClick={signOut}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-admin-border bg-admin-surface px-3 text-xs font-medium text-admin-muted hover:border-ruby/40 hover:text-admin-text"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </header>
  );
}

export function CloseIconUnused() {
  return <X />;
}
