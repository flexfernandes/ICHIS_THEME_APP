/**
 * GF Overlay — gf_overlay.js v1.0 (ichis_theme_app unificado)
 * GREENFARMS | Interceptação de rota e renderização do Modern Desk
 *
 * Ordem de execução garantida pelo hooks.py:
 *   1. gf_theme.css   → variáveis CSS --gf-* no :root
 *   2. gf_overlay.css → layout do Modern Desk (consome --gf-*)
 *   3. gf_theme.js    → aplica variáveis via API e substitui logos
 *   4. gf_overlay.js  → este arquivo: intercepta rota e renderiza
 *
 * Diagnóstico no console:
 *   window.gfOverlayVersion  → "GF_OVERLAY_V1"
 *   window.gfOverlayLoaded   → true
 *   window.gfCurrentRoute    → rota atual normalizada
 *   window.gfCurrentPageData → dados da página ativa com cards
 */

// ── CAMADA 0: ocultar Desk IMEDIATAMENTE ─────────────────────
(function gfOverlayBoot() {
  var s = document.createElement("style");
  s.id  = "gf-overlay-boot";
  s.textContent =
    "body.gf-ov-boot .layout-main-section," +
    "body.gf-ov-boot .desk-sidebar," +
    "body.gf-ov-boot .standard-sidebar," +
    "body.gf-ov-boot .page-container," +
    "body.gf-ov-boot .layout-main," +
    "body.gf-ov-boot #page-desktop," +
    "body.gf-ov-boot .frappe-app{visibility:hidden!important;pointer-events:none!important}" +
    "#gf-ui-overlay-root{display:none;position:fixed;top:56px;left:0;right:0;bottom:0;z-index:900;overflow:hidden;flex-direction:column}" +
    "body.gf-ov-active #gf-ui-overlay-root{display:flex!important}" +
    "body.gf-ov-active .layout-main-section," +
    "body.gf-ov-active #page-desktop," +
    "body.gf-ov-active .desk-sidebar," +
    "body.gf-ov-active .standard-sidebar," +
    "body.gf-ov-active .page-container{visibility:hidden!important;pointer-events:none!important}" +
    ".gf-anim-suave{animation:gfAS 280ms ease both}" +
    ".gf-anim-fade{animation:gfAF 280ms ease both}" +
    ".gf-anim-slide{animation:gfASL 320ms ease both}" +
    "@keyframes gfAS{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
    "@keyframes gfAF{from{opacity:0}to{opacity:1}}" +
    "@keyframes gfASL{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}";
  (document.head || document.documentElement).appendChild(s);
  if (document.body) document.body.classList.add("gf-ov-boot");
  else document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add("gf-ov-boot");
  }, { once: true });
})();

// ── DIAGNÓSTICO ───────────────────────────────────────────────
window.gfOverlayVersion   = "GF_OVERLAY_V1";
window.gfCurrentRoute     = null;
window.gfCurrentPageData  = null;
window.gfOverlayActive    = false;
window.gfOverlayRendered  = false;
window.gfOverlaySettings  = null;
window.gfOverlayPages     = [];

if (window.gfOverlayLoaded) {
  console.log("[GF Overlay] já carregado.");
} else {
  window.gfOverlayLoaded = true;
  console.log("[GF Overlay] v1 iniciando...");
  _gfOvStart();
}

// ═══════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════
function _gfOvStart() {
  _gfPatchHistory();
  window.addEventListener("popstate", function () { setTimeout(_gfCheck, 30); });
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", _gfOnReady);
  else
    _gfOnReady();
  window.addEventListener("load", function () { setTimeout(_gfCheck, 100); });
}

function _gfOnReady() {
  if (document.body) document.body.classList.add("gf-ov-boot");
  if (typeof frappe !== "undefined" && frappe.ready) frappe.ready(_gfInit);
  setTimeout(_gfInit, 250);
  setTimeout(_gfCheck, 700);
  setTimeout(_gfCheck, 1400);
}

var _initDone = false;
function _gfInit() {
  if (_initDone) { _gfCheck(); return; } _initDone = true;

  _gfAPI("ichis_theme_app.api.theme.get_overlay_settings", {}, function (s) {
    window.gfOverlaySettings = s || { ativar_sobreposicoes: 0 };

    if (!s || !s.ativar_sobreposicoes) {
      console.log("[GF Overlay] Desativado nas configurações.");
      _gfFallback(); return;
    }

    _gfAPI("ichis_theme_app.api.theme.get_active_overlay_pages", {}, function (pages) {
      window.gfOverlayPages = Array.isArray(pages) ? pages : [];
      console.log("[GF Overlay] Páginas:", window.gfOverlayPages.length);

      try {
        if (typeof frappe !== "undefined" && frappe.router && frappe.router.on)
          frappe.router.on("change", function () { setTimeout(_gfCheck, 30); });
      } catch (e) {}

      _gfObserveDOM();
      var _lr = "";
      setInterval(function () { var c = _gfRoute(); if (c !== _lr) { _lr = c; _gfCheck(); } }, 400);
      _gfCheck();
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// VERIFICAÇÃO DE ROTA
// ═══════════════════════════════════════════════════════════════
function _gfCheck() {
  try {
    try { if (sessionStorage.getItem("gf_ov_off") === "1") { _gfFallback(); return; } } catch (e) {}
    var route = _gfRoute();
    window.gfCurrentRoute = route;
    var page = _gfMatch(route);
    if (page) {
      if (!window.gfOverlayRendered || window.gfLastPage !== page.nome_tecnico)
        _gfApply(page);
    } else {
      if (window.gfOverlayActive) _gfRemove(); else _gfFallback();
    }
  } catch (err) {
    console.warn("[GF Overlay] _gfCheck:", err);
    _gfFallback();
  }
}

function _gfRoute() {
  return (window.location.pathname || "/app")
    .replace(/\/$/, "").replace(/#.*$/, "").replace(/\?.*$/, "") || "/app";
}

var DESK_ROUTES = ["/app", "/app/workspace", "/desk", "/app/workspace/home"];
function _gfMatch(route) {
  var pages = window.gfOverlayPages || [];
  var n = route.toLowerCase();
  for (var i = 0; i < pages.length; i++) {
    var p = pages[i];
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

// ═══════════════════════════════════════════════════════════════
// APLICAR OVERLAY
// ═══════════════════════════════════════════════════════════════
function _gfApply(page) {
  window.gfOverlayRendered = true;
  window.gfOverlayActive   = true;
  window.gfLastPage        = page.nome_tecnico;
  window.gfCurrentPageData = page;

  var old = document.getElementById("gf-ui-overlay-root"); if (old) old.remove();
  var ocs = document.getElementById("gf-ov-page-css");     if (ocs) ocs.remove();

  var root = document.createElement("div");
  root.id  = "gf-ui-overlay-root";
  var animMap = { "Suave": "gf-anim-suave", "Fade": "gf-anim-fade", "Slide": "gf-anim-slide" };
  root.classList.add(animMap[(window.gfOverlaySettings || {}).animacao_entrada] || "gf-anim-suave");
  root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:Inter,sans-serif;font-size:13px;color:#64748b;">Carregando...</div>';

  document.body.appendChild(root);

  // CSS da página
  if (page.css_customizado && page.css_customizado.trim()) {
    var sc = document.createElement("style");
    sc.id  = "gf-ov-page-css";
    sc.textContent = page.css_customizado;
    document.head.appendChild(sc);
  }

  // Ativar
  document.body.classList.remove("gf-ov-boot");
  document.body.classList.add("gf-ov-active");

  // JS da página renderiza o conteúdo real
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

  console.log("[GF Overlay] Ativo:", page.titulo, "| Rota:", window.gfCurrentRoute);
}

function _gfFallbackContent(root, page) {
  var cards = (page.cards || []).filter(function (c) { return c.ativo !== 0; });
  root.innerHTML = '<div style="padding:32px;font-family:Inter,sans-serif;max-width:1200px;margin:0 auto">' +
    '<h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 8px">' + (page.titulo_pagina || "GREENFARMS") + '</h1>' +
    '<p style="color:#64748b;margin:0 0 28px">' + (page.texto_boas_vindas || "") + '</p>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">' +
    cards.map(function (c) {
      var href = c.rota_destino || "#";
      return '<a href="' + href + '" onclick="return gfNav(\'' + href + '\',event)" style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;text-decoration:none;color:#0f172a">' +
        '<span style="font-size:20px">' + (c.icone || "📌") + '</span>' +
        '<span><strong style="display:block;font-size:13px">' + c.titulo + '</strong><small style="font-size:11px;color:#64748b">' + c.descricao + '</small></span></a>';
    }).join("") + '</div></div>';
}

// ─── REMOVER / FALLBACK ───────────────────────────────────────
function _gfRemove() {
  window.gfOverlayActive = false; window.gfOverlayRendered = false;
  window.gfLastPage = null; window.gfCurrentPageData = null;
  var r = document.getElementById("gf-ui-overlay-root"); if (r) r.remove();
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
    if (typeof frappe !== "undefined" && frappe.set_route) {
      var p = route.replace(/^\/app\/?/, "").split("/").filter(Boolean);
      if (p.length) frappe.set_route(p); else frappe.set_route("workspace");
    } else window.location.href = route;
  } catch (e) { window.location.href = route; }
  return false;
};

window.gfReturnToOriginalDesk = function () {
  try { sessionStorage.setItem("gf_ov_off", "1"); } catch (e) {}
  _gfRemove();
  try {
    if (typeof frappe !== "undefined" && frappe.set_route) frappe.set_route("workspace");
    else window.location.href = "/app";
  } catch (e) { window.location.href = "/app"; }
};

// ─── UTILITÁRIOS ─────────────────────────────────────────────
function _gfAPI(method, args, cb) {
  try {
    if (typeof frappe !== "undefined" && frappe.call) {
      frappe.call({ method: method, args: args || {},
        callback: function (r) { cb(r && r.message !== undefined ? r.message : null); },
        error:    function ()  { cb(null); } });
    } else {
      fetch("/api/method/" + method, { credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .then(function (d) { cb(d && d.message !== undefined ? d.message : null); })
        .catch(function ()  { cb(null); });
    }
  } catch (e) { cb(null); }
}

function _gfPatchHistory() {
  try {
    ["pushState", "replaceState"].forEach(function (fn) {
      var o = history[fn].bind(history);
      history[fn] = function () { o.apply(history, arguments); setTimeout(_gfCheck, 40); };
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
          setTimeout(function () { document.body.classList.add("gf-ov-active"); }, 20);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
}
