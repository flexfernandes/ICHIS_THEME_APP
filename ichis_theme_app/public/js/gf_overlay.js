/**
 * GF Overlay — gf_overlay.js v12
 * GREENFARMS | ichis_theme_app
 *
 * Responsabilidade ÚNICA deste arquivo:
 * Quando a URL é exatamente /desk, oculta o conteúdo via CSS
 * para evitar o flash visual antes do redirecionamento para gf-modern-desk.
 *
 * O redirecionamento em si é feito pelo gf_theme.js via frappe.set_route().
 * Este arquivo NÃO interfere em nenhuma outra rota.
 * Este arquivo NÃO faz override de router, workspace ou qualquer classe Frappe.
 */

window.gfOverlayVersion = "GF_OVERLAY_V12";

// Executa IMEDIATAMENTE — antes do Frappe carregar
// Só age se a URL for EXATAMENTE /desk (a home do Frappe)
(function () {
  var path = window.location.pathname;

  // Só oculta na home exata — NUNCA em /desk/contact, /desk/buying etc.
  if (path !== "/desk" && path !== "/desk/") return;

  // Injeta CSS de ocultação direto no <head>
  var style = document.createElement("style");
  style.id = "gf-boot-hide";
  style.textContent =
    ".layout-main,.layout-main-section,#page-desktop,.desk-sidebar," +
    ".page-container,.standard-sidebar{visibility:hidden!important}";
  (document.head || document.documentElement).appendChild(style);

  // Remove o CSS após 3 segundos de segurança (evita tela presa)
  setTimeout(function () {
    var s = document.getElementById("gf-boot-hide");
    if (s) s.remove();
  }, 3000);
})();
