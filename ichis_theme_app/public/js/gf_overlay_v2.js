/**
 * GF Overlay — gf_overlay_v2.js v2.0
 * GREENFARMS | ichis_theme_app 
 *
 * PROBLEMA CORRIGIDO:
 *   O console mostrava "[GF Overlay] Páginas: 1" mas o overlay
 *   nunca ativava. Causa: _gfCheck() rodava antes das páginas
 *   carregarem, e o setInterval detectava a rota antes do
 *   gf-ov-boot ser aplicado no body.
 *
 *   Correção: sequência estrita
 *     1. IIFE → aplica gf-ov-boot imediatamente
 *     2. frappe.ready → busca settings
 *     3. Callback das páginas → ENTÃO chama _gfCheck()
 *     4. setInterval e patchHistory → APENAS após init completo
 *
 * Diagnóstico:
 *   window.gfOverlayVersion  → "GF_OVERLAY_V2"
 *   window.gfOverlayLoaded   → true
 *   window.gfCurrentRoute    → rota atual
 */

// ── IIFE: oculta Desk ANTES de qualquer render ────────────────
(function () {
  // Só executa no Desk, nunca no login
  if (window.location.pathname.indexOf("/login") !== -1) return;

  var s = document.createElement("style");
  s.id  = "gf-ov-boot-style";
  s.textContent =
    "body.gf-ov-boot .layout-main-section," +
    "body.gf-ov-boot .desk-sidebar," +
    "body.gf-ov-boot .standard-sidebar," +
    "body.gf-ov-boot .page-container," +
    "body.gf-ov-boot .layout-main," +
    "body.gf-ov-boot #page-desktop{visibility:hidden!important;pointer-events:none!important}" +
    "#gf-ui-overlay-root{display:none;position:fixed;top:56px;left:0;right:0;bottom:0;" +
    "z-index:900;overflow:hidden;flex-direction:column}" +
    "body.gf-ov-active #gf-ui-overlay-root{display:flex!important}" +
    "body.gf-ov-active .layout-main-section," +
    "body.gf-ov-active #page-desktop," +
    "body.gf-ov-active .desk-sidebar," +
    "body.gf-ov-active .standard-sidebar," +
    "body.gf-ov-active .page-container{visibility:hidden!important;pointer-events:none!important}" +
    ".gf-anim-suave{animation:gfAS 260ms ease both}" +
    ".gf-anim-fade{animation:gfAF 260ms ease both}" +
    "@keyframes gfAS{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}" +
    "@keyframes gfAF{from{opacity:0}to{opacity:1}}";
  (document.head || document.documentElement).appendChild(s);

  // Adiciona boot class imediatamente
  function addBoot() { document.body && document.body.classList.add("gf-ov-boot"); }
  if (document.body) addBoot();
  else document.addEventListener("DOMContentLoaded", addBoot, { once: true });
})();

// ── Diagnóstico ───────────────────────────────────────────────
window.gfOverlayVersion   = "GF_OVERLAY_V2";
window.gfCurrentRoute     = null;
window.gfCurrentPageData  = null;
window.gfOverlayActive    = false;
window.gfOverlayRendered  = false;
window.gfOverlaySettings  = null;
window.gfOverlayPages     = [];

// Não carregar no login
if (window.location.pathname.indexOf("/login") !== -1) {
  console.log("[GF Overlay] Página de login — overlay ignorado.");
} else if (window.gfOverlayLoaded) {
  console.log("[GF Overlay] Já carregado.");
} else {
  window.gfOverlayLoaded = true;
  console.log("[GF Overlay] v2 iniciando...");
  _gfOvStart();
}

// ═══════════════════════════════════════════════════════════════
// SEQUÊNCIA DE INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════
function _gfOvStart() {
  // Patch de history antes de qualquer coisa
  _gfPatchHistory();
  window.addEventListener("popstate", function () { setTimeout(_gfCheck, 50); });

  // Espera frappe.ready — único ponto de entrada no Desk
  _gfWaitFrappe(function () {
    // 1. Busca configurações globais do overlay
    frappe.call({
      method: "ichis_theme_app.api.theme.get_overlay_settings",
      callback: function (r) {
        var s = r && r.message;
        window.gfOverlaySettings = s || { ativar_sobreposicoes: 0 };

        if (!s || !s.ativar_sobreposicoes) {
          console.log("[GF Overlay] Desativado nas configurações.");
          _gfFallback();
          return;
        }

        // 2. Busca páginas ativas
        frappe.call({
          method: "ichis_theme_app.api.theme.get_active_overlay_pages",
          callback: function (r2) {
            var pages = r2 && r2.message;
            window.gfOverlayPages = Array.isArray(pages) ? pages : [];
            console.log("[GF Overlay] Páginas:", window.gfOverlayPages.length);

            // 3. SÓ AGORA registra listeners e verifica rota
            _gfRegisterRouter();
            _gfObserveDOM();
            _gfStartPolling();

            // 4. Verificação imediata com pequeno delay para DOM estar pronto
            setTimeout(_gfCheck, 150);
          },
          error: function () {
            console.warn("[GF Overlay] Erro ao buscar páginas.");
            _gfFallback();
          }
        });
      },
      error: function () {
        console.warn("[GF Overlay] Erro ao buscar settings.");
        _gfFallback();
      }
    });
  });
}

function _gfWaitFrappe(cb) {
  if (typeof frappe !== "undefined" && frappe.ready) {
    frappe.ready(cb);
  } else {
    var t = 0;
    var iv = setInterval(function () {
      if (typeof frappe !== "undefined" && frappe.ready) {
        clearInterval(iv); frappe.ready(cb);
      } else if (++t > 50) { clearInterval(iv); cb(); }
    }, 100);
  }
}

// ═══════════════════════════════════════════════════════════════
// VERIFICAÇÃO E MATCH DE ROTA
// ═══════════════════════════════════════════════════════════════
var DESK_ROUTES = ["/app", "/app/workspace", "/desk", "/app/workspace/home"];

function _gfRoute() {
  return (window.location.pathname || "/app")
    .replace(/\/$/, "").replace(/#.*$/, "").replace(/\?.*$/, "") || "/app";
}

function _gfMatch(route) {
  var n = route.toLowerCase();
  for (var i = 0; i < window.gfOverlayPages.length; i++) {
    var p = window.gfOverlayPages[i];
    if (!p.ativo && p.ativo !== 1) continue;

    if (p.tipo_alvo === "Desk") {
      for (var d = 0; d < DESK_ROUTES.length; d++)
        if (n === DESK_ROUTES[d] || n.startsWith(DESK_ROUTES[d] + "/")) return p;
    }

    var pr = (p.rota_alvo || "").toLowerCase().replace(/\/$/, "");
    if (pr && (n === pr || n.startsWith(pr + "/"))) return p;
  }
  return null;
}

function _gfCheck() {
  try {
    try { if (sessionStorage.getItem("gf_ov_off") === "1") { _gfFallback(); return; } } catch (e) {}

    var route = _gfRoute();
    window.gfCurrentRoute = route;
    var page = _gfMatch(route);

    if (page) {
      if (!window.gfOverlayRendered || window.gfLastPage !== page.nome_tecnico) {
        console.log("[GF Overlay] Match:", page.titulo, "| Rota:", route);
        _gfApply(page);
      }
    } else {
      if (window.gfOverlayActive) _gfRemove();
      else _gfFallback();
    }
  } catch (err) {
    console.warn("[GF Overlay] _gfCheck erro:", err);
    _gfFallback();
  }
}

// ═══════════════════════════════════════════════════════════════
// APLICAR OVERLAY
// ═══════════════════════════════════════════════════════════════
function _gfApply(page) {
  window.gfOverlayRendered = true;
  window.gfOverlayActive   = true;
  window.gfLastPage        = page.nome_tecnico;
  window.gfCurrentPageData = page;

  // Remove container anterior
  var old = document.getElementById("gf-ui-overlay-root"); if (old) old.remove();
  var ocs = document.getElementById("gf-ov-page-css");     if (ocs) ocs.remove();

  // Cria container
  var root = document.createElement("div");
  root.id  = "gf-ui-overlay-root";
  var anim = (window.gfOverlaySettings || {}).animacao_entrada;
  root.classList.add(anim === "Fade" ? "gf-anim-fade" : "gf-anim-suave");

  // Placeholder enquanto o JS customizado renderiza
  root.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:center;' +
    'height:100%;font-family:Inter,sans-serif;font-size:13px;color:#64748b;">Carregando...</div>';

  document.body.appendChild(root);

  // CSS da página
  if (page.css_customizado && page.css_customizado.trim()) {
    var sc = document.createElement("style");
    sc.id  = "gf-ov-page-css";
    sc.textContent = page.css_customizado;
    document.head.appendChild(sc);
  }

  // Ativa: remove boot, adiciona active
  document.body.classList.remove("gf-ov-boot");
  document.body.classList.add("gf-ov-active");

  // Executa JS da página (renderiza o HTML real)
  if (page.js_customizado && page.js_customizado.trim()) {
    try { (new Function(page.js_customizado))(); }
    catch (e) {
      console.warn("[GF Overlay] JS customizado erro:", e);
      _gfFallbackContent(root, page);
    }
  } else if (page.html_customizado && page.html_customizado.trim().length > 50) {
    root.innerHTML = page.html_customizado;
  } else {
    _gfFallbackContent(root, page);
  }

  console.log("[GF Overlay] Ativo:", page.titulo);
}

// Fallback visual se JS customizado não existir ou falhar
function _gfFallbackContent(root, page) {
  var cards = (page.cards || []).filter(function (c) { return c.ativo !== 0; });
  var cs = window.getComputedStyle(document.documentElement);
  var bg     = cs.getPropertyValue("--gf-bg-main").trim()      || "#f1f5f9";
  var surf   = cs.getPropertyValue("--gf-bg-card").trim()      || "#ffffff";
  var text   = cs.getPropertyValue("--gf-text-main").trim()    || "#0f172a";
  var muted  = cs.getPropertyValue("--gf-text-secondary").trim()|| "#64748b";
  var accent = cs.getPropertyValue("--gf-accent").trim()       || "#16a34a";
  var border = cs.getPropertyValue("--gf-border").trim()       || "#e2e8f0";
  var font   = cs.getPropertyValue("--gf-font-main").trim()    || "Inter,sans-serif";

  root.style.cssText = "background:" + bg + ";overflow-y:auto;font-family:" + font;

  var cardsHtml = cards.map(function (c) {
    var href = c.rota_destino ||
      (c.doctype_destino ? "/app/" + c.doctype_destino.toLowerCase().replace(/\s+/g, "-") : "#");
    var acc = c.cor_icone || accent;
    var cbg = c.cor_fundo || "transparent";
    return '<a href="' + href + '" onclick="return gfNav(\'' + href + '\',event)" ' +
      'style="display:flex;align-items:center;gap:14px;padding:16px 18px;' +
      'background:' + surf + ';border:1.5px solid ' + border + ';border-radius:14px;' +
      'text-decoration:none;color:' + text + ';transition:transform .15s,box-shadow .15s" ' +
      'onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 6px 20px rgba(0,0,0,.08)\'" ' +
      'onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'">' +
        '<div style="width:44px;height:44px;border-radius:11px;display:flex;align-items:center;' +
        'justify-content:center;font-size:22px;flex-shrink:0;background:' + cbg + '">' + (c.icone || "📌") + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13.5px;font-weight:600;color:' + text + '">' + (c.titulo || "") + '</div>' +
          '<div style="font-size:11.5px;color:' + muted + '">' + (c.descricao || "") + '</div>' +
        '</div>' +
        '<span style="color:' + muted + ';font-size:16px">→</span>' +
      '</a>';
  }).join("");

  var showBack = (window.gfOverlaySettings || {}).mostrar_botao_voltar_tela_original;
  var h = new Date().getHours();
  var greet = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  var fn = ""; try { fn = frappe.session.full_name || frappe.session.user.split("@")[0]; } catch (e) {}

  root.innerHTML =
    '<div style="display:flex;flex-direction:column;height:100%">' +
      // Topbar
      '<div style="height:52px;display:flex;align-items:center;gap:16px;padding:0 24px;' +
      'background:' + surf + ';border-bottom:1px solid ' + border + ';flex-shrink:0;' +
      'box-shadow:0 1px 4px rgba(0,0,0,.05)">' +
        '<span style="font-size:15px;font-weight:800;letter-spacing:.04em;color:' + accent + '">🌿 GREENFARMS</span>' +
        '<div style="flex:1;max-width:440px;margin:0 auto;display:flex;align-items:center;gap:10px;' +
        'background:' + bg + ';border:1.5px solid ' + border + ';border-radius:10px;padding:0 14px">' +
          '<span style="color:' + muted + '">🔍</span>' +
          '<input id="gf-search-main" type="text" placeholder="Buscar... (pressione /)" autocomplete="off" ' +
          'style="flex:1;border:none;outline:none;background:transparent;font-size:13px;color:' + text + ';padding:9px 0;font-family:' + font + '">' +
        '</div>' +
        '<div style="width:34px;height:34px;border-radius:50%;background:' + accent + ';color:#fff;' +
        'font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center">' +
        (fn ? fn.charAt(0).toUpperCase() : "G") + '</div>' +
      '</div>' +
      // Layout
      '<div style="display:flex;flex:1;overflow:hidden">' +
        // Sidebar
        '<nav style="width:210px;flex-shrink:0;background:' + surf + ';border-right:1px solid ' + border + ';' +
        'overflow-y:auto;display:flex;flex-direction:column;padding:12px 0">' +
          _gfSidebarLinks(accent, muted, text, font) +
          (showBack ? '<div style="margin-top:auto;padding:8px 10px;border-top:1px solid ' + border + '">' +
            '<button onclick="gfReturnToOriginalDesk()" style="display:flex;align-items:center;gap:8px;' +
            'width:100%;padding:7px 10px;border-radius:8px;border:none;background:transparent;' +
            'font-size:11.5px;color:' + muted + ';cursor:pointer;font-family:' + font + '">↩ Desk Original</button>' +
          '</div>' : '') +
        '</nav>' +
        // Conteúdo
        '<main style="flex:1;overflow-y:auto;padding:28px 32px 56px;display:flex;flex-direction:column;gap:28px">' +
          // Hero
          '<div style="background:linear-gradient(135deg,rgba(22,163,74,.07),' + surf + ' 70%);' +
          'border:1px solid ' + border + ';border-radius:14px;padding:28px 32px">' +
            '<p style="font-size:13px;color:' + muted + ';margin:0 0 6px">' + greet +
            (fn ? ', <strong style="color:' + accent + '">' + fn + '</strong>' : '') + ' 👋</p>' +
            '<h1 style="font-size:26px;font-weight:800;color:' + text + ';margin:0 0 8px;letter-spacing:-.025em">' +
            (page.titulo_pagina || "Central de Gestão GREENFARMS") + '</h1>' +
            '<p style="font-size:13.5px;color:' + muted + ';margin:0">' +
            (page.texto_boas_vindas || "Gerencie sua operação com eficiência e clareza.") + '</p>' +
          '</div>' +
          // Módulos
          '<div>' +
            '<h2 style="font-size:14px;font-weight:700;color:' + text + ';margin:0 0 14px;' +
            'display:flex;align-items:center;gap:8px"><span style="width:3px;height:16px;' +
            'background:' + accent + ';border-radius:2px;display:inline-block"></span>Módulos do Sistema</h2>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">' +
            cardsHtml + '</div>' +
          '</div>' +
        '</main>' +
      '</div>' +
    '</div>';

  // Busca global
  var inp = root.querySelector("#gf-search-main");
  if (inp) {
    inp.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var q = inp.value.trim(); if (!q) return; e.preventDefault();
      try { frappe.utils.global_search ? frappe.utils.global_search(q) : (window.location.href = "/app?q=" + encodeURIComponent(q)); }
      catch (ex) { window.location.href = "/app?q=" + encodeURIComponent(q); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault(); inp.focus(); inp.select();
      }
    });
  }
}

function _gfSidebarLinks(accent, muted, text, font) {
  var links = [
    ["🏠 Início",      "/app"],
    ["🛒 Vendas",      "/app/selling"],
    ["📦 Compras",     "/app/buying"],
    ["🏭 Estoque",     "/app/stock"],
    ["💰 Financeiro",  "/app/accounts"],
    ["👥 RH",          "/app/hr"],
    ["📋 Projetos",    "/app/project"],
    ["🤝 CRM",         "/app/crm"],
    ["📊 Relatórios",  "/app/query-report"],
    ["⚙️ Configurações","/app/setup"],
  ];
  var cur = window.location.pathname;
  return links.map(function (l) {
    var active = cur === l[1] || cur.startsWith(l[1] + "/");
    return '<a href="' + l[1] + '" onclick="return gfNav(\'' + l[1] + '\',event)" ' +
      'style="display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:8px;' +
      'font-size:13px;font-weight:500;text-decoration:none;margin:1px 8px;' +
      'font-family:' + font + ';transition:background .12s,color .12s;' +
      'color:' + (active ? accent : muted) + ';' +
      'background:' + (active ? "rgba(22,163,74,.1)" : "transparent") + '">' + l[0] + '</a>';
  }).join("");
}

// ─── Remover / Fallback ───────────────────────────────────────
function _gfRemove() {
  window.gfOverlayActive = false; window.gfOverlayRendered = false;
  window.gfLastPage = null; window.gfCurrentPageData = null;
  var r = document.getElementById("gf-ui-overlay-root"); if (r) r.remove();
  var c = document.getElementById("gf-ov-page-css");     if (c) c.remove();
  document.body.classList.remove("gf-ov-active", "gf-ov-boot");
}

function _gfFallback() {
  document.body.classList.remove("gf-ov-boot", "gf-ov-active");
  window.gfOverlayActive = false; window.gfOverlayRendered = false;
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES PÚBLICAS
// ═══════════════════════════════════════════════════════════════
window.gfNav = function (route, event) {
  if (event) event.preventDefault();
  try {
    var p = route.replace(/^\/app\/?/, "").split("/").filter(Boolean);
    if (p.length) frappe.set_route(p); else frappe.set_route("workspace");
  } catch (e) { window.location.href = route; }
  return false;
};

window.gfReturnToOriginalDesk = function () {
  try { sessionStorage.setItem("gf_ov_off", "1"); } catch (e) {}
  _gfRemove();
  try { frappe.set_route("workspace"); } catch (e) { window.location.href = "/app"; }
};

// ═══════════════════════════════════════════════════════════════
// LISTENERS DE ROTA
// ═══════════════════════════════════════════════════════════════
function _gfRegisterRouter() {
  try {
    if (frappe.router && frappe.router.on)
      frappe.router.on("change", function () { setTimeout(_gfCheck, 80); });
  } catch (e) {}
}

function _gfStartPolling() {
  var _lr = "";
  setInterval(function () {
    var c = _gfRoute();
    if (c !== _lr) { _lr = c; _gfCheck(); }
  }, 500);
}

function _gfPatchHistory() {
  try {
    ["pushState", "replaceState"].forEach(function (fn) {
      var o = history[fn].bind(history);
      history[fn] = function () { o.apply(history, arguments); setTimeout(_gfCheck, 80); };
    });
  } catch (e) {}
}

function _gfObserveDOM() {
  new MutationObserver(function (muts) {
    if (!window.gfOverlayActive) return;
    muts.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.id === "page-desktop" || (n.classList && n.classList.contains("layout-main-section")))
          setTimeout(function () { document.body.classList.add("gf-ov-active"); }, 30);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
}
