import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CFqbjQaU.mjs";
import { c as require_react, i as useQuery, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { l as formatINR, o as SHOP_PHONE, s as SHOP_WHATSAPP_DISPLAY, t as SHOP_ADDRESS } from "./shop-DeTn0H1N.mjs";
import { N as notFound, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { R as ArrowLeft, g as Printer } from "../_libs/lucide-react.mjs";
import { t as used_mobiles_logo_png_asset_default } from "./used-mobiles-logo.png.asset-TWj9XZzS.mjs";
import { t as Route } from "./receipt._id-39Cyhnou.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/receipt._id-BhWlYips.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReceiptPage() {
	const { id } = Route.useParams();
	const auto = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("print");
	const { data, isLoading, error } = useQuery({
		queryKey: ["receipt", id],
		queryFn: async () => {
			const { data: bill, error: e1 } = await supabase.from("bills").select("*").eq("id", id).maybeSingle();
			if (e1) throw e1;
			if (!bill) throw notFound();
			const { data: items, error: e2 } = await supabase.from("bill_items").select("id, description, unit_price, quantity, line_total, inventory_unit_id, product_id, inventory_unit:inventory_units(imei), product:products(name, brand:brands(name))").eq("bill_id", id).order("created_at");
			if (e2) throw e2;
			return {
				bill,
				items: items ?? []
			};
		}
	});
	(0, import_react.useEffect)(() => {
		if (auto && data) {
			const t = setTimeout(() => window.print(), 400);
			return () => clearTimeout(t);
		}
	}, [auto, data]);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-10 text-center text-sm",
		children: "Loading receipt…"
	});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-10 text-center text-sm text-red-600",
		children: error.message
	});
	if (!data) return null;
	const { bill, items } = data;
	const created = new Date(bill.created_at);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-neutral-100 text-black print:bg-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-neutral-300 bg-white px-4 py-3 shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin/bills",
						className: "inline-flex h-9 items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to Bills"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-neutral-500",
						children: ["Invoice ", bill.bill_number]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => window.print(),
						className: "inline-flex h-9 items-center gap-1.5 rounded-md bg-black px-4 text-sm font-bold text-white hover:bg-neutral-800",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-4 w-4" }), " Print"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto my-6 max-w-[820px] bg-white p-10 shadow-md print:m-0 print:max-w-none print:p-12 print:shadow-none",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-6 border-b border-neutral-200 pb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: used_mobiles_logo_png_asset_default.url,
								alt: "USED MOBILES",
								className: "h-14 w-14 object-contain"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-xl font-extrabold leading-tight tracking-tight text-black",
								children: "USED MOBILES"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] uppercase tracking-[0.18em] text-neutral-500",
								children: "Pre-owned Smartphones"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl italic font-semibold text-black",
							children: "Invoice"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid grid-cols-2 gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-bold uppercase tracking-wider text-neutral-500",
								children: "Billed to:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 font-semibold text-black",
								children: bill.customer_name || "Walk-in Customer"
							}),
							bill.customer_phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-neutral-700",
								children: bill.customer_phone
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-black",
										children: "Invoice No."
									}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono",
										children: bill.bill_number
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-neutral-700",
									children: created.toLocaleDateString("en-IN", {
										day: "2-digit",
										month: "long",
										year: "numeric"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-neutral-500",
									children: created.toLocaleTimeString("en-IN", {
										hour: "2-digit",
										minute: "2-digit"
									})
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full border-collapse text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b-2 border-black text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 font-bold text-black",
										children: "Item"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 font-bold text-black",
										children: "IMEI"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 text-center font-bold text-black",
										children: "Qty"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 text-right font-bold text-black",
										children: "Unit Price"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 text-right font-bold text-black",
										children: "Total"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: items.map((it) => {
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-neutral-200 align-top",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 pr-2 text-black",
											children: it.product ? `${it.product.brand?.name ?? ""} ${it.product.name}`.trim() : it.description ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 pr-2 font-mono text-xs text-neutral-700",
											children: it.inventory_unit?.imei || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 text-center text-black",
											children: it.quantity
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 text-right font-num text-black",
											children: formatINR(it.unit_price)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 text-right font-num font-semibold text-black",
											children: formatINR(it.line_total)
										})
									]
								}, it.id);
							}) })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-full max-w-xs space-y-1.5 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-black",
										children: "Subtotal"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-num text-black",
										children: formatINR(bill.subtotal)
									})]
								}),
								Number(bill.discount) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-black",
										children: "Discount"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-num text-black",
										children: ["− ", formatINR(bill.discount)]
									})]
								}),
								Number(bill.tax) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-black",
										children: "Tax"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-num text-black",
										children: formatINR(bill.tax)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-center justify-between bg-black px-4 py-2.5 text-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold tracking-wide",
										children: "Total"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-num text-lg font-extrabold",
										children: formatINR(bill.grand_total)
									})]
								}),
								bill.payment_method && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pt-2 text-right text-xs text-neutral-500",
									children: ["Payment: ", bill.payment_method]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-16 font-display text-3xl italic text-black",
						children: "Thank You!"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-12 border-t border-neutral-200 pt-4 text-right text-xs text-neutral-700",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-base font-bold text-black",
								children: "Used Mobiles"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: SHOP_ADDRESS }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								"Phone: ",
								SHOP_PHONE,
								" · WhatsApp: ",
								SHOP_WHATSAPP_DISPLAY
							] })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
        }
      ` })
		]
	});
}
//#endregion
export { ReceiptPage as component };
