/**
 * GF Overlay v4.2 — Frappe v16
 * Usa pathname como fonte primária de verdade,
 * frappe.get_route() como confirmação secundária.
 */

window.gfOverlayVersion  = "GF_OVERLAY_V4";
window.gfOverlayLoaded   = true;
window.gfOverlayActive   = false;
window.gfOverlayPages    = [];
window.gfOverlaySettings = null;
window.gfCurrentPageData = null;

if (window.location.pathname.indexOf("/login") !== -1) {
  // não roda no login
} else {
  console.log("[GF Overlay] v4.2 iniciando...");
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
          console.log("[GF Overlay] Desativado."); return;
        }
        frappe.call({
          method: "ichis_theme_app.api.theme.get_active_overlay_pages",
          callback: function (r2) {
            window.gfOverlayPages = Array.isArray(r2 && r2.message) ? r2.message : [];
            console.log("[GF Overlay] Páginas:", window.gfOverlayPages.length);

            // Registra listener de rota com delay generoso
            frappe.router.on("change", function () {
              // Aguarda 500ms para o Frappe terminar de renderizar
              // e o pathname ser atualizado
              setTimeout(_gfEvaluate, 500);
            });

            // Avalia na carga inicial
            setTimeout(_gfEvaluate, 400);
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

// Determina se está na home do desk
// FONTE PRIMÁRIA: pathname
// No Frappe v16, home = /desk (sem nada depois ou com /Home)
function _gfIsHome() {
  var pathname = window.location.pathname || "";
  var path     = pathname.replace(/\/$/, "").toLowerCase();

  console.log("[GF Overlay] pathname:", pathname);

  // Home exata
  if (path === "/desk") return true;
  if (path === "/desk/home") return true;

  // Qualquer outra subrota de /desk não é home
  if (path.startsWith("/desk/") && path !== "/desk/home") return false;

  // Fallback: usa frappe.get_route
  try {
    var route = frappe.get_route ? frappe.get_route() : [];
    if (!Array.isArray(route) || route.length === 0) return true;
    if (route[0] === "Workspaces" || route[0] === "workspace") {
      var sub = (route[1] || "").toLowerCase().trim();
      return sub === "home" || sub === "";
    }
  } catch (e) {}

  return false;
}

function _gfEvaluate() {
  try {
    var isHome = _gfIsHome();
    console.log("[GF Overlay] isHome:", isHome, "| active:", window.gfOverlayActive);

    if (isHome && !window.gfOverlayActive) {
      // Encontra página de overlay do Desk
      var page = null;
      for (var i = 0; i < window.gfOverlayPages.length; i++) {
        if (window.gfOverlayPages[i].tipo_alvo === "Desk" &&
            window.gfOverlayPages[i].ativo) {
          page = window.gfOverlayPages[i]; break;
        }
      }
      if (page) _gfApply(page);

    } else if (!isHome && window.gfOverlayActive) {
      _gfRemove();
    }
  } catch (e) {
    console.warn("[GF Overlay] _gfEvaluate:", e);
    _gfRemove();
  }
}

function _gfApply(page) {
  window.gfOverlayActive   = true;
  window.gfCurrentPageData = page;

  // Injeta CSS de controle se ainda não existe
  if (!document.getElementById("gf-ov-style")) {
    var st = document.createElement("style");
    st.id  = "gf-ov-style";
    st.textContent =
      "body.gf-ov-active .layout-main-section," +
      "body.gf-ov-active #page-desktop," +
      "body.gf-ov-active .desk-sidebar," +
      "body.gf-ov-active .standard-sidebar," +
      "body.gf-ov-active .page-container{visibility:hidden!important;pointer-events:none!important}" +
      "#gf-ui-overlay-root{display:none;position:fixed;top:56px;left:0;right:0;bottom:0;" +
      "z-index:900;overflow:hidden;flex-direction:column}" +
      "body.gf-ov-active #gf-ui-overlay-root{display:flex!important}" +
      ".gf-anim-suave{animation:gfAS 260ms ease both}" +
      "@keyframes gfAS{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}";
    document.head.appendChild(st);
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

  console.log("[GF Overlay] Ativo:", page.titulo);
}

function _gfRemove() {
  window.gfOverlayActive   = false;
  window.gfCurrentPageData = null;
  document.body.classList.remove("gf-ov-active");
  var r = document.getElementById("gf-ui-overlay-root"); if (r) r.remove();
  var c = document.getElementById("gf-ov-page-css");     if (c) c.remove();
  console.log("[GF Overlay] Removido.");
}

// Navegação a partir dos cards do overlay
window.gfNav = function (route, event) {
  if (event) event.preventDefault();
  // Remove overlay ANTES de navegar
  _gfRemove();
  setTimeout(function () {
    try {
      var parts = route.replace(/^\/(desk|app)\/?/, "").split("/").filter(Boolean);
      if (parts.length) frappe.set_route(parts);
      else frappe.set_route("workspace");
    } catch (e) { window.location.href = route; }
  }, 30);
  return false;
};

window.gfReturnToOriginalDesk = function () {
  _gfRemove();
  setTimeout(function () {
    try { frappe.set_route("workspace"); }
    catch (e) { window.location.href = "/desk"; }
  }, 30);
};
