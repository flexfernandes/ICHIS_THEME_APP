/**
 * GF Overlay — gf_overlay.js v15
 * GREENFARMS | ichis_theme_app
 *
 * CORREÇÃO v15: frappe.ready não existe no momento do carregamento do script.
 * Usar $(document).ready ou document.addEventListener("DOMContentLoaded") + polling.
 */

window.gfOverlayVersion = "GF_OVERLAY_V15";

// ── CSS imediato para evitar flash na home ────────────────────
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

// ── Aguarda frappe estar completamente pronto ─────────────────
function _gfWaitReady(cb) {
  // frappe.ready pode não existir ainda — aguarda com polling
  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    if (typeof frappe !== "undefined") {
      clearInterval(iv);
      if (typeof frappe.ready === "function") {
        frappe.ready(cb);
      } else {
        // frappe existe mas sem .ready — usa after_ajax ou tenta direto
        if (frappe.router) {
          cb();
        } else {
          setTimeout(cb, 500);
        }
      }
    } else if (tries > 100) {
      clearInterval(iv);
    }
  }, 100);
}

_gfWaitReady(function () {
  console.log("[GF Overlay] v15 — Frappe pronto. Aplicando overrides...");

  var _homeRoutes = ["", "home", "workspace", "workspaces"];

  function _isHome() {
    try {
      var route  = frappe.get_route ? frappe.get_route() : [];
      var first  = (route[0] || "").toLowerCase();
      var second = (route[1] || "").toLowerCase();
      return !first ||
        _homeRoutes.indexOf(first) !== -1 ||
        (first === "workspaces" && _homeRoutes.indexOf(second) !== -1);
    } catch (e) {
      var p = window.location.pathname.replace(/\/$/, "");
      return p === "/desk" || p === "/app";
    }
  }

  function _goModern() {
    var boot = document.getElementById("gf-boot-hide");
    if (boot) boot.remove();
    frappe.set_route("gf-modern-desk");
  }

  // ── Override frappe.router.make_current_route ─────────────
  if (frappe.router && frappe.router.make_current_route) {
    var _origMCR = frappe.router.make_current_route.bind(frappe.router);
    frappe.router.make_current_route = function () {
      if (_isHome()) {
        console.log("[GF Overlay] make_current_route → gf-modern-desk");
        _goModern();
        return;
      }
      return _origMCR.apply(frappe.router, arguments);
    };
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
          if (_isHome()) {
            console.log("[GF Overlay] Workspace.show() → gf-modern-desk");
            _goModern();
            return;
          }
          super.show();
        }
      };
      console.log("[GF Overlay] Workspace.show() protegido.");

      // Verifica rota atual
      if (_isHome()) _goModern();
      else {
        var b = document.getElementById("gf-boot-hide");
        if (b) b.remove();
      }
    }
  }, 100);

  // ── Ouve mudanças de rota ─────────────────────────────────
  try {
    frappe.router.on("change", function () {
      if (_isHome()) _goModern();
    });
  } catch (e) {}
});
