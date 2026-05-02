/**
 * GF Overlay — gf_overlay.js
 * GREENFARMS | ichis_theme_app
 *
 * Redireciona /desk para a página nativa GF Modern Desk.
 */

window.gfOverlayVersion = "GF_OVERLAY_V9";

if (window.location.pathname.indexOf("/login") !== -1) {
  // login — não faz nada
} else {
  function _gfRedirectToModernDesk() {
    var path = window.location.pathname;
    if (path === "/desk" || path === "/desk/") {
      if (typeof frappe !== "undefined" && frappe.set_route) {
        console.log("[GF Overlay] Redirecionando para GF Modern Desk...");
        frappe.set_route("gf-modern-desk");
      }
    }
  }

  function _gfWaitAndRedirect() {
    if (typeof frappe !== "undefined" && frappe.ready) {
      frappe.ready(function () {
        setTimeout(_gfRedirectToModernDesk, 200);
        // Também ouve mudanças de rota (quando usuário clica em Home)
        try {
          frappe.router.on("change", function () {
            setTimeout(_gfRedirectToModernDesk, 100);
          });
        } catch (e) {}
      });
    } else {
      setTimeout(_gfWaitAndRedirect, 100);
    }
  }

  _gfWaitAndRedirect();
}
