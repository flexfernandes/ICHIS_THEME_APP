/**
 * GF Overlay — gf_overlay_v2.js v3.0
 * GREENFARMS | ichis_theme_app
 *
 * Correções v3:
 *  - gfNav remove overlay E aguarda navegação completar antes de reativar polling
 *  - Match de rota usa comparação EXATA para Desk (/desk somente)
 *  - Polling só reavalia após navegação completar (500ms debounce)
 *  - Overlay não é reaplicado durante navegação interna
 */

// ── IIFE: oculta Desk ANTES de qualquer render ────────────────
(function () {
  if (window.location.pathname === "/desk") {
    var s = document.createElement("style");
    s.id  = "gf-ov-boot-style";
    s.textContent =
      "body.gf-ov-boot .layout-main-section,body.gf-ov-boot .desk-sidebar," +
      "body.gf-ov-boot .standard-sidebar,body.gf-ov-boot .page-container," +
      "body.gf-ov-boot .layout-main,body.gf-ov-boot #page-desktop{visibility:hidden!important;pointer-events:none!important}" +
      "#gf-ui-overlay-root{display:none;position:fixed;top:56px;left:0;right:0;bottom:0;z-index:900;overflow:hidden;flex-direction:column}" +
      "body.gf-ov-active #gf-ui-overlay-root{display:flex!important}" +
      "body.gf-ov-active .layout-main-section,body.gf-ov-active #page-desktop," +
      "body.gf-ov-active .desk-sidebar,body.gf-ov-active .standard-sidebar," +
      "body.gf-ov-active .page-container{visibility:hidden!important;pointer-events:none!important}" +
      ".gf-anim-suave{animation:gfAS 260ms ease both}" +
      "@keyframes gfAS{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}";
    (document.head || document.documentElement).appendChild(s);
    function addBoot() { document.body && document.body.classList.add("gf-ov-boot"); }
    if (document.body) addBoot();
    else document.addEventListener("DOMContentLoaded", addBoot, { once: true });
  }
})();

// ── Diagnóstico ───────────────────────────────────────────────
window.gfOverlayVersion   = "GF_OVERLAY_V3";
window.gfCurrentRoute     = null;
window.gfCurrentPageData  = null;
window.gfOverlayActive    = false;
window.gfOverlayRendered  = false;
window.gfOverlaySettings  = null;
window.gfOverlayPages     = [];

// Flag que bloqueia o polling durante navegação
var _gfNavigating = false;
var _gfNavTimer   = null;

if (window.location.pathname.indexOf("/login") !== -1) {
  console.log("[GF Overlay] Página de login — ignorado.");
} else if (window.gfOverlayLoaded) {
  console.log("[GF Overlay] Já carregado.");
} else {
  window.gfOverlayLoaded = true;
  console.log("[GF Overlay] v3 iniciando...");
  _gfOvStart();
}

function _gfOvStart() {
  _gfPatchHistory();
  window.addEventListener("popstate", function () {
    _gfSetNavigating();
    setTimeout(_gfCheck, 200);
  });
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", _gfOnReady);
  else _gfOnReady();
  window.addEventListener("load", function () { setTimeout(_gfCheck, 150); });
}

function _gfOnReady() {
  if (window.location.pathname === "/desk")
    document.body && document.body.classList.add("gf-ov-boot");

  _gfWaitFrappe(function () {
    frappe.call({
      method: "ichis_theme_app.api.theme.get_overlay_settings",
      callback: function (r) {
        var s = r && r.message;
        window.gfOverlaySettings = s || { ativar_sobreposicoes: 0 };
        if (!s || !s.ativar_sobreposicoes) { _gfFallback(); return; }

        frappe.call({
          method: "ichis_theme_app.api.theme.get_active_overlay_pages",
          callback: function (r2) {
            window.gfOverlayPages = Array.isArray(r2 && r2.message) ? r2.message : [];
            console.log("[GF Overlay] Páginas:", window.gfOverlayPages.length);
            _gfRegisterRouter();
            _gfObserveDOM();
            _gfStartPolling();
            setTimeout(_gfCheck, 200);
          },
          error: function () { _gfFallback(); }
        });
      },
      error: function () { _gfFallback(); }
    });
  });
}

function _gfWaitFrappe(cb) {
  if (typeof frappe !== "undefined" && frappe.ready) { frappe.ready(cb); return; }
  var t = 0, iv = setInterval(function () {
    if (typeof frappe !== "undefined" && frappe.ready) { clearInterval(iv); frappe.ready(cb); }
    else if (++t > 50) { clearInterval(iv); cb(); }
  }, 100);
}

// ── Polling — só roda se não estiver navegando ────────────────
function _gfStartPolling() {
  var _lr = "";
  setInterval(function () {
    if (_gfNavigating) return;
    var c = _gfRoute();
    if (c !== _lr) { _lr = c; _gfCheck(); }
  }, 500);
}

// Marca que está navegando e libera após 800ms
function _gfSetNavigating() {
  _gfNavigating = true;
  clearTimeout(_gfNavTimer);
  _gfNavTimer = setTimeout(function () { _gfNavigating = false; }, 800);
}

// ── Rota e match ─────────────────────────────────────────────
function _gfRoute() {
  return (window.location.pathname || "/desk")
    .replace(/\/$/, "").replace(/#.*$/, "").replace(/\?.*$/, "") || "/desk";
}

// Rotas EXATAS que ativam o overlay (sem startsWith)
var DESK_ROUTES_EXACT = ["/desk", "/app", "/app/workspace", "/app/workspace/home"];

function _gfMatch(route) {
  var n = route.toLowerCase();
  for (var i = 0; i < window.gfOverlayPages.length; i++) {
    var p = window.gfOverlayPages[i];
    if (!p.ativo || p.ativo === 0) continue;

    if (p.tipo_alvo === "Desk") {
      for (var d = 0; d < DESK_ROUTES_EXACT.length; d++)
        if (n === DESK_ROUTES_EXACT[d]) return p;
    }

    var pr = (p.rota_alvo || "").toLowerCase().replace(/\/$/, "");
    if (pr && n === pr) return p;
  }
  return null;
}

function _gfCheck() {
  if (_gfNavigating) return;
  try {
    var route = _gfRoute();
    window.gfCurrentRoute = route;
    var page = _gfMatch(route);
    if (page) {
      if (!window.gfOverlayRendered || window.gfLastPage !== page.nome_tecnico)
        _gfApply(page);
    } else {
      if (window.gfOverlayActive) _gfRemove();
      else _gfFallback();
    }
  } catch (err) {
    console.warn("[GF Overlay] _gfCheck:", err);
    _gfFallback();
  }
}

// ── Aplicar overlay ───────────────────────────────────────────
function _gfApply(page) {
  window.gfOverlayRendered = true;
  window.gfOverlayActive   = true;
  window.gfLastPage        = page.nome_tecnico;
  window.gfCurrentPageData = page;

  var old = document.getElementById("gf-ui-overlay-root"); if (old) old.remove();
  var ocs = document.getElementById("gf-ov-page-css");     if (ocs) ocs.remove();

  var root = document.createElement("div");
  root.id  = "gf-ui-overlay-root";
  root.classList.add("gf-anim-suave");
  root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:Inter,sans-serif;font-size:13px;color:#64748b">Carregando...</div>';
  document.body.appendChild(root);

  if (page.css_customizado && page.css_customizado.trim()) {
    var sc = document.createElement("style");
    sc.id  = "gf-ov-page-css";
    sc.textContent = page.css_customizado;
    document.head.appendChild(sc);
  }

  document.body.classList.remove("gf-ov-boot");
  document.body.classList.add("gf-ov-active");

  if (page.js_customizado && page.js_customizado.trim()) {
    try { (new Function(page.js_customizado))(); }
    catch (e) { console.warn("[GF Overlay] JS customizado:", e); _gfFallbackContent(root, page); }
  } else if (page.html_customizado && page.html_customizado.trim().length > 50) {
    root.innerHTML = page.html_customizado;
  } else {
    _gfFallbackContent(root, page);
  }

  console.log("[GF Overlay] Ativo:", page.titulo, "| Rota:", window.gfCurrentRoute);
}

function _gfFallbackContent(root, page) {
  var cards = (page.cards || []).filter(function (c) { return c.ativo !== 0; });
  root.innerHTML = '<div style="padding:32px;font-family:Inter,sans-serif">' +
    '<h1 style="font-size:24px;font-weight:800;margin:0 0 24px">' + (page.titulo_pagina || "GREENFARMS") + '</h1>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">' +
    cards.map(function (c) {
      var href = c.rota_destino || (c.doctype_destino ? "/desk/" + c.doctype_destino.toLowerCase().replace(/\s+/g, "-") : "#");
      return '<a href="' + href + '" onclick="return gfNav(\'' + href + '\',event)" ' +
        'style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;text-decoration:none;color:#0f172a">' +
        '<span style="font-size:20px">' + (c.icone || "📌") + '</span>' +
        '<span><strong style="display:block;font-size:13px">' + c.titulo + '</strong>' +
        '<small style="font-size:11px;color:#64748b">' + c.descricao + '</small></span></a>';
    }).join("") + '</div></div>';
}

// ── Remover / Fallback ────────────────────────────────────────
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

// ── Funções públicas ──────────────────────────────────────────
window.gfNav = function (route, event) {
  if (event) event.preventDefault();

  // Marca navegando para bloquear o polling
  _gfSetNavigating();

  // Remove o overlay ANTES de navegar
  _gfRemove();

  // Navega após um tick para o DOM atualizar
  setTimeout(function () {
    try {
      if (typeof frappe !== "undefined" && frappe.set_route) {
        var parts = route.replace(/^\/(desk|app)\/?/, "").split("/").filter(Boolean);
        if (parts.length) frappe.set_route(parts);
        else frappe.set_route("workspace");
      } else {
        window.location.href = route;
      }
    } catch (e) { window.location.href = route; }
  }, 50);

  return false;
};

window.gfReturnToOriginalDesk = function () {
  _gfSetNavigating();
  _gfRemove();
  setTimeout(function () {
    try { frappe.set_route("workspace"); }
    catch (e) { window.location.href = "/desk"; }
  }, 50);
};

// ── Infraestrutura ────────────────────────────────────────────
function _gfRegisterRouter() {
  try {
    if (frappe.router && frappe.router.on)
      frappe.router.on("change", function () {
        _gfSetNavigating();
        setTimeout(_gfCheck, 300);
      });
  } catch (e) {}
}

function _gfPatchHistory() {
  try {
    ["pushState", "replaceState"].forEach(function (fn) {
      var o = history[fn].bind(history);
      history[fn] = function () {
        o.apply(history, arguments);
        _gfSetNavigating();
        setTimeout(_gfCheck, 300);
      };
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
          setTimeout(function () {
            if (window.gfOverlayActive) document.body.classList.add("gf-ov-active");
          }, 30);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
}
