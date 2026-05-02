/**
 * GF Theme — gf_theme.js v3.0
 * GREENFARMS | ichis_theme_app 
 *
 * FLUXO CORRETO:
 *   - Login:  URL contém /login  → aplica tema de login
 *   - Desk:   qualquer outra URL → espera frappe.ready() e aplica tema
 *
 * NÃO usa typeof frappe === "undefined" para detectar contexto
 * porque o script carrega ANTES do frappe ser definido.
 * USA window.location.pathname como única fonte confiável.
 *
 * Diagnóstico:
 *   window.gfThemeVersion       → "GF_THEME_V3"
 *   window.gfThemeControlLoaded → true
 *   window.gfThemeActive        → true/false
 */

window.gfThemeVersion       = "GF_THEME_V3";
window.gfThemeControlLoaded = true;
window.gfThemeActive        = false;

var GF_FALLBACK_LOGO = "/assets/ichis_theme_app/images/app_underline_logo.png";
var GF_LOGO_PATTERNS = [
  "frappe-framework-logo", "erpnext-logo", "erpnext_logo", "frappe_logo",
  "/assets/frappe/", "/assets/erpnext/images/", "app_logo.png",
];

console.log("GF Theme Control carregado GF_THEME_V3");

// ── Detecção de contexto pela URL — única forma confiável ─────
// O script roda antes do frappe existir, então usamos pathname
var _GF_IS_LOGIN = (window.location.pathname || "").indexOf("/login") !== -1;

console.log("GF Theme Control: página =", _GF_IS_LOGIN ? "login" : "desk");

// ── Entrada principal ─────────────────────────────────────────
if (_GF_IS_LOGIN) {
  // No login: frappe não existe, usamos fetch nativo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _gfApplyLogin);
  } else {
    _gfApplyLogin();
  }
} else {
  // No Desk: espera frappe.ready() que é o momento certo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      _gfWaitFrappe(_gfApplyDesk);
    });
  } else {
    _gfWaitFrappe(_gfApplyDesk);
  }
}

// Aguarda frappe estar disponível com polling seguro
function _gfWaitFrappe(cb) {
  if (typeof frappe !== "undefined" && frappe.ready) {
    frappe.ready(cb);
  } else {
    var tries = 0;
    var interval = setInterval(function () {
      tries++;
      if (typeof frappe !== "undefined" && frappe.ready) {
        clearInterval(interval);
        frappe.ready(cb);
      } else if (tries > 50) { // 5 segundos máximo
        clearInterval(interval);
        cb(); // tenta mesmo assim
      }
    }, 100);
  }
}

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════
function _gfApplyLogin() {
  _gfFetchNative("ichis_theme_app.api.theme.get_public_theme_settings", function (s) {
    if (!s || !s.ativar_tema_gf || !s.aplicar_no_login) {
      console.log("GF Theme Control: tema de login desativado.");
      return;
    }

    var r = document.documentElement;
    if (s.login_cor_fundo) r.style.setProperty("--gf-bg-main",  s.login_cor_fundo);
    if (s.login_cor_texto) r.style.setProperty("--gf-text-main", s.login_cor_texto);
    if (s.login_cor_card)  r.style.setProperty("--gf-bg-card",   s.login_cor_card);

    if (s.login_usar_imagem_fundo && s.login_imagem_fundo) {
      document.body.style.cssText +=
        ";background-image:url('" + s.login_imagem_fundo + "')" +
        ";background-size:cover;background-position:center";
    }

    if (s.substituir_logos_erpnext) {
      var logoUrl = s.logo_login || s.fallback_logo || GF_FALLBACK_LOGO;
      _gfReplaceLogos(logoUrl, s);
      _gfObserveLogos(logoUrl, s);
    }

    console.log("GF Theme Control: tema de login aplicado. Tema:", s.tema_ativo || "Padrão");
  });
}

// ═══════════════════════════════════════════════════════════════
// DESK
// ═══════════════════════════════════════════════════════════════
function _gfApplyDesk() {
  frappe.call({
    method: "ichis_theme_app.api.theme.get_theme_settings",
    callback: function (r) {
      var s = r && r.message;

      if (!s || !s.ativar_tema_gf || !s.aplicar_no_desk) {
        console.log("GF Theme Control: tema desativado — ERPNext visual nativo.");
        _gfDeactivate();
        // Logos mesmo com tema desativado
        if (s && s.substituir_logos_erpnext) {
          var logo = s.logo_navbar || s.logo_global || GF_FALLBACK_LOGO;
          _gfReplaceLogos(logo, s);
          _gfObserveLogos(logo, s);
        }
        return;
      }

      _gfApplyVars(s);
      _gfActivate(s.tema_ativo);

      if (s.substituir_logos_erpnext) {
        var logo = s.logo_navbar || s.logo_global || GF_FALLBACK_LOGO;
        _gfReplaceLogos(logo, s);
        _gfObserveLogos(logo, s);
      }

      if (s.favicon_customizado) _gfSetFavicon(s.favicon_customizado);

      _gfListenSave();

      console.log("GF Theme Control: tema ativo:", s.tema_ativo);
    },
    error: function () {
      console.warn("GF Theme Control: erro ao buscar configurações.");
      _gfDeactivate();
    }
  });
}

// ── Ativar / Desativar ────────────────────────────────────────
function _gfActivate(tema) {
  document.body.classList.add("gf-theme-active");
  document.body.setAttribute("data-gf-tema", tema || "Padrão");
  window.gfThemeActive = true;
  console.log("GF Theme Control: .gf-theme-active ativado. Tema:", tema);
}

function _gfDeactivate() {
  document.body.classList.remove("gf-theme-active");
  document.body.removeAttribute("data-gf-tema");
  window.gfThemeActive = false;
}

// ── Aplicar variáveis CSS ─────────────────────────────────────
function _gfApplyVars(s) {
  var tema = s.tema_ativo || "Padrão";
  var p    = tema === "Black" ? "black_" : "padrao_";
  var r    = document.documentElement;

  function set(cssVar, field, fallback) {
    var val = s[p + field] || fallback;
    if (val) r.style.setProperty(cssVar, val);
  }

  set("--gf-bg-main",        "cor_fundo_principal",   "#f8fafc");
  set("--gf-bg-secondary",   "cor_fundo_secundaria",  "#ffffff");
  set("--gf-bg-content",     "cor_fundo_conteudo",    "#ffffff");
  set("--gf-bg-card",        "cor_fundo_cards",       "#ffffff");
  set("--gf-bg-navbar",      "cor_fundo_navbar",      "#ffffff");
  set("--gf-bg-sidebar",     "cor_fundo_sidebar",     "#f9fafb");
  set("--gf-bg-menu",        "cor_fundo_menu",        "#ffffff");
  set("--gf-bg-modal",       "cor_fundo_modal",       "#ffffff");
  set("--gf-bg-dropdown",    "cor_fundo_dropdown",    "#ffffff");
  set("--gf-text-main",      "cor_fonte_principal",   "#111827");
  set("--gf-text-secondary", "cor_fonte_secundaria",  "#6b7280");
  set("--gf-text-soft",      "cor_fonte_suave",       "#94a3b8");
  set("--gf-text-title",     "cor_titulo",            "#111827");
  set("--gf-text-subtitle",  "cor_subtitulo",         "#374151");
  set("--gf-text-link",      "cor_link",              "#15803d");
  set("--gf-accent",         "cor_destaque",          "#16a34a");
  set("--gf-accent-dark",    "cor_destaque_escura",   "#166534");
  set("--gf-border",         "cor_borda",             "#e5e7eb");
  set("--gf-shadow",         "cor_sombra",            "rgba(15,23,42,0.08)");
  set("--gf-hover",          "cor_hover",             "#dcfce7");
  set("--gf-selection",      "cor_selecao",           "#bbf7d0");
  set("--gf-success",        "cor_sucesso",           "#16a34a");
  set("--gf-warning",        "cor_alerta",            "#f59e0b");
  set("--gf-error",          "cor_erro",              "#dc2626");
  set("--gf-info",           "cor_info",              "#2563eb");
  set("--gf-font-main",      "fonte_principal",       'Inter,"Segoe UI",Arial,sans-serif');
  set("--gf-font-title",     "fonte_titulos",         'Inter,"Segoe UI",Arial,sans-serif');
  set("--gf-font-number",    "fonte_numeros",         '"Roboto Mono",Consolas,monospace');
  set("--gf-fs-base",        "tamanho_fonte_base",    "13px");
  set("--gf-fs-title",       "tamanho_fonte_titulo",  "18px");
  set("--gf-fs-subtitle",    "tamanho_fonte_subtitulo","14px");
  set("--gf-fs-menu",        "tamanho_fonte_menu",    "13px");
  set("--gf-fs-table",       "tamanho_fonte_tabela",  "12px");
  set("--gf-fw-regular",     "peso_fonte_regular",    "400");
  set("--gf-fw-medium",      "peso_fonte_medio",      "500");
  set("--gf-fw-semibold",    "peso_fonte_semibold",   "600");
  set("--gf-fw-bold",        "peso_fonte_bold",       "700");
  set("--gf-btn-bg",         "botao_primario_fundo",  "#16a34a");
  set("--gf-btn-text",       "botao_primario_texto",  "#ffffff");
  set("--gf-btn-hover",      "botao_hover_fundo",     "#166534");
  set("--gf-btn-radius",     "botao_raio_borda",      "6px");
  set("--gf-btn-h",          "botao_altura",          "32px");
  set("--gf-btn-px",         "botao_padding_horizontal","14px");
  set("--gf-btn-fw",         "botao_peso_fonte",      "500");
  set("--gf-field-bg",       "campo_fundo",           "#ffffff");
  set("--gf-field-text",     "campo_texto",           "#111827");
  set("--gf-field-ph",       "campo_placeholder",     "#9ca3af");
  set("--gf-field-border",   "campo_borda",           "#d1d5db");
  set("--gf-field-focus",    "campo_borda_foco",      "#16a34a");
  set("--gf-field-h",        "campo_altura",          "30px");
  set("--gf-field-p",        "campo_padding",         "6px 10px");
  set("--gf-field-fs",       "campo_tamanho_fonte",   "13px");
  set("--gf-field-radius",   "campo_raio_borda",      "6px");
  set("--gf-card-bg",        "card_fundo",            "#ffffff");
  set("--gf-card-border",    "card_borda",            "#e5e7eb");
  set("--gf-card-shadow",    "card_sombra",           "0 1px 4px rgba(15,23,42,0.08)");
  set("--gf-card-radius",    "card_raio_borda",       "10px");
  set("--gf-grid-bg-head",   "grid_cor_fundo_cabecalho",       "#f3f4f6");
  set("--gf-grid-bg-row",    "grid_cor_fundo_linha",           "#ffffff");
  set("--gf-grid-bg-alt",    "grid_cor_fundo_linha_alternada", "#f9fafb");
  set("--gf-grid-bg-hover",  "grid_cor_fundo_hover",           "#ecfdf5");
  set("--gf-grid-text-row",  "grid_cor_fonte_linha",           "#111827");
  set("--gf-grid-text-head", "grid_cor_fonte_cabecalho",       "#374151");
  set("--gf-grid-border",    "grid_cor_borda",                 "#e5e7eb");
  set("--gf-grid-select",    "grid_cor_selecao",               "#bbf7d0");
  set("--gf-grid-row-h",     "grid_altura_linha",              "34px");
  set("--gf-grid-head-h",    "grid_altura_cabecalho",          "38px");
  set("--gf-grid-fs-row",    "grid_tamanho_fonte_linha",       "12px");
  set("--gf-grid-fs-head",   "grid_tamanho_fonte_cabecalho",   "11px");
  set("--gf-grid-fw-head",   "grid_peso_fonte_cabecalho",      "600");
  set("--gf-grid-px",        "grid_padding_horizontal",        "10px");
  set("--gf-grid-py",        "grid_padding_vertical",          "6px");
  set("--gf-grid-radius",    "grid_raio_borda",                "10px");
}

// ── Atualização em tempo real ─────────────────────────────────
function _gfListenSave() {
  try {
    frappe.realtime.on("doc_update", function (data) {
      if (data && data.doctype === "GF Theme Settings") {
        console.log("GF Theme Control: atualização detectada — reaplicando...");
        setTimeout(_gfApplyDesk, 300);
      }
    });
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════
// LOGOS
// ═══════════════════════════════════════════════════════════════
function _gfReplaceLogos(logoUrl, settings) {
  if (!logoUrl) return;
  try {
    document.querySelectorAll("img").forEach(function (img) {
      var src = img.getAttribute("src") || "";
      var isErp = GF_LOGO_PATTERNS.some(function (p) { return src.indexOf(p) !== -1; });
      if (isErp && src !== logoUrl) {
        img.setAttribute("src", logoUrl);
        img.style.objectFit = "contain";
      }
    });
    [".navbar-brand img", ".app-logo img"].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el.getAttribute("src") !== logoUrl) {
          el.setAttribute("src", logoUrl);
          el.style.objectFit = "contain";
        }
      });
    });
    if (settings && settings.texto_sistema) {
      document.querySelectorAll(".navbar-brand span, .app-name").forEach(function (el) {
        var t = el.textContent || "";
        if (t.indexOf("ERPNext") !== -1 || t.indexOf("Frappe") !== -1)
          el.textContent = settings.texto_sistema;
      });
    }
  } catch (e) {}
}

function _gfObserveLogos(logoUrl, settings) {
  try {
    new MutationObserver(function (muts) {
      var hasNew = muts.some(function (m) { return m.addedNodes && m.addedNodes.length; });
      if (hasNew) _gfReplaceLogos(logoUrl, settings);
    }).observe(document.body || document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
}

function _gfSetFavicon(url) {
  try {
    var link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = url;
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════
// FETCH (login usa nativo, desk usa frappe.call)
// ═══════════════════════════════════════════════════════════════
function _gfFetchNative(method, cb) {
  fetch("/api/method/" + method, { credentials: "same-origin" })
    .then(function (r) { return r.json(); })
    .then(function (d) { cb(d && d.message !== undefined ? d.message : null); })
    .catch(function () { cb(null); });
}
