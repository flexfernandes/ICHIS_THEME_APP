/**
 * GF Overlay v5.0 — Abordagem correta para Frappe v16
 * Override de frappe.views.Workspace.show()
 * Baseado em: https://medium.com/@pratheeshrussell/customising-frappe-erpnext-ui-part-ii
 */

window.gfOverlayVersion  = "GF_OVERLAY_V5";
window.gfOverlayLoaded   = true;
window.gfOverlayActive   = false;
window.gfOverlayPages    = [];
window.gfOverlaySettings = null;
window.gfCurrentPageData = null;

if (window.location.pathname.indexOf("/login") !== -1) {
  // não roda no login
} else {
  console.log("[GF Overlay] v5 iniciando...");
  _gfInit();
}

function _gfInit() {
  _gfWaitFrappe(function () {
    frappe.call({
      method: "ichis_theme_app.api.theme.get_overlay_settings",
      callback: function (r) {
        var s = r && r.message;
        window.gfOverlaySettings = s || {};
        if (!s || !s.ativar_sobreposicoes || !s.ativar_sobreposicao_desk) {
          console.log("[GF Overlay] Desativado."); return;
        }
        frappe.call({
          method: "ichis_theme_app.api.theme.get_active_overlay_pages",
          callback: function (r2) {
            window.gfOverlayPages = Array.isArray(r2 && r2.message) ? r2.message : [];
            console.log("[GF Overlay] Páginas:", window.gfOverlayPages.length);

            // Encontra a página do Desk
            var deskPage = null;
            for (var i = 0; i < window.gfOverlayPages.length; i++) {
              if (window.gfOverlayPages[i].tipo_alvo === "Desk" && window.gfOverlayPages[i].ativo) {
                deskPage = window.gfOverlayPages[i]; break;
              }
            }

            if (!deskPage) {
              console.log("[GF Overlay] Nenhuma página Desk ativa."); return;
            }

            // Override do frappe.views.Workspace
            _gfOverrideWorkspace(deskPage);
          }
        });
      }
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

function _gfOverrideWorkspace(deskPage) {
  // Aguarda frappe.views.Workspace estar disponível
  var t = 0;
  var iv = setInterval(function () {
    if (typeof frappe !== "undefined" && frappe.views && frappe.views.Workspace) {
      clearInterval(iv);
      _gfDoOverride(deskPage);
    } else if (++t > 100) {
      clearInterval(iv);
      console.warn("[GF Overlay] frappe.views.Workspace não encontrado.");
    }
  }, 100);
}

function _gfDoOverride(deskPage) {
  var OriginalWorkspace = frappe.views.Workspace;

  frappe.views.Workspace = class GFWorkspace extends OriginalWorkspace {
    show() {
      // Verifica se é a home (sem workspace específico ou workspace=Home)
      var route = frappe.get_route ? frappe.get_route() : [];
      var isHome = !route || route.length === 0 ||
        (route[0] === "Workspaces" && (!route[1] || route[1].toLowerCase() === "home"));

      console.log("[GF Overlay] Workspace.show() | route:", JSON.stringify(route), "| isHome:", isHome);

      if (isHome) {
        // Mostra overlay em vez do workspace padrão
        _gfApply(deskPage);
      } else {
        // Remove overlay e deixa o Frappe renderizar normalmente
        _gfRemove();
        super.show();
      }
    }
  };

  console.log("[GF Overlay] frappe.views.Workspace sobrescrito com sucesso.");

  // Força a avaliação inicial
  setTimeout(function () {
    try {
      var route = frappe.get_route ? frappe.get_route() : [];
      var isHome = !route || route.length === 0 ||
        (route[0] === "Workspaces" && (!route[1] || route[1].toLowerCase() === "home"));
      if (isHome) _gfApply(deskPage);
    } catch (e) {}
  }, 300);
}

function _gfApply(page) {
  if (window.gfOverlayActive) return;
  window.gfOverlayActive   = true;
  window.gfCurrentPageData = page;

  // Injeta CSS de controle
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
  if (!window.gfOverlayActive) return;
  window.gfOverlayActive   = false;
  window.gfCurrentPageData = null;
  document.body.classList.remove("gf-ov-active");
  var r = document.getElementById("gf-ui-overlay-root"); if (r) r.remove();
  var c = document.getElementById("gf-ov-page-css");     if (c) c.remove();
  console.log("[GF Overlay] Removido.");
}

// Navegação a partir dos cards
window.gfNav = function (route, event) {
  if (event) event.preventDefault();
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
