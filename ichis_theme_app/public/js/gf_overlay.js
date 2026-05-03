/**
 * GF Overlay — gf_overlay.js v14
 * GREENFARMS | ichis_theme_app
 *
 * Baseado na abordagem do frappe-modern-desk (pratheeshrussell):
 * Override de frappe.router e frappe.views.Workspace.show()
 *
 * IMPORTANTE: Este arquivo NÃO interfere em rotas como
 * /desk/contact, /desk/selling, /desk/buying etc.
 * Ele SOMENTE intercepta a Home/Workspace padrão.
 */

window.gfOverlayVersion = "GF_OVERLAY_V14";

// ── CSS imediato apenas para /desk e /app (home) ──────────────
(function () {
  var p = window.location.pathname;
  if (p !== "/desk" && p !== "/desk/" && p !== "/app" && p !== "/app/") return;
  var s = document.createElement("style");
  s.id  = "gf-boot-hide";
  s.textContent = ".layout-main,.layout-main-section,#page-desktop,.page-container,.desk-sidebar{visibility:hidden!important}";
  (document.head || document.documentElement).appendChild(s);
  setTimeout(function(){ var x=document.getElementById("gf-boot-hide"); if(x) x.remove(); }, 4000);
})();

// ── Aguarda Frappe e aplica overrides ─────────────────────────
frappe.ready(function () {
  console.log("[GF Overlay] v14 — Frappe pronto.");

  // ── 1. Override do frappe.router ──────────────────────────
  // O frappe.router.route_change é chamado em TODA mudança de rota
  // Referência: frappe-modern-desk/modern_desk/public/js/route_override.js
  var _originalSlug = frappe.router.slug;
  var _homeRoutes   = ["", "home", "workspace", "workspaces"];

  // Sobrescreve o método que decide qual página mostrar após login
  var _origMakeCurrentRoute = frappe.router.make_current_route;
  if (_origMakeCurrentRoute) {
    frappe.router.make_current_route = function () {
      var route  = frappe.get_route ? frappe.get_route() : [];
      var first  = (route[0] || "").toLowerCase();
      var second = (route[1] || "").toLowerCase();

      // É a home se: rota vazia, ou Workspaces/Home, ou Workspaces sem subrota
      var isHome = !first ||
        _homeRoutes.indexOf(first) !== -1 ||
        (first === "workspaces" && (_homeRoutes.indexOf(second) !== -1));

      if (isHome) {
        console.log("[GF Overlay] make_current_route interceptado → gf-modern-desk");
        frappe.set_route("gf-modern-desk");
        return;
      }
      return _origMakeCurrentRoute.apply(frappe.router, arguments);
    };
  }

  // ── 2. Override de frappe.views.Workspace.show() ──────────
  // Chamado toda vez que o Frappe vai renderizar um Workspace
  // Referência: frappe-modern-desk/modern_desk/public/js/workspace_override.js
  var wsInterval = 0;
  var wsTimer = setInterval(function () {
    if (++wsInterval > 100) { clearInterval(wsTimer); return; }
    if (frappe.views && frappe.views.Workspace) {
      clearInterval(wsTimer);

      var OrigWorkspace = frappe.views.Workspace;
      frappe.views.Workspace = class GFWorkspace extends OrigWorkspace {
        show() {
          var route  = frappe.get_route ? frappe.get_route() : [];
          var first  = (route[0] || "").toLowerCase();
          var second = (route[1] || "").toLowerCase();

          var isHome = !first ||
            _homeRoutes.indexOf(first) !== -1 ||
            (first === "workspaces" && (_homeRoutes.indexOf(second) !== -1));

          if (isHome) {
            // Remove CSS de boot
            var boot = document.getElementById("gf-boot-hide");
            if (boot) boot.remove();
            // Vai para a página moderna
            frappe.set_route("gf-modern-desk");
            return;
          }

          // Não é home — comportamento normal
          super.show();
        }
      };

      console.log("[GF Overlay] frappe.views.Workspace sobrescrito com sucesso.");

      // Verifica rota atual imediatamente
      var route  = frappe.get_route ? frappe.get_route() : [];
      var first  = (route[0] || "").toLowerCase();
      var isHome = !first || _homeRoutes.indexOf(first) !== -1 ||
        (first === "workspaces" && _homeRoutes.indexOf((route[1]||"").toLowerCase()) !== -1);

      if (isHome) {
        var boot = document.getElementById("gf-boot-hide");
        if (boot) boot.remove();
        frappe.set_route("gf-modern-desk");
      } else {
        var boot = document.getElementById("gf-boot-hide");
        if (boot) boot.remove();
      }
    }
  }, 100);

  // ── 3. Ouve mudanças de rota via frappe.router ────────────
  frappe.router.on("change", function () {
    var route  = frappe.get_route ? frappe.get_route() : [];
    var first  = (route[0] || "").toLowerCase();
    var second = (route[1] || "").toLowerCase();

    var isHome = !first ||
      _homeRoutes.indexOf(first) !== -1 ||
      (first === "workspaces" && _homeRoutes.indexOf(second) !== -1);

    if (isHome) {
      frappe.set_route("gf-modern-desk");
    }
  });
});
