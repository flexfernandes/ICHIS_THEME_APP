/**
 * GF Overlay v4.0 — Abordagem definitiva para Frappe v16
 * Usa frappe.router para detectar rota corretamente
 */

window.gfOverlayVersion  = "GF_OVERLAY_V4";
window.gfOverlayLoaded   = true;
window.gfOverlayActive   = false;
window.gfOverlayPages    = [];
window.gfOverlaySettings = null;
window.gfCurrentPageData = null;

if (window.location.pathname.indexOf("/login") !== -1) {
  // Não roda no login
} else {
  console.log("[GF Overlay] v4 iniciando...");
  _gfInit();
}

function _gfInit() {
  _gfWaitFrappe(function () {
    frappe.call({
      method: "ichis_theme_app.api.theme.get_overlay_settings",
      callback: function (r) {
        var s = r && r.message;
        window.gfOverlaySettings = s || {};
        if (!s || !s.ativar_sobreposicoes) {
          console.log("[GF Overlay] Desativado.");
          return;
        }
        frappe.call({
          method: "ichis_theme_app.api.theme.get_active_overlay_pages",
          callback: function (r2) {
            window.gfOverlayPages = Array.isArray(r2 && r2.message) ? r2.message : [];
            console.log("[GF Overlay] Páginas:", window.gfOverlayPages.length);

            // Usa o evento do Frappe router — disparado em TODA mudança de rota
            frappe.router.on("change", function () {
              setTimeout(_gfEvaluate, 100);
            });

            // Avalia imediatamente na carga
            setTimeout(_gfEvaluate, 300);
          },
          error: function () {}
        });
      },
      error: function () {}
    });
  });
}

function _gfWaitFrappe(cb) {
  if (typeof frappe !== "undefined" && frappe.ready) { frappe.ready(cb); return; }
  var t = 0, iv = setInterval(function () {
    if (typeof frappe !== "undefined" && frappe.ready) { clearInterval(iv); frappe.ready(cb); }
    else if (++t > 50) { clearInterval(iv); cb(); }
  }, 100);
}

// Avalia se deve mostrar overlay baseado na rota atual do Frappe
function _gfEvaluate() {
  try {
    // Pega a rota atual do Frappe router (mais confiável que pathname)
    var frappeRoute = frappe.get_route ? frappe.get_route() : [];
    var pathname    = window.location.pathname || "";

    console.log("[GF Overlay] Rota Frappe:", frappeRoute, "| Pathname:", pathname);

    // É o desk home se:
    // 1. frappe.get_route() retorna array vazio ou ["workspace"]
    // 2. pathname é exatamente /desk
    var isHome = (
      pathname === "/desk" ||
      pathname === "/desk/" ||
      (Array.isArray(frappeRoute) && (
        frappeRoute.length === 0 ||
        frappeRoute[0] === "workspace" ||
        frappeRoute[0] === "Workspaces"
      ))
    );

    // Mas NÃO é home se tem subrota (ex: workspace/Home é ok, stock não)
    if (Array.isArray(frappeRoute) && frappeRoute.length > 1) {
      var sub = (frappeRoute[1] || "").toLowerCase();
      // workspace/Home é a home real
      if (frappeRoute[0] === "workspace" && sub !== "home" && sub !== "") {
        isHome = false;
      } else if (frappeRoute[0] !== "workspace") {
        isHome = false;
      }
    }

    console.log("[GF Overlay] isHome:", isHome, "| overlayActive:", window.gfOverlayActive);

    if (isHome) {
      // Encontra a página de overlay do Desk
      var page = null;
      for (var i = 0; i < window.gfOverlayPages.length; i++) {
        if (window.gfOverlayPages[i].tipo_alvo === "Desk" && window.gfOverlayPages[i].ativo) {
          page = window.gfOverlayPages[i];
          break;
        }
      }
      if (page && !window.gfOverlayActive) {
        _gfApply(page);
      }
    } else {
      if (window.gfOverlayActive) {
        _gfRemove();
      }
    }
  } catch (e) {
    console.warn("[GF Overlay] _gfEvaluate erro:", e);
    _gfRemove();
  }
}

function _gfApply(page) {
  window.gfOverlayActive   = true;
  window.gfCurrentPageData = page;

  // Injeta CSS do boot para ocultar o desk
  var bootStyle = document.getElementById("gf-ov-boot-style");
  if (!bootStyle) {
    bootStyle = document.createElement("style");
    bootStyle.id = "gf-ov-boot-style";
    bootStyle.textContent =
      "body.gf-ov-active .layout-main-section,body.gf-ov-active #page-desktop," +
      "body.gf-ov-active .desk-sidebar,body.gf-ov-active .standard-sidebar," +
      "body.gf-ov-active .page-container{visibility:hidden!important;pointer-events:none!important}" +
      "#gf-ui-overlay-root{display:none;position:fixed;top:56px;left:0;right:0;bottom:0;" +
      "z-index:900;overflow:hidden;flex-direction:column;background:#f1f5f9}" +
      "body.gf-ov-active #gf-ui-overlay-root{display:flex!important}" +
      ".gf-anim-suave{animation:gfAS 260ms ease both}" +
      "@keyframes gfAS{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}";
    document.head.appendChild(bootStyle);
  }

  var old = document.getElementById("gf-ui-overlay-root"); if (old) old.remove();
  var ocs = document.getElementById("gf-ov-page-css");     if (ocs) ocs.remove();

  var root = document.createElement("div");
  root.id  = "gf-ui-overlay-root";
  root.classList.add("gf-anim-suave");
  document.body.appendChild(root);

  if (page.css_customizado && page.css_customizado.trim()) {
    var sc = document.createElement("style");
    sc.id  = "gf-ov-page-css";
    sc.textContent = page.css_customizado;
    document.head.appendChild(sc);
  }

  document.body.classList.add("gf-ov-active");

  if (page.js_customizado && page.js_customizado.trim()) {
    try { (new Function(page.js_customizado))(); }
    catch (e) { console.warn("[GF Overlay] JS customizado:", e); }
  }

  console.log("[GF Overlay] Overlay ativo:", page.titulo);
}

function _gfRemove() {
  window.gfOverlayActive   = false;
  window.gfCurrentPageData = null;
  document.body.classList.remove("gf-ov-active");
  var r = document.getElementById("gf-ui-overlay-root"); if (r) r.remove();
  var c = document.getElementById("gf-ov-page-css");     if (c) c.remove();
  console.log("[GF Overlay] Overlay removido.");
}

// Funções públicas chamadas pelo HTML do overlay
window.gfNav = function (route, event) {
  if (event) event.preventDefault();
  _gfRemove();
  setTimeout(function () {
    try {
      var parts = route.replace(/^\/(desk|app)\/?/, "").split("/").filter(Boolean);
      if (parts.length) frappe.set_route(parts);
      else frappe.set_route("workspace");
    } catch (e) { window.location.href = route; }
  }, 50);
  return false;
};

window.gfReturnToOriginalDesk = function () {
  _gfRemove();
  setTimeout(function () {
    try { frappe.set_route("workspace"); }
    catch (e) { window.location.href = "/desk"; }
  }, 50);
};
