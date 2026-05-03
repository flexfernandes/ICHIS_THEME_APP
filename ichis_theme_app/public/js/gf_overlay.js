/**
 * GF Overlay — gf_overlay.js v16
 * GREENFARMS | ichis_theme_app
 *
 * CORREÇÃO v16:
 * _isHome() estava interceptando Workspaces/Selling, Workspaces/Buying etc.
 * porque verificava apenas se route[0] === "workspaces".
 *
 * Agora: só é HOME se route[1] for exatamente "" ou "home".
 * Qualquer outro workspace (Selling, Buying, Stock etc.) passa normalmente.
 */

window.gfOverlayVersion = "GF_OVERLAY_V16";

// ── CSS imediato para /desk e /app ────────────────────────────
(function () {
  var p = window.location.pathname.replace(/\/$/, "");
  if (p !== "/desk" && p !== "/app") return;
  var s = document.createElement("style");
  s.id  = "gf-boot-hide";
  s.textContent =
    ".layout-main,.layout-main-section,#page-desktop," +
    ".page-container,.desk-sidebar{visibility:hidden!important}";
  (document.head || document.documentElement).appendChild(s);
  setTimeout(function () {
    var x = document.getElementById("gf-boot-hide");
    if (x) x.remove();
  }, 4000);
})();

// ── Aguarda frappe ────────────────────────────────────────────
function _gfWaitReady(cb) {
  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    if (typeof frappe !== "undefined" && frappe.router) {
      clearInterval(iv);
      cb();
    } else if (tries > 100) {
      clearInterval(iv);
    }
  }, 100);
}

// ── Detecta se é a Home REAL ──────────────────────────────────
// HOME REAL: rota vazia [], [""] ou ["Workspaces","Home"] ou ["Workspaces",""]
// NÃO é home: ["Workspaces","Selling"], ["Workspaces","Buying"], etc.
function _gfIsHome() {
  try {
    var route  = frappe.get_route ? frappe.get_route() : [];

    // Array vazio = home
    if (!route || route.length === 0) return true;

    var r0 = (route[0] || "").toLowerCase();
    var r1 = (route[1] || "").toLowerCase();

    // Só string vazia = home
    if (r0 === "") return true;

    // Workspaces/Home ou Workspaces/ (sem subrota) = home
    // Workspaces/Selling, Workspaces/Buying etc. = NÃO é home
    if (r0 === "workspaces" || r0 === "workspace") {
      return r1 === "" || r1 === "home";
    }

    // Qualquer outra rota = não é home
    return false;
  } catch (e) {
    var p = window.location.pathname.replace(/\/$/, "");
    return p === "/desk" || p === "/app";
  }
}

_gfWaitReady(function () {
  console.log("[GF Overlay] v16 — iniciando overrides...");

  function _goModern() {
    var boot = document.getElementById("gf-boot-hide");
    if (boot) boot.remove();
    frappe.set_route("gf-modern-desk");
  }

  // ── Override frappe.views.Workspace.show() ────────────────
  var tries = 0;
  var iv = setInterval(function () {
    if (++tries > 100) { clearInterval(iv); return; }
    if (frappe.views && frappe.views.Workspace) {
      clearInterval(iv);
      var Orig = frappe.views.Workspace;

      frappe.views.Workspace = class GFWorkspace extends Orig {
        show() {
          var route = frappe.get_route ? frappe.get_route() : [];
          var r0 = (route[0] || "").toLowerCase();
          var r1 = (route[1] || "").toLowerCase();

          // Só intercepta home real
          var isHome = !r0 ||
            r0 === "" ||
            ((r0 === "workspaces" || r0 === "workspace") && (r1 === "" || r1 === "home"));

          if (isHome) {
            console.log("[GF Overlay] Home detectada → gf-modern-desk");
            _goModern();
            return;
          }

          // Qualquer outro workspace — comportamento normal
          var boot = document.getElementById("gf-boot-hide");
          if (boot) boot.remove();
          super.show();
        }
      };

      console.log("[GF Overlay] Workspace.show() protegido.");

      // Verifica rota atual
      if (_gfIsHome()) {
        _goModern();
      } else {
        var b = document.getElementById("gf-boot-hide");
        if (b) b.remove();
      }
    }
  }, 100);

  // ── Ouve mudanças de rota ─────────────────────────────────
  try {
    frappe.router.on("change", function () {
      // Pequeno delay para rota estar atualizada
      setTimeout(function () {
        if (_gfIsHome()) _goModern();
      }, 50);
    });
  } catch (e) {
    console.warn("[GF Overlay] router.on error:", e);
  }
});
