/**
 * GF Overlay — gf_overlay.js v9
 * GREENFARMS | ichis_theme_app
 *
 * Redireciona /desk para gf-modern-desk.
 * Adiciona body.gf-redirecting imediatamente para ocultar o Desk
 * enquanto o redirecionamento não ocorre.
 */

window.gfOverlayVersion = "GF_OVERLAY_V9";

// Executa IMEDIATAMENTE — antes do Frappe carregar
(function () {
  var path = window.location.pathname;
  if (path.indexOf("/login") !== -1) return;

  // Se estamos em /desk, oculta imediatamente para evitar flash
  if (path === "/desk" || path === "/desk/") {
    function hideDesk() {
      if (document.body) {
        document.body.classList.add("gf-redirecting");
      }
    }
    if (document.body) {
      hideDesk();
    } else {
      document.addEventListener("DOMContentLoaded", hideDesk, { once: true });
    }
  }
})();

// Redireciona para gf-modern-desk quando o Frappe estiver pronto
(function () {
  var path = window.location.pathname;
  if (path.indexOf("/login") !== -1) return;

  function redirect() {
    var p = window.location.pathname;
    if (p === "/desk" || p === "/desk/") {
      if (typeof frappe !== "undefined" && frappe.set_route) {
        console.log("[GF Overlay] Redirecionando para GF Modern Desk...");
        frappe.set_route("gf-modern-desk");
      }
    } else {
      // Não está em /desk — remove a classe de ocultação
      if (document.body) {
        document.body.classList.remove("gf-redirecting");
      }
    }
  }

  function waitAndRedirect() {
    if (typeof frappe !== "undefined" && frappe.ready) {
      frappe.ready(function () {
        setTimeout(redirect, 100);
        // Ouve mudanças de rota (quando usuário clica em Home na sidebar)
        try {
          frappe.router.on("change", function () {
            setTimeout(redirect, 100);
          });
        } catch (e) {}
      });
    } else {
      setTimeout(waitAndRedirect, 50);
    }
  }

  waitAndRedirect();
})();
