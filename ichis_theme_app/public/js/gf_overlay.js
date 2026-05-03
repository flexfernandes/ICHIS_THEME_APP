/**
 * GF Overlay — Boot Guard v13
 * GREENFARMS | ichis_theme_app
 *
 * ARQUITETURA CORRETA (conforme análise do ChatGPT):
 *
 * 1. Detecta imediatamente se está na Home (/ /app /app/ /app/home /app/workspace /desk /desk/)
 * 2. Oculta o Desk antigo via CSS ANTES do Frappe renderizar
 * 3. Intercepta frappe.router para bloquear retorno à Home antiga
 * 4. Renderiza tela moderna sem esperar chamada ao servidor
 * 5. Carrega configurações em segundo plano
 *
 * NÃO interfere em /app/contact, /app/buying, /app/sales-order etc.
 */

window.gfOverlayVersion = "GF_OVERLAY_V13";

// ─── ROTAS QUE DEVEM MOSTRAR A TELA MODERNA ───────────────────
var GF_HOME_PATHS = ["/app", "/app/", "/app/home", "/app/workspace",
                     "/desk", "/desk/", "/desk/home", "/desk/workspace"];

// ─── PASSO 1: EXECUTA IMEDIATAMENTE ───────────────────────────
// Antes do DOM, antes do Frappe — oculta o Desk antigo
(function gfBootGuard() {
  var path = (window.location.pathname || "").replace(/\/$/, "") || "/app";
  var isHome = GF_HOME_PATHS.indexOf(path) !== -1 ||
               path === "/app" ||
               path.match(/^\/app\/?$/) ||
               path.match(/^\/desk\/?$/);

  if (!isHome) return; // Não é Home — não interfere em nada

  // Injeta CSS de ocultação ANTES do corpo aparecer
  var style = document.createElement("style");
  style.id = "gf-boot-hide";
  style.textContent =
    "html{background:#f1f5f9!important}" +
    ".layout-main,.layout-main-section,#page-desktop,.page-container," +
    ".desk-sidebar,.standard-sidebar,.layout-side-section{" +
    "visibility:hidden!important;pointer-events:none!important}";
  (document.head || document.documentElement).appendChild(style);

  // Remove em 5s de segurança (evita tela presa)
  setTimeout(function () {
    var s = document.getElementById("gf-boot-hide");
    if (s) s.remove();
  }, 5000);
})();

// ─── PASSO 2: AGUARDA FRAPPE E INTERCEPTA O ROUTER ────────────
(function gfRouterGuard() {
  var path = (window.location.pathname || "").replace(/\/$/, "") || "/app";
  var isHome = GF_HOME_PATHS.indexOf(path) !== -1 ||
               path.match(/^\/app\/?$/) ||
               path.match(/^\/desk\/?$/);

  if (!isHome) return;

  function _isHomeRoute() {
    try {
      var route = frappe.get_route ? frappe.get_route() : [];
      if (!Array.isArray(route) || route.length === 0) return true;
      if (route[0] === "") return true;
      if (route[0] === "Workspaces" || route[0] === "workspace") {
        var sub = (route[1] || "").toLowerCase().trim();
        return sub === "" || sub === "home";
      }
      return false;
    } catch (e) {
      var p = (window.location.pathname || "").replace(/\/$/, "");
      return p === "/app" || p === "/desk" || p === "" || p === "/";
    }
  }

  function _goModern() {
    var bootHide = document.getElementById("gf-boot-hide");
    if (bootHide) bootHide.remove();
    frappe.set_route("gf-modern-desk");
  }

  function _waitFrappe(cb) {
    if (typeof frappe !== "undefined" && frappe.ready) {
      frappe.ready(cb);
    } else {
      setTimeout(function () { _waitFrappe(cb); }, 50);
    }
  }

  _waitFrappe(function () {
    // Intercepta qualquer mudança de rota para a Home antiga
    try {
      frappe.router.on("change", function () {
        if (_isHomeRoute()) {
          // Pequeno delay para garantir que frappe.get_route() está atualizado
          setTimeout(function () {
            if (_isHomeRoute()) _goModern();
          }, 50);
        }
      });
    } catch (e) {}

    // Override de frappe.views.Workspace para bloquear render do workspace antigo
    var tries = 0;
    var iv = setInterval(function () {
      if (++tries > 100) { clearInterval(iv); return; }
      if (typeof frappe !== "undefined" && frappe.views && frappe.views.Workspace) {
        clearInterval(iv);
        var Orig = frappe.views.Workspace;
        frappe.views.Workspace = class GFWrap extends Orig {
          show() {
            if (_isHomeRoute()) {
              console.log("[GF Boot] Workspace.show() bloqueado — redirecionando para moderna");
              _goModern();
              return;
            }
            // Não é home — deixa o Frappe renderizar normalmente
            super.show();
          }
        };
        console.log("[GF Boot] Workspace.show() protegido.");
      }
    }, 100);

    // Verificação inicial — se já estiver na home ao carregar
    setTimeout(function () {
      if (_isHomeRoute()) {
        console.log("[GF Boot] Rota inicial é Home — indo para moderna...");
        _goModern();
      } else {
        var s = document.getElementById("gf-boot-hide");
        if (s) s.remove();
      }
    }, 100);
  });
})();
