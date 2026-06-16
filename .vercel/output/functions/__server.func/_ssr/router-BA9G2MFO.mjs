import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CFqbjQaU.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { a as QueryClientProvider, c as require_react, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { A as redirect, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as brandsQuery, t as allProductsQuery } from "./catalog-ByCdkPSX.mjs";
import { t as Route$20 } from "./brand._slug-D-ZZA0mX.mjs";
import { t as Route$21 } from "./phone._slug-8NhgEBZR.mjs";
import { t as Route$22 } from "./receipt._id-39Cyhnou.mjs";
import { t as Route$23 } from "./search-BsKOwACz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BA9G2MFO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-BKoPgbUP.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$19 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{
				name: "theme-color",
				content: "#0D1117"
			},
			{ title: "USED MOBILES — Pre-Owned Smartphones, Hyderabad" },
			{
				name: "description",
				content: "Buy quality second-hand iPhone, Samsung, OnePlus and more at USED MOBILES, Toli Chowki, Hyderabad. Tested, warranted, fairly priced."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:site_name",
				content: "USED MOBILES"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				property: "og:title",
				content: "USED MOBILES — Pre-Owned Smartphones, Hyderabad"
			},
			{
				name: "twitter:title",
				content: "USED MOBILES — Pre-Owned Smartphones, Hyderabad"
			},
			{
				name: "description",
				content: "Generates HTML files with \"Hello World\" code."
			},
			{
				property: "og:description",
				content: "Generates HTML files with \"Hello World\" code."
			},
			{
				name: "twitter:description",
				content: "Generates HTML files with \"Hello World\" code."
			},
			{
				property: "og:image",
				content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/2e2d75be-b171-43c5-9976-5dfd7e086448"
			},
			{
				name: "twitter:image",
				content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/2e2d75be-b171-43c5-9976-5dfd7e086448"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: ""
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$19.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
var $$splitComponentImporter$16 = () => import("./contact-Qlzcn2qw.mjs");
var Route$18 = createFileRoute("/contact")({
	head: () => ({ meta: [
		{ title: "Visit USED MOBILES — Toli Chowki, Hyderabad" },
		{
			name: "description",
			content: "Visit USED MOBILES at Hyder Manzil, 7 Tombs Rd, Toli Chowki, Hyderabad. Call 090004 64640 or WhatsApp us."
		},
		{
			property: "og:title",
			content: "Visit USED MOBILES — Hyderabad"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitNotFoundComponentImporter$1 = () => import("./catalog-B0WFNsoE.mjs");
var $$splitErrorComponentImporter$1 = () => import("./catalog-BxI8zV_2.mjs");
var $$splitComponentImporter$15 = () => import("./catalog-DywSOHF0.mjs");
var Route$17 = createFileRoute("/catalog")({
	head: () => ({ meta: [
		{ title: "Catalog — All Pre-Owned Phones | USED MOBILES" },
		{
			name: "description",
			content: "Browse every certified pre-owned smartphone in stock at USED MOBILES Hyderabad. Filter by brand, price, and condition."
		},
		{
			property: "og:title",
			content: "Phone Catalog — USED MOBILES"
		}
	] }),
	loader: async ({ context }) => {
		await Promise.all([context.queryClient.ensureQueryData(allProductsQuery), context.queryClient.ensureQueryData(brandsQuery)]);
	},
	component: lazyRouteComponent($$splitComponentImporter$15, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent")
});
var $$splitComponentImporter$14 = () => import("./auth-BZqJs5b5.mjs");
var Route$16 = createFileRoute("/auth")({
	head: () => ({ meta: [{ title: "Staff Sign In — USED MOBILES" }] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./route-Di7iQBCH.mjs");
var Route$15 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitNotFoundComponentImporter = () => import("./routes-DEosMsxc.mjs");
var $$splitErrorComponentImporter = () => import("./routes-BMimWUEJ.mjs");
var $$splitComponentImporter$12 = () => import("./routes-Dw4WTHgM.mjs");
var Route$14 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "USED MOBILES — Certified Pre-Owned Smartphones in Hyderabad" },
		{
			name: "description",
			content: "Buy quality second-hand iPhone, Samsung, OnePlus, and more at USED MOBILES, Toli Chowki, Hyderabad. Tested, warranted, fairly priced."
		},
		{
			property: "og:title",
			content: "USED MOBILES — Pre-Owned Smartphones, Hyderabad"
		},
		{
			property: "og:description",
			content: "Tested, warranted, fairly priced pre-owned phones. Visit us in Toli Chowki."
		}
	] }),
	loader: async ({ context }) => {
		await Promise.all([context.queryClient.ensureQueryData(brandsQuery), context.queryClient.ensureQueryData(allProductsQuery)]);
	},
	component: lazyRouteComponent($$splitComponentImporter$12, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
var $$splitComponentImporter$11 = () => import("./route-cWFfp9KS.mjs");
var Route$13 = createFileRoute("/_authenticated/admin")({
	head: () => ({ meta: [{ title: "Admin · USED MOBILES" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./admin-DRX7nWvv.mjs");
var Route$12 = createFileRoute("/_authenticated/admin/")({
	head: () => ({ meta: [{ title: "Dashboard · USED MOBILES Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var Route$11 = createFileRoute("/api/public/bootstrap-admin")({ server: { handlers: {
	POST: async () => {
		try {
			const { ensureDefaultAdmin } = await import("./bootstrap-admin.server-CzdEiR5n.mjs");
			const result = await ensureDefaultAdmin();
			return new Response(JSON.stringify({
				ok: true,
				...result
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		} catch (e) {
			return new Response(JSON.stringify({
				ok: false,
				error: e?.message ?? "bootstrap failed"
			}), {
				status: 500,
				headers: { "Content-Type": "application/json" }
			});
		}
	},
	GET: async () => {
		try {
			const { ensureDefaultAdmin } = await import("./bootstrap-admin.server-CzdEiR5n.mjs");
			const result = await ensureDefaultAdmin();
			return new Response(JSON.stringify({
				ok: true,
				...result
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		} catch (e) {
			return new Response(JSON.stringify({
				ok: false,
				error: e?.message ?? "bootstrap failed"
			}), {
				status: 500,
				headers: { "Content-Type": "application/json" }
			});
		}
	}
} } });
var $$splitComponentImporter$9 = () => import("./users-DVnWsZWD.mjs");
var Route$10 = createFileRoute("/_authenticated/admin/users")({
	head: () => ({ meta: [{ title: "Users · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./settings-MthMeyQr.mjs");
var Route$9 = createFileRoute("/_authenticated/admin/settings")({
	head: () => ({ meta: [{ title: "Settings · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./reports-BYIQeUuj.mjs");
var Route$8 = createFileRoute("/_authenticated/admin/reports")({
	head: () => ({ meta: [{ title: "Reports · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./products-BH0ExlZq.mjs");
var Route$7 = createFileRoute("/_authenticated/admin/products")({
	head: () => ({ meta: [{ title: "Products · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./pos-D30hPb1C.mjs");
var Route$6 = createFileRoute("/_authenticated/admin/pos")({
	head: () => ({ meta: [{ title: "POS · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./inventory-BBm0hxV6.mjs");
var Route$5 = createFileRoute("/_authenticated/admin/inventory")({
	head: () => ({ meta: [{ title: "Inventory · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./customers-C7T9U4gA.mjs");
var Route$4 = createFileRoute("/_authenticated/admin/customers")({
	head: () => ({ meta: [{ title: "Customers · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./brands-lGcaBE0b.mjs");
var Route$3 = createFileRoute("/_authenticated/admin/brands")({
	head: () => ({ meta: [{ title: "Brands · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./bills-DBgd52Ks.mjs");
var Route$2 = createFileRoute("/_authenticated/admin/bills")({
	head: () => ({ meta: [{ title: "Bills · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./audit-Lj11UyQJ.mjs");
var Route$1 = createFileRoute("/_authenticated/admin/audit")({
	head: () => ({ meta: [{ title: "Audit Log · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var ALLOWED_BUCKETS = new Set(["product-images"]);
var Route = createFileRoute("/api/public/img/$")({ server: { handlers: { GET: async ({ params }) => {
	const [bucket, ...rest] = (params._splat ?? "").split("/");
	if (!bucket || !ALLOWED_BUCKETS.has(bucket) || rest.length === 0) return new Response("Not found", { status: 404 });
	const path = rest.join("/");
	try {
		const { supabaseAdmin } = await import("./client.server-D1oHePJa.mjs");
		const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);
		if (error || !data) return new Response("Not found", { status: 404 });
		const ct = data.type || "image/jpeg";
		return new Response(data, {
			status: 200,
			headers: {
				"Content-Type": ct,
				"Cache-Control": "public, max-age=31536000, immutable"
			}
		});
	} catch (e) {
		return new Response("Server error", { status: 500 });
	}
} } } });
var SearchRoute = Route$23.update({
	id: "/search",
	path: "/search",
	getParentRoute: () => Route$19
});
var ContactRoute = Route$18.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => Route$19
});
var CatalogRoute = Route$17.update({
	id: "/catalog",
	path: "/catalog",
	getParentRoute: () => Route$19
});
var AuthRoute = Route$16.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$19
});
var AuthenticatedRouteRoute = Route$15.update({
	id: "/_authenticated",
	getParentRoute: () => Route$19
});
var IndexRoute = Route$14.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$19
});
var PhoneSlugRoute = Route$21.update({
	id: "/phone/$slug",
	path: "/phone/$slug",
	getParentRoute: () => Route$19
});
var BrandSlugRoute = Route$20.update({
	id: "/brand/$slug",
	path: "/brand/$slug",
	getParentRoute: () => Route$19
});
var AuthenticatedAdminRouteRoute = Route$13.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminIndexRoute = Route$12.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var ApiPublicBootstrapAdminRoute = Route$11.update({
	id: "/api/public/bootstrap-admin",
	path: "/api/public/bootstrap-admin",
	getParentRoute: () => Route$19
});
var AuthenticatedReceiptIdRoute = Route$22.update({
	id: "/receipt/$id",
	path: "/receipt/$id",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminUsersRoute = Route$10.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminSettingsRoute = Route$9.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminReportsRoute = Route$8.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminProductsRoute = Route$7.update({
	id: "/products",
	path: "/products",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminPosRoute = Route$6.update({
	id: "/pos",
	path: "/pos",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminInventoryRoute = Route$5.update({
	id: "/inventory",
	path: "/inventory",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminCustomersRoute = Route$4.update({
	id: "/customers",
	path: "/customers",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminBrandsRoute = Route$3.update({
	id: "/brands",
	path: "/brands",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminBillsRoute = Route$2.update({
	id: "/bills",
	path: "/bills",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminAuditRoute = Route$1.update({
	id: "/audit",
	path: "/audit",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var ApiPublicImgSplatRoute = Route.update({
	id: "/api/public/img/$",
	path: "/api/public/img/$",
	getParentRoute: () => Route$19
});
var AuthenticatedAdminRouteRouteChildren = {
	AuthenticatedAdminAuditRoute,
	AuthenticatedAdminBillsRoute,
	AuthenticatedAdminBrandsRoute,
	AuthenticatedAdminCustomersRoute,
	AuthenticatedAdminInventoryRoute,
	AuthenticatedAdminPosRoute,
	AuthenticatedAdminProductsRoute,
	AuthenticatedAdminReportsRoute,
	AuthenticatedAdminSettingsRoute,
	AuthenticatedAdminUsersRoute,
	AuthenticatedAdminIndexRoute
};
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAdminRouteRoute: AuthenticatedAdminRouteRoute._addFileChildren(AuthenticatedAdminRouteRouteChildren),
	AuthenticatedReceiptIdRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	CatalogRoute,
	ContactRoute,
	SearchRoute,
	BrandSlugRoute,
	PhoneSlugRoute,
	ApiPublicBootstrapAdminRoute,
	ApiPublicImgSplatRoute
};
var routeTree = Route$19._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
