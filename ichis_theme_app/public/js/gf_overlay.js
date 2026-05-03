/**
 * GF Overlay — gf_overlay.js v11
 * GREENFARMS | ichis_theme_app
 *
 * Resolve 3 problemas:
 *
 * PROBLEMA 1 — Sidebar antiga na página moderna
 *   O CSS gf_overlay.css usa [data-page-route="gf-modern-desk"]
 *   para ocultar sidebar/breadcrumb. Este JS adiciona a classe
 *   gf-modern-active no body quando a página moderna está ativa.
 *
 * PROBLEMA 2 — Flash do Desk antigo (3-4 segundos)
 *   IIFE executa ANTES do Frappe carregar e adiciona body.gf-booting
 *   que oculta o conteúdo via CSS imediatamente.
 *   Override do frappe.router redireciona ANTES do render.
 *
 * PROBLEMA 3 — Botão Home/casinha mostra Desk antigo
 *   Override de frappe.router.route_change e frappe.views.Workspace.show()
 *   interceptam qualquer navegação para workspace/home e redirecionam
 *   para gf-modern-desk.
 */

window.gfOverlayVersion = "GF_OVERLAY_V11";

// ═══════════════════════════════════════════════════════════
// PASSO 1 — IIFE: executa IMEDIATAMENTE, antes do Frappe
// Oculta o conteúdo do Desk via CSS para evitar o flash
// ═══════════════════════════════════════════════════════════
(function gfImmediateHide() {
  // Só no Desk, nunca no login
  if (window.location.pathname.indexOf("/login") !== -1) return;
  if (window.location.pathname.indexOf("/gf-modern-desk") !== -1) return;

  // Oculta tudo imediatamente via classe no body
  function applyBoot() {
    if (document.body) {
      document.body.classList.add("gf-booting");
    }
  }

  if (document.body) {
    applyBoot();
  } else {
    // Antes do DOMContentLoaded — usa o <html> como fallback
    document.documentElement.style.cssText += ";visibility:hidden";
    document.addEventListener("DOMContentLoaded", function () {
      document.documentElement.style.visibility = "";
      applyBoot();
    }, { once: true });
  }
})();

// ═══════════════════════════════════════════════════════════
// PASSO 2 — Aguarda Frappe e aplica os overrides
// ═══════════════════════════════════════════════════════════
(function gfInit() {
  if (window.location.pathname.indexOf("/login") !== -1) return;

  function isHomeRoute() {
    try {
      var route = frappe.get_route ? frappe.get_route() : [];
      if (!Array.isArray(route) || route.length === 0) return true;
      if (route[0] === "") return true;
      // Workspaces sem subrota ou com Home = é home
      if (route[0] === "Workspaces" || route[0] === "workspace") {
        var sub = (route[1] || "").toLowerCase().trim();
        return sub === "" || sub === "home";
      }
      return false;
    } catch (e) {
      return window.location.pathname === "/desk" ||
             window.location.pathname === "/desk/";
    }
  }

  function goToModernDesk() {
    if (typeof frappe !== "undefined" && frappe.set_route) {
      frappe.set_route("gf-modern-desk");
    }
  }

  function waitFrappe(cb) {
    if (typeof frappe !== "undefined" && frappe.ready) {
      frappe.ready(cb);
    } else {
      setTimeout(function () { waitFrappe(cb); }, 50);
    }
  }

  waitFrappe(function () {
    console.log("[GF Overlay] v11 — Frappe pronto. Aplicando overrides...");

    // ── Override 1: frappe.router.route_change ──────────────
    // Intercepta TODA mudança de rota antes do render
    // Resolve PROBLEMA 3 (botão Home)
    try {
      var originalRouteChange = frappe.router.route_change;
      frappe.router.route_change = function () {
        var route = frappe.get_route ? frappe.get_route() : [];
        var sub   = (route[1] || "").toLowerCase();

        // Se for home/workspace sem subrota → vai para moderna
        if (isHomeRoute()) {
          console.log("[GF Overlay] route_change interceptado — redirecionando para gf-modern-desk");
          goToModernDesk();
          return;
        }

        // Qualquer outra rota — remove classe de boot
        document.body.classList.remove("gf-booting");
        document.body.classList.remove("gf-modern-active");

        // Chama o comportamento original
        if (typeof originalRouteChange === "function") {
          return originalRouteChange.apply(frappe.router, arguments);
        }
      };
    } catch (e) {
      console.warn("[GF Overlay] Erro ao fazer override de route_change:", e);
    }

    // ── Override 2: frappe.views.Workspace.show() ───────────
    // Resolve PROBLEMA 3 — quando workspace tenta se renderizar
    var wsInterval = 0;
    var wsTimer = setInterval(function () {
      if (++wsInterval > 100) { clearInterval(wsTimer); return; }
      if (typeof frappe !== "undefined" &&
          frappe.views && frappe.views.Workspace) {
        clearInterval(wsTimer);
        var OrigWS = frappe.views.Workspace;
        frappe.views.Workspace = class GFWorkspace extends OrigWS {
          show() {
            if (isHomeRoute()) {
              console.log("[GF Overlay] Workspace.show() interceptado — mostrando moderna");
              goToModernDesk();
              return;
            }
            // Não é home — remove classes e mostra normalmente
            document.body.classList.remove("gf-booting");
            document.body.classList.remove("gf-modern-active");
            super.show();
          }
        };
        console.log("[GF Overlay] frappe.views.Workspace sobrescrito.");
      }
    }, 100);

    // ── Verificação inicial ─────────────────────────────────
    // Se já estamos na home ao carregar
    setTimeout(function () {
      if (isHomeRoute()) {
        console.log("[GF Overlay] Rota inicial é home — redirecionando...");
        goToModernDesk();
      } else {
        // Não é home — remove boot
        document.body.classList.remove("gf-booting");
      }
    }, 100);

    // ── Ouve mudanças de rota via router ────────────────────
    try {
      frappe.router.on("change", function () {
        var path = window.location.pathname;
        if (path === "/desk/gf-modern-desk") {
          document.body.classList.add("gf-modern-active");
          document.body.classList.remove("gf-booting");
        } else if (isHomeRoute()) {
          goToModernDesk();
        } else {
          document.body.classList.remove("gf-modern-active");
          document.body.classList.remove("gf-booting");
        }
      });
    } catch (e) {}
  });
})();
