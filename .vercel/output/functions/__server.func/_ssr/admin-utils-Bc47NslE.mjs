//#region node_modules/.nitro/vite/services/ssr/assets/admin-utils-Bc47NslE.js
function slugify(s) {
	return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
function nextBillNumber() {
	const d = /* @__PURE__ */ new Date();
	return `INV-${`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`}-${Math.floor(1e3 + Math.random() * 9e3)}`;
}
//#endregion
export { slugify as n, nextBillNumber as t };
