import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CFqbjQaU.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as used_mobiles_logo_png_asset_default } from "./used-mobiles-logo.png.asset-TWj9XZzS.mjs";
import { n, t as Fe } from "../_libs/react-hot-toast.mjs";
import { i as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-BZqJs5b5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MAX_ATTEMPTS = 10;
var LOCKOUT_MS = 300 * 1e3;
var CAPTCHA_AFTER = 5;
var LS_KEY = "um_auth_attempts_v1";
function loadAttempts() {
	try {
		const raw = typeof localStorage !== "undefined" ? localStorage.getItem(LS_KEY) : null;
		if (!raw) return {
			count: 0,
			lockedUntil: null
		};
		return JSON.parse(raw);
	} catch {
		return {
			count: 0,
			lockedUntil: null
		};
	}
}
function saveAttempts(s) {
	try {
		localStorage.setItem(LS_KEY, JSON.stringify(s));
	} catch {}
}
function AuthPage() {
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [attempts, setAttempts] = (0, import_react.useState)({
		count: 0,
		lockedUntil: null
	});
	const [captchaInput, setCaptchaInput] = (0, import_react.useState)("");
	const captchaRef = (0, import_react.useRef)({
		a: 0,
		b: 0
	});
	const [now, setNow] = (0, import_react.useState)(Date.now());
	(0, import_react.useEffect)(() => {
		setAttempts(loadAttempts());
		const t = setInterval(() => setNow(Date.now()), 1e3);
		return () => clearInterval(t);
	}, []);
	(0, import_react.useEffect)(() => {
		if (attempts.count >= CAPTCHA_AFTER) {
			captchaRef.current = {
				a: Math.floor(Math.random() * 8) + 1,
				b: Math.floor(Math.random() * 8) + 1
			};
			setCaptchaInput("");
		}
	}, [attempts.count]);
	(0, import_react.useEffect)(() => {
		fetch("/api/public/bootstrap-admin", { method: "POST" }).catch(() => {});
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) navigate({ to: "/admin" });
		});
	}, [navigate]);
	const lockedUntil = attempts.lockedUntil;
	const locked = lockedUntil != null && lockedUntil > now;
	const secsRemaining = locked ? Math.ceil((lockedUntil - now) / 1e3) : 0;
	const showCaptcha = attempts.count >= CAPTCHA_AFTER && !locked;
	async function handleSubmit(e) {
		e.preventDefault();
		if (locked) {
			n.error(`Too many failed attempts. Try again in ${secsRemaining}s.`);
			return;
		}
		if (showCaptcha) {
			const expected = captchaRef.current.a + captchaRef.current.b;
			if (Number(captchaInput) !== expected) {
				n.error("Incorrect verification answer");
				return;
			}
		}
		setLoading(true);
		const delay = Math.min(attempts.count * 200, 2e3);
		if (delay) await new Promise((r) => setTimeout(r, delay));
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (error) throw error;
			saveAttempts({
				count: 0,
				lockedUntil: null
			});
			setAttempts({
				count: 0,
				lockedUntil: null
			});
			console.info("[auth] login success", {
				email,
				t: (/* @__PURE__ */ new Date()).toISOString()
			});
			n.success("Welcome back");
			navigate({ to: "/admin" });
		} catch (err) {
			const next = attempts.count + 1;
			const locked = next >= MAX_ATTEMPTS;
			const newState = {
				count: locked ? 0 : next,
				lockedUntil: locked ? Date.now() + LOCKOUT_MS : null
			};
			saveAttempts(newState);
			setAttempts(newState);
			console.warn("[auth] login failed", {
				email,
				attempt: next,
				t: (/* @__PURE__ */ new Date()).toISOString()
			});
			n.error(locked ? `Too many failed attempts. Account locked for ${Math.round(LOCKOUT_MS / 6e4)} minutes.` : "Invalid credentials. Please try again.");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex items-center justify-center bg-background px-4 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fe, { position: "top-center" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				y: 8
			},
			animate: {
				opacity: 1,
				y: 0
			},
			className: "w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2 mb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: used_mobiles_logo_png_asset_default.url,
						alt: "",
						className: "h-10 w-10 object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display font-extrabold tracking-tight text-foreground",
						children: "USED MOBILES"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground",
						children: "Staff portal"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold",
					children: "Sign in to continue"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Internal access for shop staff and admins only."
				}),
				locked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-xl border border-ruby/40 bg-ruby/10 p-3 text-sm text-ruby",
					children: [
						"Account temporarily locked due to repeated failed attempts. Try again in",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							className: "font-num",
							children: [secsRemaining, "s"]
						}),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "mt-6 space-y-3",
					autoComplete: "on",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "Enter your email",
								autoComplete: "username",
								required: true,
								disabled: locked,
								className: "h-12 w-full rounded-xl border border-border bg-background px-4 outline-none focus:border-primary disabled:opacity-60"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Password",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "password",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								placeholder: "Enter your password",
								autoComplete: "current-password",
								required: true,
								minLength: 6,
								disabled: locked,
								className: "h-12 w-full rounded-xl border border-border bg-background px-4 outline-none focus:border-primary disabled:opacity-60"
							})
						}),
						showCaptcha && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Verification — what is ${captchaRef.current.a} + ${captchaRef.current.b}?`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								value: captchaInput,
								onChange: (e) => setCaptchaInput(e.target.value),
								placeholder: "Answer",
								required: true,
								className: "h-12 w-full rounded-xl border border-amber/40 bg-amber/5 px-4 outline-none focus:border-primary"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: loading || locked,
							className: "mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground hover:bg-amber-dark transition disabled:opacity-50",
							children: loading ? "Please wait…" : locked ? `Locked (${secsRemaining}s)` : "Sign in"
						}),
						attempts.count > 0 && !locked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-center text-[11px] text-muted-foreground",
							children: [
								MAX_ATTEMPTS - attempts.count,
								" attempt",
								MAX_ATTEMPTS - attempts.count === 1 ? "" : "s",
								" remaining before lockout"
							]
						})
					]
				})
			]
		})]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5",
			children: label
		}), children]
	});
}
//#endregion
export { AuthPage as component };
