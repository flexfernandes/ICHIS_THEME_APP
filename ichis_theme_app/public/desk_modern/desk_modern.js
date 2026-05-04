/**
 * GF Desk Modern — desk_modern.js
 * GREENFARMS | ichis_theme_app
 *
 * ARQUITETURA:
 * - 100% standalone, sem Doctype, sem API calls para render
 * - Intercepta imediatamente via frappe.views.Workspace.show()
 * - Dados vêm de frappe.boot (disponível logo após login)
 * - Módulos definidos no código — sem banco de dados
 * - Dois temas: claro e dark (lê data-gf-tema do body)
 *
 * NÃO altera GF Theme Settings.
 * NÃO usa Doctype overlay.
 * NÃO faz chamadas ao servidor para renderizar.
 */

(function () {
  "use strict";

  // ── Módulos definidos no código ──────────────────────────────
  var GF_MODULES = [
    { id:"selling",      title:"Vendas",        desc:"Pedidos, clientes e faturamento",    icon:"🛒", accent:"#276749", route:"selling"      },
    { id:"buying",       title:"Compras",       desc:"Fornecedores e recebimentos",        icon:"📦", accent:"#2563eb", route:"buying"       },
    { id:"stock",        title:"Estoque",       desc:"Produtos, armazéns e movimentações", icon:"🏭", accent:"#b45309", route:"stock"        },
    { id:"accounts",     title:"Financeiro",    desc:"Contas, pagamentos e conciliação",   icon:"💰", accent:"#be185d", route:"accounts"     },
    { id:"hr",           title:"RH",            desc:"Colaboradores, folha e benefícios",  icon:"👥", accent:"#0369a1", route:"hr"           },
    { id:"project",      title:"Projetos",      desc:"Tarefas, cronogramas e equipes",     icon:"📋", accent:"#7c3aed", route:"project"      },
    { id:"crm",          title:"CRM",           desc:"Leads, oportunidades e contatos",    icon:"🤝", accent:"#c2410c", route:"crm"          },
    { id:"manufacturing",title:"Manufatura",    desc:"Ordens de produção e BOM",           icon:"⚙️", accent:"#374151", route:"manufacturing" },
    { id:"quality",      title:"Qualidade",     desc:"Controle e inspeções",               icon:"✅", accent:"#065f46", route:"quality"      },
    { id:"query-report", title:"Relatórios",    desc:"Análises e relatórios gerenciais",   icon:"📊", accent:"#15803d", route:"query-report" },
    { id:"setup",        title:"Configurações", desc:"Administração do sistema",           icon:"🔧", accent:"#374151", route:"setup"        },
  ];

  var GF_SIDEBAR = [
    { label:"Início",     items:[
      { icon:"🏠", title:"Início",         route:"gf-modern-desk" },
      { icon:"📊", title:"Dashboard",      route:"dashboard-view" },
    ]},
    { label:"Operações",  items:[
      { icon:"🛒", title:"Vendas",         route:"selling"      },
      { icon:"📦", title:"Compras",        route:"buying"       },
      { icon:"🏭", title:"Estoque",        route:"stock"        },
      { icon:"💰", title:"Financeiro",     route:"accounts"     },
      { icon:"👥", title:"RH",             route:"hr"           },
      { icon:"📋", title:"Projetos",       route:"project"      },
    ]},
    { label:"Sistema",    items:[
      { icon:"📊", title:"Relatórios",     route:"query-report" },
      { icon:"🔧", title:"Configurações",  route:"setup"        },
    ]},
  ];

  // ── Estado interno ───────────────────────────────────────────
  var _container  = null;
  var _active     = false;
  var _cssLoaded  = false;

  // ── Detecta se é home ────────────────────────────────────────
  function _isHome() {
    try {
      var r  = frappe.get_route ? frappe.get_route() : [];
      var r0 = (r[0] || "").toLowerCase();
      var r1 = (r[1] || "").toLowerCase();
      if (!r0 || r0 === "") return true;
      if ((r0 === "workspaces" || r0 === "workspace") &&
          (r1 === "" || r1 === "home")) return true;
      if (r0 === "gf-modern-desk") return false; // já está na moderna
      return false;
    } catch (e) {
      return false;
    }
  }

  // ── Carrega CSS se ainda não foi ────────────────────────────
  function _loadCSS() {
    if (_cssLoaded) return;
    _cssLoaded = true;
    var link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "/assets/ichis_theme_app/desk_modern/desk_modern.css";
    document.head.appendChild(link);
  }

  // ── Mostra a tela moderna ────────────────────────────────────
  function _show() {
    if (_active) return;
    _active = true;
    _loadCSS();

    // Dados do boot — sem chamada ao servidor
    var boot    = (typeof frappe !== "undefined" && frappe.boot) ? frappe.boot : {};
    var company = (boot.sysdefaults && boot.sysdefaults.company) || "GREENFARMS";
    var user    = boot.user_info || {};
    var fullName = user.fullname || (boot.full_name) || "Usuário";
    var firstName = fullName.split(" ")[0];
    var h       = new Date().getHours();
    var greet   = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    var dateStr = new Date().toLocaleDateString("pt-BR",
      { weekday:"short", day:"2-digit", month:"short" });

    // Detecta tema dark
    var isDark = document.body.getAttribute("data-gf-tema") === "Black";

    // Oculta Desk antigo
    document.body.classList.add("gf-desk-active");

    // Remove container anterior se existir
    _remove(true);

    // Cria container
    _container = document.createElement("div");
    _container.id = "gf-modern-desk-container";
    _container.className = "gf-modern-desk" + (isDark ? " gf-dark-mode" : "");

    // ── Sidebar ──────────────────────────────────────────────
    var sidebarHtml = GF_SIDEBAR.map(function (group) {
      var items = group.items.map(function (item) {
        return '<button class="gf-sidebar-link" onclick="gfDeskNav(\'' +
          item.route + '\')">' +
          '<span class="gf-sidebar-icon">' + item.icon + '</span>' +
          item.title + '</button>';
      }).join("");
      return '<div class="gf-sidebar-group">' +
        '<div class="gf-sidebar-label">' + group.label + '</div>' +
        items + '</div>';
    }).join("");

    // ── Cards ────────────────────────────────────────────────
    var cardsHtml = GF_MODULES.map(function (m) {
      return '<button class="gf-card" onclick="gfDeskNav(\'' + m.route + '\')" ' +
        'style="--card-accent:' + m.accent + '">' +
        '<div class="gf-card-icon">' + m.icon + '</div>' +
        '<div class="gf-card-info">' +
          '<div class="gf-card-title">' + m.title + '</div>' +
          '<div class="gf-card-desc">' + m.desc + '</div>' +
        '</div>' +
        '<span class="gf-card-arrow">→</span>' +
        '</button>';
    }).join("");

    // ── HTML completo ────────────────────────────────────────
    _container.innerHTML =
      // Layout
      '<div class="gf-layout">' +

        // Sidebar
        '<nav class="gf-sidebar">' + sidebarHtml + '</nav>' +

        // Conteúdo
        '<main class="gf-content">' +

          // Busca
          '<div class="gf-search-bar" style="max-width:100%;margin:0">' +
            '<span class="gf-search-icon">🔍</span>' +
            '<input id="gf-search-input" class="gf-search-input" type="text" ' +
              'placeholder="Buscar no sistema... (pressione /)" autocomplete="off">' +
          '</div>' +

          // Hero
          '<div class="gf-hero">' +
            '<div class="gf-hero-left">' +
              '<p class="gf-hero-greeting">' + greet + ', <strong>' + firstName + '</strong> 👋</p>' +
              '<h1 class="gf-hero-title">' + company + '</h1>' +
              '<p class="gf-hero-sub">Sistema de Gestão Integrada — bem-vindo ao painel de controle.</p>' +
            '</div>' +
            '<div class="gf-kpis">' +
              '<div class="gf-kpi">' +
                '<span class="gf-kpi-value" id="gf-notif-count">—</span>' +
                '<span class="gf-kpi-label">Notificações</span>' +
              '</div>' +
              '<div class="gf-kpi">' +
                '<span class="gf-kpi-value" style="font-size:14px">' + dateStr + '</span>' +
                '<span class="gf-kpi-label">Hoje</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // Módulos
          '<div class="gf-section">' +
            '<div class="gf-section-header">' +
              '<h2 class="gf-section-title">Módulos do Sistema</h2>' +
            '</div>' +
            '<div class="gf-grid">' + cardsHtml + '</div>' +
          '</div>' +

        '</main>' +
      '</div>';

    document.body.appendChild(_container);

    // ── Busca global ─────────────────────────────────────────
    var searchInput = document.getElementById("gf-search-input");
    if (searchInput) {
      searchInput.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        var q = searchInput.value.trim();
        if (!q) return;
        e.preventDefault();
        _hide();
        try {
          if (frappe.utils && frappe.utils.global_search) frappe.utils.global_search(q);
          else frappe.set_route("search", q);
        } catch (ex) { frappe.set_route("search", q); }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "/" &&
            !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) {
          e.preventDefault();
          if (_active && searchInput) { searchInput.focus(); searchInput.select(); }
        }
      });
    }

    // ── Notificações (em background, sem bloquear render) ────
    try {
      frappe.call({
        method: "frappe.client.get_count",
        args: { doctype: "Notification Log", filters: [["read","=",0]] },
        callback: function (r) {
          var el = document.getElementById("gf-notif-count");
          if (el) el.textContent = (r && r.message !== undefined) ? (r.message || "0") : "0";
        },
        error: function () {}
      });
    } catch (e) {}

    console.log("[GF Desk Modern] Tela moderna ativa. Empresa:", company);
  }

  // ── Esconde a tela moderna ───────────────────────────────────
  function _hide() {
    _active = false;
    // Remove classe que oculta o Desk antigo
    document.body.classList.remove("gf-desk-active");
    document.body.classList.remove("gf-booting");
    // Remove container da tela moderna
    var el = document.getElementById("gf-modern-desk-container");
    if (el) el.remove();
  }

  function _remove(keepActive) {
    var el = document.getElementById("gf-modern-desk-container");
    if (el) el.remove();
    if (!keepActive) {
      _active = false;
      document.body.classList.remove("gf-desk-active");
      document.body.classList.remove("gf-booting");
    }
  }

  // ── Navegação pública ────────────────────────────────────────
  window.gfDeskNav = function (route) {
    if (route === "gf-modern-desk") {
      // Volta para a moderna
      frappe.set_route("gf-modern-desk");
      return;
    }
    // Navega para módulo do ERPNext
    _hide();
    try {
      frappe.set_route(route.split("/"));
    } catch (e) {
      window.location.href = "/desk/" + route;
    }
  };

  // ── Aguarda Frappe e aplica overrides ────────────────────────
  function _init() {
    var tries = 0;
    var iv = setInterval(function () {
      if (++tries > 100) { clearInterval(iv); return; }
      if (typeof frappe === "undefined" || !frappe.router) return;
      clearInterval(iv);

      console.log("[GF Desk Modern] Iniciando...");

      // Override frappe.views.Workspace.show()
      var wsInterval = 0;
      var wsTimer = setInterval(function () {
        if (++wsInterval > 100) { clearInterval(wsTimer); return; }
        if (!frappe.views || !frappe.views.Workspace) return;
        clearInterval(wsTimer);

        var Orig = frappe.views.Workspace;
        frappe.views.Workspace = class GFWorkspace extends Orig {
          show() {
            var r  = frappe.get_route ? frappe.get_route() : [];
            var r0 = (r[0] || "").toLowerCase();
            var r1 = (r[1] || "").toLowerCase();
            var isHome = !r0 ||
              ((r0 === "workspaces" || r0 === "workspace") &&
               (r1 === "" || r1 === "home"));

            if (isHome) {
              // Mostra nossa tela moderna em vez do workspace
              _show();
              return;
            }

            // Não é home — esconde moderna IMEDIATAMENTE e deixa Frappe renderizar
            _hide();
            var self = this;
            var args = arguments;
            setTimeout(function() { Orig.prototype.show.apply(self, args); }, 30);
            return;
          }
        };

        console.log("[GF Desk Modern] Workspace.show() protegido.");

        // Avalia rota atual
        if (_isHome()) _show();

      }, 100);

      // Ouve mudanças de rota
      frappe.router.on("change", function () {
        // Sem delay — age imediatamente na mudança de rota
        var r  = frappe.get_route ? frappe.get_route() : [];
        var r0 = (r[0] || "").toLowerCase();
        var r1 = (r[1] || "").toLowerCase();
        var isHome = !r0 ||
          ((r0 === "workspaces" || r0 === "workspace") &&
           (r1 === "" || r1 === "home"));

        if (isHome) {
          _show();
        } else {
          // Qualquer rota que não seja home — esconde moderna
          _hide();
        }
      });

    }, 100);
  }

  // ── Boot guard imediato ──────────────────────────────────────
  // Oculta o Desk antigo via CSS antes do Frappe renderizar
  (function () {
    var p = (window.location.pathname || "").replace(/\/$/, "");
    if (p !== "/desk" && p !== "/app") return;
    document.documentElement.style.cssText +=
      ";--gf-boot:1"; // marcador sem efeito visual, só para debug
    if (document.body) {
      document.body.classList.add("gf-booting");
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        document.body.classList.add("gf-booting");
        setTimeout(function () {
          document.body.classList.remove("gf-booting");
        }, 3000);
      }, { once: true });
    }
  })();

  // ── Inicia ───────────────────────────────────────────────────
  _init();

})();
