/**
 * GF Overlay — gf_overlay.js v17
 * FOCO: 2 correções específicas
 *
 * 1. Ocultar sidebar "Gf Ui Overlay" na página gf-modern-desk
 * 2. Remover tela moderna ao navegar para qualquer página que não seja home
 */

window.gfOverlayVersion = "GF_OVERLAY_V17";

// ── Aguarda frappe ────────────────────────────────────────────
function _gfWait(cb) {
  var t = 0;
  var iv = setInterval(function () {
    if (typeof frappe !== "undefined" && frappe.router) {
      clearInterval(iv); cb();
    } else if (++t > 100) clearInterval(iv);
  }, 100);
}

// ── É home? ───────────────────────────────────────────────────
function _gfIsHome() {
  try {
    var r = frappe.get_route ? frappe.get_route() : [];
    var r0 = (r[0] || "").toLowerCase();
    var r1 = (r[1] || "").toLowerCase();
    if (!r0 || r0 === "") return true;
    if ((r0 === "workspaces" || r0 === "workspace") && (r1 === "" || r1 === "home")) return true;
    return false;
  } catch (e) {
    return false;
  }
}

_gfWait(function () {
  console.log("[GF Overlay] v17 iniciado.");

  // ── Ouve mudanças de rota ─────────────────────────────────
  // Quando NAO é home: remove a tela moderna imediatamente
  frappe.router.on("change", function () {
    setTimeout(function () {
      if (!_gfIsHome()) {
        // Remove o container da tela moderna
        var root = document.getElementById("gf-modern-desk-root");
        if (root) root.remove();
        var css  = document.getElementById("gf-md-css");
        if (css) css.remove();
      }
    }, 50);
  });

  // ── Override Workspace.show() ─────────────────────────────
  var t = 0;
  var iv = setInterval(function () {
    if (++t > 100) { clearInterval(iv); return; }
    if (frappe.views && frappe.views.Workspace) {
      clearInterval(iv);
      var Orig = frappe.views.Workspace;
      frappe.views.Workspace = class GFWrap extends Orig {
        show() {
          var r  = frappe.get_route ? frappe.get_route() : [];
          var r0 = (r[0] || "").toLowerCase();
          var r1 = (r[1] || "").toLowerCase();
          var isHome = !r0 ||
            ((r0 === "workspaces" || r0 === "workspace") && (r1 === "" || r1 === "home"));

          if (isHome) {
            frappe.set_route("gf-modern-desk");
            return;
          }
          // Não é home — remove tela moderna e deixa Frappe renderizar
          var root = document.getElementById("gf-modern-desk-root");
          if (root) root.remove();
          super.show();
        }
      };
      console.log("[GF Overlay] Workspace.show() protegido.");
    }
  }, 100);
});
