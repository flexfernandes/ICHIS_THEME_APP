/**
 * GF Desk Modern — desk_modern.js v23
 * GREENFARMS | ichis_theme_app
 * 100% standalone. Sem Doctype. Dados do frappe.boot.
 */
(function () {
  "use strict";

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
    { label:"Início", items:[
      { icon:"🏠", title:"Início",     route:"__home__"     },
      { icon:"📊", title:"Dashboard",  route:"dashboard-view" },
    ]},
    { label:"Operações", items:[
      { icon:"🛒", title:"Vendas",     route:"selling"      },
      { icon:"📦", title:"Compras",    route:"buying"       },
      { icon:"🏭", title:"Estoque",    route:"stock"        },
      { icon:"💰", title:"Financeiro", route:"accounts"     },
      { icon:"👥", title:"RH",         route:"hr"           },
      { icon:"📋", title:"Projetos",   route:"project"      },
    ]},
    { label:"Sistema", items:[
      { icon:"📊", title:"Relatórios", route:"query-report" },
      { icon:"🔧", title:"Configurações", route:"setup"     },
    ]},
  ];

  var _container = null;
  var _active    = false;
  var _cssLoaded = false;

  function _isHome() {
    try {
      var r  = frappe.get_route ? frappe.get_route() : [];
      var r0 = (r[0] || "").toLowerCase();
      var r1 = (r[1] || "").toLowerCase();
      if (!r0 || r0 === "") return true;
      if ((r0 === "workspaces" || r0 === "workspace") && (r1 === "" || r1 === "home")) return true;
      return false;
    } catch (e) { return false; }
  }

  function _loadCSS() {
    if (_cssLoaded) return;
    _cssLoaded = true;
    var link  = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "/assets/ichis_theme_app/desk_modern/desk_modern.css";
    document.head.appendChild(link);
  }

  function _show() {
    if (_active) return;
    _active = true;
    _loadCSS();

    var boot      = (typeof frappe !== "undefined" && frappe.boot) ? frappe.boot : {};
    var company   = (boot.sysdefaults && boot.sysdefaults.company) || "GREENFARMS";
    var user      = boot.user_info || {};
    var fullName  = user.fullname || boot.full_name || "Usuário";
    var firstName = fullName.split(" ")[0];
    var initial    = fullName.charAt(0).toUpperCase();
    // Foto do usuário — frappe.boot.user_info.image ou user_image
    var userImage  = (user.image) || (boot.user_image) || "";
    var avatarHtml = userImage
      ? '<img src="' + userImage + '" id="gf-user-img" style="width:34px;height:34px;border-radius:50%;object-fit:cover;">'
        + '<span class="gf-user-avatar" id="gf-user-initial" style="display:none">' + initial + '</span>'
      : '<span class="gf-user-avatar">' + initial + '</span>';
    var h         = new Date().getHours();
    var greet     = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    var dateStr   = new Date().toLocaleDateString("pt-BR", { weekday:"short", day:"2-digit", month:"short" });
    // Detecta tema: verifica body attr (gf_theme.js), sessionStorage e frappe.boot
    var _savedTheme = "";
    try { _savedTheme = sessionStorage.getItem("gf_tema_ativo") || ""; } catch(e){}
    var _bootTheme = "";
    try { _bootTheme = (frappe.boot && frappe.boot.gf_tema_ativo) || ""; } catch(e){}
    var _bodyTheme = document.body.getAttribute("data-gf-tema") || "";
    var isDark = (_bodyTheme === "Black") || (_savedTheme === "Black") || (_bootTheme === "Black");

    document.body.classList.add("gf-desk-active");
    _remove(true);

    _container = document.createElement("div");
    _container.id = "gf-modern-desk-container";
    _container.className = "gf-modern-desk" + (isDark ? " gf-dark-mode" : "");

    // Sidebar
    var sidebarHtml = GF_SIDEBAR.map(function (g) {
      var items = g.items.map(function (item) {
        return '<button class="gf-sidebar-link" onclick="gfDeskNav(\'' + item.route + '\')">'
          + '<span class="gf-sidebar-icon">' + item.icon + '</span>'
          + item.title + '</button>';
      }).join("");
      return '<div class="gf-sidebar-group">'
        + '<div class="gf-sidebar-label">' + g.label + '</div>'
        + items + '</div>';
    }).join("");

    // Cards
    var cardsHtml = GF_MODULES.map(function (m) {
      return '<button class="gf-card" onclick="gfDeskNav(\'' + m.route + '\')" style="--card-accent:' + m.accent + '">'
        + '<div class="gf-card-icon">' + m.icon + '</div>'
        + '<div class="gf-card-info">'
          + '<div class="gf-card-title">' + m.title + '</div>'
          + '<div class="gf-card-desc">' + m.desc + '</div>'
        + '</div>'
        + '<span class="gf-card-arrow">→</span>'
        + '</button>';
    }).join("");

    // HTML
    _container.innerHTML = ''
      // Topbar
      + '<div class="gf-topbar">'
        + '<span class="gf-topbar-brand">🌿 ' + company + '</span>'
        + '<div class="gf-topbar-right">'
          + '<div class="gf-user-menu" id="gf-user-menu">'
            + '<button class="gf-user-btn" id="gf-user-btn" title="' + fullName + '">'
              + avatarHtml
            + '</button>'
            + '<div class="gf-user-dropdown" id="gf-user-dropdown">'
              + '<div class="gf-user-dropdown-header"><strong>' + fullName + '</strong></div>'
              + '<button class="gf-user-dropdown-item" id="gf-action-profile">Editar Perfil</button>'
              + '<button class="gf-user-dropdown-item" id="gf-action-theme"><span id="gf-theme-label">Alternar para Dark</span></button>'
              + '<button class="gf-user-dropdown-item" id="gf-action-theme-settings">Configurações do Tema</button>'
              + '<hr style="margin:4px 0;border:none;border-top:1px solid var(--gf-border)">'
              + '<button class="gf-user-dropdown-item" id="gf-action-logout">Sair</button>'
            + '</div>'
          + '</div>'
        + '</div>'
      + '</div>'
      // Layout
      + '<div class="gf-layout">'
        + '<nav class="gf-sidebar">' + sidebarHtml + '</nav>'
        + '<main class="gf-content">'
          + '<div class="gf-hero">'
            + '<div class="gf-hero-left">'
              + '<p class="gf-hero-greeting">' + greet + ', <strong>' + firstName + '</strong> 👋</p>'
              + '<h1 class="gf-hero-title">' + company + '</h1>'
              + '<p class="gf-hero-sub">Sistema de Gestão Integrada — bem-vindo ao painel de controle.</p>'
            + '</div>'
            + '<div class="gf-kpis">'
              + '<div class="gf-kpi"><span class="gf-kpi-value" id="gf-notif-count">—</span><span class="gf-kpi-label">Notificações</span></div>'
              + '<div class="gf-kpi"><span class="gf-kpi-value" style="font-size:14px">' + dateStr + '</span><span class="gf-kpi-label">Hoje</span></div>'
            + '</div>'
          + '</div>'
          + '<div class="gf-section">'
            + '<div class="gf-section-header"><h2 class="gf-section-title">Módulos do Sistema</h2></div>'
            + '<div class="gf-grid">' + cardsHtml + '</div>'
          + '</div>'
        + '</main>'
      + '</div>';

    document.body.appendChild(_container);

    // Eventos do menu de usuário via addEventListener (sem onclick inline)
    var userBtn = document.getElementById("gf-user-btn");
    var dropdown = document.getElementById("gf-user-dropdown");

    if (userBtn && dropdown) {
      userBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = dropdown.style.display === "block";
        dropdown.style.display = isOpen ? "none" : "block";
      });
      document.addEventListener("click", function (e) {
        var menu = document.getElementById("gf-user-menu");
        if (menu && !menu.contains(e.target)) {
          dropdown.style.display = "none";
        }
      });
      document.getElementById("gf-action-profile").addEventListener("click", function () {
        dropdown.style.display = "none";
        _hide();
        frappe.set_route("Form", "User", frappe.session.user);
      });
      // Atualiza label do botão de tema conforme estado atual
      function _updateThemeLabel() {
        var lbl = document.getElementById("gf-theme-label");
        if (!lbl) return;
        var currentDark = _container && _container.classList.contains("gf-dark-mode");
        lbl.textContent = currentDark ? "Alternar para Light" : "Alternar para Dark";
      }
      _updateThemeLabel();

      document.getElementById("gf-action-theme").addEventListener("click", function () {
        dropdown.style.display = "none";
        // Alterna o tema imediatamente sem reload
        var nowDark = _container && _container.classList.contains("gf-dark-mode");
        var newTema = nowDark ? "Padrão" : "Black";

        // Aplica visualmente de imediato
        if (_container) {
          if (nowDark) _container.classList.remove("gf-dark-mode");
          else         _container.classList.add("gf-dark-mode");
        }
        document.body.setAttribute("data-gf-tema", newTema);

        // Salva no sessionStorage para persistir na sessão
        try { sessionStorage.setItem("gf_tema_ativo", newTema); } catch(e){}

        // Atualiza label do botão
        _updateThemeLabel();

        // Persiste no Doctype GF Theme Settings em background
        try {
          frappe.call({
            method: "frappe.client.set_value",
            args: {
              doctype: "GF Theme Settings",
              name: "GF Theme Settings",
              fieldname: "tema_ativo",
              value: newTema
            },
            callback: function() {
              // Dispara atualização do gf_theme.js para aplicar variáveis CSS
              try { frappe.trigger && frappe.trigger("gf_theme_changed"); } catch(e){}
              // Reaplica variáveis CSS via API do tema
              if (typeof _gfApplyDesk === "function") { _gfApplyDesk(); }
            }
          });
        } catch(e){}
      });
      document.getElementById("gf-action-theme-settings").addEventListener("click", function () {
        dropdown.style.display = "none";
        _hide();
        frappe.set_route("Form", "GF Theme Settings", "GF Theme Settings");
      });
      document.getElementById("gf-action-logout").addEventListener("click", function () {
        dropdown.style.display = "none";
        try { frappe.app.logout(); } catch (e) { window.location.href = "/logout"; }
      });
    }

    // Notificações em background
    try {
      frappe.call({
        method: "frappe.client.get_list",
        args: { doctype: "Notification Log", filters: [["read", "=", 0]], fields: ["name"], limit: 99 },
        callback: function (r) {
          var el = document.getElementById("gf-notif-count");
          if (el) el.textContent = (r && r.message) ? r.message.length : "0";
        },
        error: function () {
          var el = document.getElementById("gf-notif-count");
          if (el) el.textContent = "0";
        }
      });
    } catch (e) {}

    console.log("[GF Desk Modern] Ativo. Empresa:", company);
  }

  function _hide() {
    _active = false;
    document.body.classList.remove("gf-desk-active");
    document.body.classList.remove("gf-booting");
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

  window.gfDeskNav = function (route) {
    if (route === "__home__") { if (!_active) _show(); return; }
    _hide();
    try { frappe.set_route(route.split("/")); }
    catch (e) { window.location.href = "/desk/" + route; }
  };

  // Boot guard
  (function () {
    var p = (window.location.pathname || "").replace(/\/$/, "");
    if (p !== "/desk" && p !== "/app") return;
    if (document.body) document.body.classList.add("gf-booting");
    else document.addEventListener("DOMContentLoaded", function () {
      document.body.classList.add("gf-booting");
      setTimeout(function () { document.body.classList.remove("gf-booting"); }, 3000);
    }, { once: true });
  })();

  // Init
  (function () {
    var t = 0;
    var iv = setInterval(function () {
      if (++t > 100) { clearInterval(iv); return; }
      if (typeof frappe === "undefined" || !frappe.router) return;
      clearInterval(iv);

      var wsT = 0;
      var wsIv = setInterval(function () {
        if (++wsT > 100) { clearInterval(wsIv); return; }
        if (!frappe.views || !frappe.views.Workspace) return;
        clearInterval(wsIv);
        var Orig = frappe.views.Workspace;
        frappe.views.Workspace = class GFWorkspace extends Orig {
          show() {
            var r  = frappe.get_route ? frappe.get_route() : [];
            var r0 = (r[0] || "").toLowerCase();
            var r1 = (r[1] || "").toLowerCase();
            var isHome = !r0 || ((r0 === "workspaces" || r0 === "workspace") && (r1 === "" || r1 === "home"));
            if (isHome) { _show(); return; }
            _hide();
            var self = this, args = arguments;
            setTimeout(function () { Orig.prototype.show.apply(self, args); }, 30);
          }
        };
        console.log("[GF Desk Modern] Workspace.show() protegido.");
        if (_isHome()) _show();
      }, 100);

      frappe.router.on("change", function () {
        var r  = frappe.get_route ? frappe.get_route() : [];
        var r0 = (r[0] || "").toLowerCase();
        var r1 = (r[1] || "").toLowerCase();
        var isHome = !r0 || ((r0 === "workspaces" || r0 === "workspace") && (r1 === "" || r1 === "home"));
        if (isHome) _show(); else _hide();
      });
    }, 100);
  })();

})();
