import { s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as PublicLayout } from "./PublicLayout-CACtl6X0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-5Zm3KE-0.js
var import_jsx_runtime = require_jsx_runtime();
function ErrorPage({ message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-4 py-20 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-bold",
			children: "Something went wrong"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: message
		})]
	}) });
}
//#endregion
export { ErrorPage as t };
