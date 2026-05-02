/**
 * GF Overlay — gf_overlay.js
 * GREENFARMS | ichis_theme_app
 *
 * Agora que existe a Page nativa gf-modern-desk,
 * este script apenas redireciona o /desk para ela.
 * O gf_theme.js já faz o redirecionamento quando o tema está ativo.
 * Este arquivo garante o redirecionamento mesmo quando o tema está desativado.
 */

window.gfOverlayVersion = "GF_OVERLAY";

// Só roda no Desk, nunca no login
if (window.location.pathname.indexOf("/login") !== -1) {
  // login — não faz nada
} else {
  // Aguarda o Frappe estar pronto e redireciona
  function _gfRedirectToModernDesk() {
    if (window.location.pathname === "/desk" || window.location.pathname === "/desk/") {
      if (typeof frappe !== "undefined" && frappe.set_route) {
        console.log("[GF Overlay] Redirecionando para GF Modern Desk...");
        frappe.set_route("gf-modern-desk");
      }
    }
  }

  if (typeof frappe !== "undefined" && frappe.ready) {
    frappe.ready(function () {
      setTimeout(_gfRedirectToModernDesk, 200);
    });
  } else {
    var t = 0;
    var iv = setInterval(function () {
      if (typeof frappe !== "undefined" && frappe.ready) {
        clearInterval(iv);
        frappe.ready(function () {
          setTimeout(_gfRedirectToModernDesk, 200);
        });
      } else if (++t > 50) {
        clearInterval(iv);
      }
    }, 100);
  }

  // Também registra no router para quando o usuário navegar de volta ao /desk
  document.addEventListener("DOMContentLoaded", function () {
    try {
      if (typeof frappe !== "undefined" && frappe.router && frappe.router.on) {
        frappe.router.on("change", function () {
          setTimeout(_gfRedirectToModernDesk, 100);
        });
      }
    } catch (e) {}
  });
}
