/**
 * GF Modern Desk — gf_modern_desk.js v12
 * GREENFARMS | ichis_theme_app
 *
 * Page nativa do Frappe v16.
 * Renderiza a tela moderna substituindo o Desk padrão.
 * Oculta sidebar e breadcrumb desta página via JS.
 */

frappe.pages["gf-modern-desk"].on_page_load = function (wrapper) {
  // Remove o CSS de boot-hide se ainda estiver ativo
  var bootHide = document.getElementById("gf-boot-hide");
  if (bootHide) bootHide.remove();

  // Cria a página Frappe (necessário para o framework funcionar)
  frappe.ui.make_app_page({
    parent:        wrapper,
    title:         "GF Modern Desk",
    single_column: true,
  });

  // Oculta sidebar e breadcrumb desta página via JS
  // (o CSS [data-page-route] também faz isso, mas o JS garante)
  var els = [
    ".layout-side-section",
    ".desk-sidebar",
    ".sidebar-toggle-btn",
    ".page-breadcrumbs",
    ".breadcrumb-container",
  ];
  els.forEach(function (sel) {
    var el = document.querySelector(sel);
    if (el) el.style.display = "none";
  });

  // Cria o container da tela moderna (cobre toda a área)
  var old = document.getElementById("gf-modern-desk-root");
  if (old) old.remove();

  var root = document.createElement("div");
  root.id   = "gf-modern-desk-root";
  root.style.cssText = [
    "position:fixed",
    "top:56px",
    "left:0",
    "right:0",
    "bottom:0",
    "z-index:100",
    "overflow:hidden",
    "display:flex",
    "flex-direction:column",
  ].join(";");
  document.body.appendChild(root);

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

      window.gfCurrentPageData = deskPage || null;

      if (deskPage && deskPage.css_customizado) {
        var sc = document.getElementById("gf-md-css") || document.createElement("style");
        sc.id  = "gf-md-css";
        sc.textContent = deskPage.css_customizado;
        document.head.appendChild(sc);
      }

      if (deskPage && deskPage.js_customizado && deskPage.js_customizado.trim()) {
        // Cria #gf-ui-overlay-root dentro do container
        var inner = document.createElement("div");
        inner.id  = "gf-ui-overlay-root";
        inner.style.cssText = "width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;";
        root.appendChild(inner);
        try {
          (new Function(deskPage.js_customizado))();
        } catch (e) {
          console.error("[GF Modern Desk] Erro no JS customizado:", e);
          _gfRenderDefault(root, deskPage);
        }
      } else {
        _gfRenderDefault(root, deskPage);
      }
    },
    error: function () { _gfRenderDefault(root, null); }
  });
};

// Remove o container ao sair da página
frappe.pages["gf-modern-desk"].on_page_hide = function () {
  var r = document.getElementById("gf-modern-desk-root"); if (r) r.remove();
  var c = document.getElementById("gf-md-css");           if (c) c.remove();
  // Restaura sidebar para outras páginas
  [".layout-side-section",".desk-sidebar",".sidebar-toggle-btn"].forEach(function (s) {
    var el = document.querySelector(s);
    if (el) el.style.display = "";
  });
};

// Navegação dos cards
window.gfNav = function (route, event) {
  if (event) event.preventDefault();
  try {
    var parts = route.replace(/^\/(desk|app)\/?/, "").split("/").filter(Boolean);
    if (parts.length) frappe.set_route(parts);
    else frappe.set_route("gf-modern-desk");
  } catch (e) { window.location.href = route; }
  return false;
};

// Renderização padrão
function _gfRenderDefault(container, page) {
  var cs     = getComputedStyle(document.documentElement);
  var bg     = cs.getPropertyValue("--gf-bg-main").trim()        || "#f1f5f9";
  var surf   = cs.getPropertyValue("--gf-bg-card").trim()        || "#ffffff";
  var text   = cs.getPropertyValue("--gf-text-main").trim()      || "#0f172a";
  var muted  = cs.getPropertyValue("--gf-text-secondary").trim() || "#64748b";
  var accent = cs.getPropertyValue("--gf-accent").trim()         || "#16a34a";
  var border = cs.getPropertyValue("--gf-border").trim()         || "#e2e8f0";
  var font   = cs.getPropertyValue("--gf-font-main").trim()      || "Inter,sans-serif";
  var cards  = page && page.cards ? page.cards.filter(function(c){return c.ativo;}) : _defaultCards();
  var h = new Date().getHours();
  var greet = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  var fn = ""; try { fn = frappe.session.full_name || frappe.session.user.split("@")[0]; } catch(e){}

  var cardsHtml = cards.map(function(c){
    var href = c.rota_destino || (c.doctype_destino ? "/desk/"+c.doctype_destino.toLowerCase().replace(/\s+/g,"-") : "#");
    return '<a href="'+href+'" onclick="return gfNav(\''+href+'\',event)" '+
      'style="display:flex;align-items:center;gap:14px;padding:16px 18px;'+
      'background:'+surf+';border:1.5px solid '+border+';border-radius:14px;'+
      'text-decoration:none;color:'+text+';transition:transform .15s,box-shadow .15s" '+
      'onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 6px 20px rgba(0,0,0,.08)\'" '+
      'onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'">' +
      '<div style="width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;background:'+(c.cor_fundo||"transparent")+'">'+(c.icone||"📌")+'</div>'+
      '<div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600;color:'+text+'">'+(c.titulo||"")+'</div>'+
      '<div style="font-size:11.5px;color:'+muted+'">'+(c.descricao||"")+'</div></div>'+
      '<span style="color:'+muted+';font-size:16px">→</span></a>';
  }).join("");

  container.style.background = bg;
  container.style.overflowY  = "auto";
  container.style.fontFamily = font;
  container.innerHTML =
    '<div style="max-width:1280px;margin:0 auto;padding:28px 32px 56px;display:flex;flex-direction:column;gap:28px;width:100%">'+
      '<div style="background:linear-gradient(135deg,rgba(22,163,74,.07),'+surf+' 70%);border:1px solid '+border+';border-radius:14px;padding:28px 32px">'+
        '<p style="font-size:13px;color:'+muted+';margin:0 0 6px">'+greet+(fn?', <strong style="color:'+accent+'">'+fn+'</strong>':'')+' 👋</p>'+
        '<h1 style="font-size:26px;font-weight:800;color:'+text+';margin:0 0 8px;letter-spacing:-.025em">'+
          (page&&page.titulo_pagina||"Central de Gestão GREENFARMS")+'</h1>'+
        '<p style="font-size:13.5px;color:'+muted+';margin:0">'+
          (page&&page.texto_boas_vindas||"Gerencie sua operação com eficiência e clareza.")+'</p>'+
      '</div>'+
      '<div><h2 style="font-size:14px;font-weight:700;color:'+text+';margin:0 0 14px;display:flex;align-items:center;gap:8px">'+
        '<span style="width:3px;height:16px;background:'+accent+';border-radius:2px;display:inline-block"></span>Módulos do Sistema</h2>'+
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">'+cardsHtml+'</div>'+
      '</div>'+
    '</div>';
}

function _defaultCards() {
  return [
    {titulo:"Vendas",       descricao:"Pedidos e faturamento",       icone:"🛒",rota_destino:"/desk/selling",      cor_fundo:"#f0fdf4",ativo:1},
    {titulo:"Compras",      descricao:"Fornecedores e recebimentos", icone:"📦",rota_destino:"/desk/buying",       cor_fundo:"#eff6ff",ativo:1},
    {titulo:"Estoque",      descricao:"Produtos e armazéns",         icone:"🏭",rota_destino:"/desk/stock",        cor_fundo:"#fefce8",ativo:1},
    {titulo:"Financeiro",   descricao:"Contas e pagamentos",         icone:"💰",rota_destino:"/desk/accounts",     cor_fundo:"#fdf2f8",ativo:1},
    {titulo:"RH",           descricao:"Colaboradores e folha",       icone:"👥",rota_destino:"/desk/hr",           cor_fundo:"#f0f9ff",ativo:1},
    {titulo:"Projetos",     descricao:"Tarefas e cronogramas",       icone:"📋",rota_destino:"/desk/project",      cor_fundo:"#f5f3ff",ativo:1},
    {titulo:"CRM",          descricao:"Leads e oportunidades",       icone:"🤝",rota_destino:"/desk/crm",          cor_fundo:"#fff7ed",ativo:1},
    {titulo:"Relatórios",   descricao:"Análises gerenciais",         icone:"📊",rota_destino:"/desk/query-report", cor_fundo:"#f0fdf4",ativo:1},
    {titulo:"Configurações",descricao:"Administração",               icone:"⚙️",rota_destino:"/desk/setup",        cor_fundo:"#f8fafc",ativo:1},
  ];
}
