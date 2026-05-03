/**
 * GF Modern Desk — gf_modern_desk.js
 * GREENFARMS | ichis_theme_app
 *
 * Page nativa do Frappe v16.
 * Usa on_page_load para renderizar a tela moderna completa.
 * Oculta sidebar e breadcrumb via JS + CSS.
 */

frappe.pages["gf-modern-desk"].on_page_load = function (wrapper) {
  // Adiciona classe ao body para CSS saber que está na moderna
  document.body.classList.add("gf-modern-active");
  document.body.classList.remove("gf-booting");

  // Cria a página sem título visível (full screen)
  var page = frappe.ui.make_app_page({
    parent:        wrapper,
    title:         "GF Modern Desk",
    single_column: true,
  });

  // Oculta breadcrumb e sidebar desta página via JS
  setTimeout(function () {
    // Breadcrumb
    var bc = wrapper.querySelector(".page-breadcrumbs, .breadcrumb-container");
    if (bc) bc.style.display = "none";
    // Sidebar
    var sb = document.querySelector(".layout-side-section, .desk-sidebar");
    if (sb) sb.style.display = "none";
    // Toggle button da sidebar
    var tb = document.querySelector(".sidebar-toggle-btn");
    if (tb) tb.style.display = "none";
  }, 0);

  // Container principal da página moderna
  var container = document.createElement("div");
  container.id  = "gf-modern-desk-root";
  container.style.cssText = [
    "position:fixed",
    "top:56px",   /* altura da navbar do Frappe v16 */
    "left:0",
    "right:0",
    "bottom:0",
    "z-index:100",
    "overflow:hidden",
    "display:flex",
    "flex-direction:column",
    "font-family:Inter,\"Segoe UI\",system-ui,Arial,sans-serif",
  ].join(";");
  document.body.appendChild(container);

  // Busca dados da página overlay do Desk
  frappe.call({
    method: "ichis_theme_app.api.theme.get_active_overlay_pages",
    callback: function (r) {
      var pages    = Array.isArray(r && r.message) ? r.message : [];
      var deskPage = null;
      for (var i = 0; i < pages.length; i++) {
        if (pages[i].tipo_alvo === "Desk" && pages[i].ativo) {
          deskPage = pages[i]; break;
        }
      }

      if (deskPage) {
        window.gfCurrentPageData = deskPage;

        // Injeta CSS customizado da página
        if (deskPage.css_customizado && deskPage.css_customizado.trim()) {
          var sc = document.getElementById("gf-md-css");
          if (!sc) {
            sc = document.createElement("style");
            sc.id = "gf-md-css";
            document.head.appendChild(sc);
          }
          sc.textContent = deskPage.css_customizado;
        }

        // Executa JS customizado (renderiza o HTML real)
        if (deskPage.js_customizado && deskPage.js_customizado.trim()) {
          try {
            // O JS customizado referencia #gf-ui-overlay-root
            // Aqui a gente cria esse elemento dentro do container
            var root = document.createElement("div");
            root.id  = "gf-ui-overlay-root";
            root.style.cssText = "width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;";
            container.appendChild(root);

            window.gfCurrentRoot = root;
            (new Function(deskPage.js_customizado))();
          } catch (e) {
            console.error("[GF Modern Desk] Erro no JS customizado:", e);
            _gfRenderFallback(container, deskPage);
          }
        } else {
          _gfRenderFallback(container, deskPage);
        }
      } else {
        _gfRenderFallback(container, null);
      }
    },
    error: function () {
      _gfRenderFallback(container, null);
    }
  });
};

// Remove o container quando sair da página
frappe.pages["gf-modern-desk"].on_page_hide = function () {
  document.body.classList.remove("gf-modern-active");
  var root = document.getElementById("gf-modern-desk-root");
  if (root) root.remove();
  var css = document.getElementById("gf-md-css");
  if (css) css.remove();
};

// ── Renderização padrão quando não há JS customizado ────────
function _gfRenderFallback(container, page) {
  var cs     = getComputedStyle(document.documentElement);
  var bg     = cs.getPropertyValue("--gf-bg-main").trim()       || "#f1f5f9";
  var surf   = cs.getPropertyValue("--gf-bg-card").trim()       || "#ffffff";
  var text   = cs.getPropertyValue("--gf-text-main").trim()     || "#0f172a";
  var muted  = cs.getPropertyValue("--gf-text-secondary").trim()|| "#64748b";
  var accent = cs.getPropertyValue("--gf-accent").trim()        || "#16a34a";
  var border = cs.getPropertyValue("--gf-border").trim()        || "#e2e8f0";
  var font   = cs.getPropertyValue("--gf-font-main").trim()     || "Inter,sans-serif";

  var cards  = page && page.cards
    ? page.cards.filter(function (c) { return c.ativo; })
    : _defaultCards();

  var h      = new Date().getHours();
  var greet  = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  var fn     = "";
  try { fn = frappe.session.full_name || frappe.session.user.split("@")[0]; } catch (e) {}

  var cardsHtml = cards.map(function (c) {
    var href = c.rota_destino ||
      (c.doctype_destino
        ? "/desk/" + c.doctype_destino.toLowerCase().replace(/\s+/g, "-")
        : "#");
    return '<a href="' + href + '" onclick="return gfNav(\'' + href + '\',event)" ' +
      'style="display:flex;align-items:center;gap:14px;padding:16px 18px;' +
      'background:' + surf + ';border:1.5px solid ' + border + ';border-radius:14px;' +
      'text-decoration:none;color:' + text + ';transition:transform .15s,box-shadow .15s" ' +
      'onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 6px 20px rgba(0,0,0,.08)\'" ' +
      'onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'">' +
      '<div style="width:44px;height:44px;border-radius:11px;display:flex;align-items:center;' +
      'justify-content:center;font-size:22px;flex-shrink:0;background:' + (c.cor_fundo || "transparent") + '">' +
      (c.icone || "📌") + '</div>' +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-size:13.5px;font-weight:600;color:' + text + '">' + (c.titulo || "") + '</div>' +
      '<div style="font-size:11.5px;color:' + muted + '">' + (c.descricao || "") + '</div>' +
      '</div>' +
      '<span style="color:' + muted + ';font-size:16px">→</span></a>';
  }).join("");

  container.style.background = bg;
  container.style.overflowY  = "auto";
  container.style.fontFamily = font;

  container.innerHTML =
    '<div style="max-width:1280px;margin:0 auto;padding:28px 32px 56px;' +
    'display:flex;flex-direction:column;gap:28px;width:100%">' +

      // Hero
      '<div style="background:linear-gradient(135deg,rgba(22,163,74,.07),' + surf + ' 70%);' +
      'border:1px solid ' + border + ';border-radius:14px;padding:28px 32px">' +
        '<p style="font-size:13px;color:' + muted + ';margin:0 0 6px;font-family:' + font + '">' +
          greet + (fn ? ', <strong style="color:' + accent + '">' + fn + '</strong>' : '') + ' 👋</p>' +
        '<h1 style="font-size:26px;font-weight:800;color:' + text + ';margin:0 0 8px;' +
          'letter-spacing:-.025em;line-height:1.15;font-family:' + font + '">' +
          (page && page.titulo_pagina || "Central de Gestão GREENFARMS") + '</h1>' +
        '<p style="font-size:13.5px;color:' + muted + ';margin:0;font-family:' + font + '">' +
          (page && page.texto_boas_vindas || "Gerencie sua operação com eficiência e clareza.") + '</p>' +
      '</div>' +

      // Módulos
      '<div>' +
        '<h2 style="font-size:14px;font-weight:700;color:' + text + ';margin:0 0 14px;' +
        'display:flex;align-items:center;gap:8px;font-family:' + font + '">' +
          '<span style="width:3px;height:16px;background:' + accent + ';border-radius:2px;display:inline-block"></span>' +
          'Módulos do Sistema</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">' +
          cardsHtml +
        '</div>' +
      '</div>' +

    '</div>';
}

function _defaultCards() {
  return [
    { titulo:"Vendas",       descricao:"Pedidos e faturamento",       icone:"🛒", rota_destino:"/desk/selling",      cor_fundo:"#f0fdf4", ativo:1 },
    { titulo:"Compras",      descricao:"Fornecedores e recebimentos", icone:"📦", rota_destino:"/desk/buying",       cor_fundo:"#eff6ff", ativo:1 },
    { titulo:"Estoque",      descricao:"Produtos e armazéns",         icone:"🏭", rota_destino:"/desk/stock",        cor_fundo:"#fefce8", ativo:1 },
    { titulo:"Financeiro",   descricao:"Contas e pagamentos",         icone:"💰", rota_destino:"/desk/accounts",     cor_fundo:"#fdf2f8", ativo:1 },
    { titulo:"RH",           descricao:"Colaboradores e folha",       icone:"👥", rota_destino:"/desk/hr",           cor_fundo:"#f0f9ff", ativo:1 },
    { titulo:"Projetos",     descricao:"Tarefas e cronogramas",       icone:"📋", rota_destino:"/desk/project",      cor_fundo:"#f5f3ff", ativo:1 },
    { titulo:"CRM",          descricao:"Leads e oportunidades",       icone:"🤝", rota_destino:"/desk/crm",          cor_fundo:"#fff7ed", ativo:1 },
    { titulo:"Relatórios",   descricao:"Análises gerenciais",         icone:"📊", rota_destino:"/desk/query-report", cor_fundo:"#f0fdf4", ativo:1 },
    { titulo:"Configurações",descricao:"Administração",               icone:"⚙️", rota_destino:"/desk/setup",        cor_fundo:"#f8fafc", ativo:1 },
  ];
}

// Navegação global — usada pelos cards
window.gfNav = function (route, event) {
  if (event) event.preventDefault();
  try {
    var parts = route.replace(/^\/(desk|app)\/?/, "").split("/").filter(Boolean);
    if (parts.length) frappe.set_route(parts);
    else              frappe.set_route("gf-modern-desk");
  } catch (e) {
    window.location.href = route;
  }
  return false;
};
