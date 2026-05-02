/**
 * GF Theme — gf_theme.js v2.0
 * GREENFARMS | ichis_theme_app
 *
 * ARQUITETURA:
 *   1. Ao carregar: busca GF Theme Settings via API
 *   2. Se ativar_tema_gf=1 E aplicar_no_desk=1:
 *      - Adiciona .gf-theme-active no body (ativa os estilos do CSS)
 *      - Injeta variáveis --gf-* no :root com os valores do Doctype
 *   3. Se ativar_tema_gf=0 ou aplicar_no_desk=0:
 *      - Remove .gf-theme-active (ERPNext fica com visual 100% nativo)
 *   4. Substitui logos quando substituir_logos_erpnext=1
 *   5. Escuta salvamento do Doctype para atualizar em tempo real
 *
 * Por padrão: NENHUM estilo é aplicado. O body não tem .gf-theme-active.
 *
 * Diagnóstico:
 *   window.gfThemeVersion       → "GF_THEME_V2"
 *   window.gfThemeControlLoaded → true
 *   window.gfThemeActive        → true/false
 */

window.gfThemeVersion       = "GF_THEME_V2";
window.gfThemeControlLoaded = true;
window.gfThemeActive        = false;

// Fallback logo
var GF_FALLBACK_LOGO = "/assets/ichis_theme_app/images/app_underline_logo.png";

// Padrões de src de logo do ERPNext/Frappe
var GF_LOGO_PATTERNS = [
  "frappe-framework-logo", "erpnext-logo", "erpnext_logo", "frappe_logo",
  "/assets/frappe/", "/assets/erpnext/images/", "app_logo.png",
];

console.log("[GF Theme] v2 carregado.");

// ── Início ────────────────────────────────────────────────────
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _gfThemeInit);
} else {
  _gfThemeInit();
}

function _gfThemeInit() {
  var isLogin = _gfIsLogin();

  if (isLogin) {
    _gfApplyLogin();
    return;
  }

  // No Desk: espera o Frappe estar pronto
  if (typeof frappe !== "undefined" && frappe.ready) {
    frappe.ready(_gfApplyDesk);
  } else {
    setTimeout(_gfApplyDesk, 400);
  }
}

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════
function _gfApplyLogin() {
  _gfFetch("ichis_theme_app.api.theme.get_public_theme_settings", function (s) {
    if (!s || !s.ativar_tema_gf || !s.aplicar_no_login) return;

    // Aplicar cores de login
    var r = document.documentElement;
    if (s.login_cor_fundo) r.style.setProperty("--gf-bg-main", s.login_cor_fundo);
    if (s.login_cor_texto) r.style.setProperty("--gf-text-main", s.login_cor_texto);
    if (s.login_cor_card)  r.style.setProperty("--gf-bg-card", s.login_cor_card);

    document.body.classList.add("gf-login-active");

    // Imagem de fundo
    if (s.login_usar_imagem_fundo && s.login_imagem_fundo) {
      document.body.style.backgroundImage = "url('" + s.login_imagem_fundo + "')";
      document.body.style.backgroundSize  = "cover";
      document.body.style.backgroundPosition = "center";
    }

    // Logo
    if (s.substituir_logos_erpnext) {
      var logoUrl = s.logo_login || s.fallback_logo || GF_FALLBACK_LOGO;
      _gfReplaceLogos(logoUrl, s);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// DESK
// ═══════════════════════════════════════════════════════════════
function _gfApplyDesk() {
  _gfFetch("ichis_theme_app.api.theme.get_theme_settings", function (s) {
    if (!s) {
      console.log("[GF Theme] Configurações não encontradas — tema desativado.");
      _gfDeactivate();
      return;
    }

    if (!s.ativar_tema_gf || !s.aplicar_no_desk) {
      console.log("[GF Theme] Tema desativado nas configurações.");
      _gfDeactivate();

      // Logos podem ser substituídos mesmo sem o tema ativo
      if (s.substituir_logos_erpnext) {
        var logo = s.logo_navbar || s.logo_global || GF_FALLBACK_LOGO;
        _gfReplaceLogos(logo, s);
        _gfObserveLogos(logo, s);
      }
      return;
    }

    // Tema ativo: aplica variáveis CSS e ativa a classe
    _gfApplyVars(s);
    _gfActivate();

    // Logos
    if (s.substituir_logos_erpnext) {
      var logo = s.logo_navbar || s.logo_global || GF_FALLBACK_LOGO;
      _gfReplaceLogos(logo, s);
      _gfObserveLogos(logo, s);
    }

    // Favicon
    if (s.favicon_customizado) _gfSetFavicon(s.favicon_customizado);

    // Escuta atualização em tempo real quando o Doctype é salvo
    _gfListenDocSave();

    console.log("[GF Theme] Tema ativo:", s.tema_ativo);
  });
}

// ── Ativar / Desativar ────────────────────────────────────────
function _gfActivate() {
  document.body.classList.add("gf-theme-active");
  // Aplica tema (Black ou Padrão) como data attribute para override de dark
  var tema = document.documentElement.style.getPropertyValue("--gf-tema-ativo") || "Padrão";
  document.body.setAttribute("data-gf-tema", tema);
  window.gfThemeActive = true;
  console.log("[GF Theme] .gf-theme-active adicionado ao body.");
}

function _gfDeactivate() {
  document.body.classList.remove("gf-theme-active");
  document.body.removeAttribute("data-gf-tema");
  window.gfThemeActive = false;
}

// ── Aplicar variáveis CSS no :root ────────────────────────────
function _gfApplyVars(s) {
  var tema = s.tema_ativo || "Padrão";
  var p    = tema === "Black" ? "black_" : "padrao_";
  var r    = document.documentElement;

  // Registra o tema ativo para uso pelo overlay
  r.style.setProperty("--gf-tema-ativo", tema);
  document.body.setAttribute("data-gf-tema", tema);

  function set(cssVar, field, fallback) {
    var val = s[p + field] || s[field] || fallback;
    if (val) r.style.setProperty(cssVar, val);
  }

  // Fundo
  set("--gf-bg-main",        "cor_fundo_principal",   "#f8fafc");
  set("--gf-bg-secondary",   "cor_fundo_secundaria",  "#ffffff");
  set("--gf-bg-content",     "cor_fundo_conteudo",    "#ffffff");
  set("--gf-bg-card",        "cor_fundo_cards",       "#ffffff");
  set("--gf-bg-navbar",      "cor_fundo_navbar",      "#ffffff");
  set("--gf-bg-sidebar",     "cor_fundo_sidebar",     "#f9fafb");
  set("--gf-bg-menu",        "cor_fundo_menu",        "#ffffff");
  set("--gf-bg-modal",       "cor_fundo_modal",       "#ffffff");
  set("--gf-bg-dropdown",    "cor_fundo_dropdown",    "#ffffff");

  // Texto
  set("--gf-text-main",      "cor_fonte_principal",   "#111827");
  set("--gf-text-secondary", "cor_fonte_secundaria",  "#6b7280");
  set("--gf-text-soft",      "cor_fonte_suave",       "#94a3b8");
  set("--gf-text-title",     "cor_titulo",            "#111827");
  set("--gf-text-subtitle",  "cor_subtitulo",         "#374151");
  set("--gf-text-link",      "cor_link",              "#15803d");

  // Destaque
  set("--gf-accent",         "cor_destaque",          "#16a34a");
  set("--gf-accent-dark",    "cor_destaque_escura",   "#166534");
  set("--gf-border",         "cor_borda",             "#e5e7eb");
  set("--gf-shadow",         "cor_sombra",            "rgba(15,23,42,0.08)");
  set("--gf-hover",          "cor_hover",             "#dcfce7");
  set("--gf-selection",      "cor_selecao",           "#bbf7d0");

  // Estado
  set("--gf-success",        "cor_sucesso",           "#16a34a");
  set("--gf-warning",        "cor_alerta",            "#f59e0b");
  set("--gf-error",          "cor_erro",              "#dc2626");
  set("--gf-info",           "cor_info",              "#2563eb");

  // Fontes
  set("--gf-font-main",      "fonte_principal",       'Inter,"Segoe UI",Arial,sans-serif');
  set("--gf-font-title",     "fonte_titulos",         'Inter,"Segoe UI",Arial,sans-serif');
  set("--gf-font-number",    "fonte_numeros",         '"Roboto Mono",Consolas,monospace');

  // Tamanhos de fonte
  set("--gf-fs-base",        "tamanho_fonte_base",    "13px");
  set("--gf-fs-title",       "tamanho_fonte_titulo",  "18px");
  set("--gf-fs-subtitle",    "tamanho_fonte_subtitulo","14px");
  set("--gf-fs-menu",        "tamanho_fonte_menu",    "13px");
  set("--gf-fs-table",       "tamanho_fonte_tabela",  "12px");

  // Pesos
  set("--gf-fw-regular",     "peso_fonte_regular",    "400");
  set("--gf-fw-medium",      "peso_fonte_medio",      "500");
  set("--gf-fw-semibold",    "peso_fonte_semibold",   "600");
  set("--gf-fw-bold",        "peso_fonte_bold",       "700");

  // Botões
  set("--gf-btn-bg",         "botao_primario_fundo",  "#16a34a");
  set("--gf-btn-text",       "botao_primario_texto",  "#ffffff");
  set("--gf-btn-hover",      "botao_hover_fundo",     "#166534");
  set("--gf-btn-radius",     "botao_raio_borda",      "6px");
  set("--gf-btn-h",          "botao_altura",          "32px");
  set("--gf-btn-px",         "botao_padding_horizontal","14px");
  set("--gf-btn-fw",         "botao_peso_fonte",      "500");

  // Campos
  set("--gf-field-bg",       "campo_fundo",           "#ffffff");
  set("--gf-field-text",     "campo_texto",           "#111827");
  set("--gf-field-ph",       "campo_placeholder",     "#9ca3af");
  set("--gf-field-border",   "campo_borda",           "#d1d5db");
  set("--gf-field-focus",    "campo_borda_foco",      "#16a34a");
  set("--gf-field-h",        "campo_altura",          "30px");
  set("--gf-field-p",        "campo_padding",         "6px 10px");
  set("--gf-field-fs",       "campo_tamanho_fonte",   "13px");
  set("--gf-field-radius",   "campo_raio_borda",      "6px");

  // Cards
  set("--gf-card-bg",        "card_fundo",            "#ffffff");
  set("--gf-card-border",    "card_borda",            "#e5e7eb");
  set("--gf-card-shadow",    "card_sombra",           "0 1px 4px rgba(15,23,42,0.08)");
  set("--gf-card-radius",    "card_raio_borda",       "10px");

  // Grid
  set("--gf-grid-bg-head",   "grid_cor_fundo_cabecalho",        "#f3f4f6");
  set("--gf-grid-bg-row",    "grid_cor_fundo_linha",            "#ffffff");
  set("--gf-grid-bg-alt",    "grid_cor_fundo_linha_alternada",  "#f9fafb");
  set("--gf-grid-bg-hover",  "grid_cor_fundo_hover",            "#ecfdf5");
  set("--gf-grid-text-row",  "grid_cor_fonte_linha",            "#111827");
  set("--gf-grid-text-head", "grid_cor_fonte_cabecalho",        "#374151");
  set("--gf-grid-border",    "grid_cor_borda",                  "#e5e7eb");
  set("--gf-grid-select",    "grid_cor_selecao",                "#bbf7d0");
  set("--gf-grid-row-h",     "grid_altura_linha",               "34px");
  set("--gf-grid-head-h",    "grid_altura_cabecalho",           "38px");
  set("--gf-grid-fs-row",    "grid_tamanho_fonte_linha",        "12px");
  set("--gf-grid-fs-head",   "grid_tamanho_fonte_cabecalho",    "11px");
  set("--gf-grid-fw-head",   "grid_peso_fonte_cabecalho",       "600");
  set("--gf-grid-px",        "grid_padding_horizontal",         "10px");
  set("--gf-grid-py",        "grid_padding_vertical",           "6px");
  set("--gf-grid-radius",    "grid_raio_borda",                 "10px");
}

// ═══════════════════════════════════════════════════════════════
// ATUALIZAÇÃO EM TEMPO REAL
// ═══════════════════════════════════════════════════════════════
function _gfListenDocSave() {
  try {
    if (typeof frappe === "undefined") return;
    // Escuta evento de save em qualquer Doctype
    $(document).on("save", function (e, doc) {
      if (doc && doc.doctype === "GF Theme Settings") {
        console.log("[GF Theme] GF Theme Settings salvo — reaplicando tema...");
        setTimeout(_gfApplyDesk, 300);
      }
    });

    // Frappe v15+ usa frappe.socketio / frappe.realtime
    if (frappe.realtime && frappe.realtime.on) {
      frappe.realtime.on("doc_update", function (data) {
        if (data && data.doctype === "GF Theme Settings") {
          console.log("[GF Theme] Atualização recebida via realtime — reaplicando...");
          setTimeout(_gfApplyDesk, 300);
        }
      });
    }
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════
// SUBSTITUIÇÃO DE LOGOS
// ═══════════════════════════════════════════════════════════════
function _gfReplaceLogos(logoUrl, settings) {
  if (!logoUrl) return;
  try {
    // Imagens que correspondem a padrões do ERPNext
    var imgs = document.querySelectorAll("img");
    imgs.forEach(function (img) {
      var src = img.getAttribute("src") || "";
      var isErp = GF_LOGO_PATTERNS.some(function (p) { return src.indexOf(p) !== -1; });
      if (isErp && src !== logoUrl) {
        img.setAttribute("src", logoUrl);
        img.style.objectFit = "contain";
      }
    });

    // Navbar brand / app-logo
    var selectors = [".navbar-brand img", ".app-logo img", ".sidebar-logo img"];
    selectors.forEach(function (sel) {
      var els = document.querySelectorAll(sel);
      els.forEach(function (el) {
        if (el.tagName === "IMG" && el.getAttribute("src") !== logoUrl) {
          el.setAttribute("src", logoUrl);
          el.style.objectFit = "contain";
        }
      });
    });

    // Texto do sistema
    if (settings && settings.texto_sistema) {
      var brandTexts = document.querySelectorAll(".navbar-brand span, .app-name, .system-name");
      brandTexts.forEach(function (el) {
        var t = el.textContent || "";
        if (t.indexOf("ERPNext") !== -1 || t.indexOf("Frappe") !== -1) {
          el.textContent = settings.texto_sistema;
        }
      });
    }
  } catch (e) {
    console.warn("[GF Theme] Erro ao substituir logos:", e);
  }
}

function _gfObserveLogos(logoUrl, settings) {
  try {
    var observer = new MutationObserver(function (muts) {
      var hasNew = muts.some(function (m) { return m.addedNodes && m.addedNodes.length > 0; });
      if (hasNew) _gfReplaceLogos(logoUrl, settings);
    });
    observer.observe(document.body || document.documentElement, {
      childList: true, subtree: true,
    });
  } catch (e) {}
}

function _gfSetFavicon(url) {
  try {
    var link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════
function _gfIsLogin() {
  var path = window.location.pathname || "";
  if (path.indexOf("/login") !== -1) return true;
  if (document.querySelector(".login-content, .login-main")) return true;
  if (typeof frappe === "undefined" && !document.getElementById("page-desktop")) return true;
  return false;
}

function _gfFetch(method, cb) {
  try {
    if (typeof frappe !== "undefined" && frappe.call) {
      frappe.call({
        method:   method,
        callback: function (r) { cb(r && r.message !== undefined ? r.message : null); },
        error:    function ()  { cb(null); },
      });
    } else {
      fetch("/api/method/" + method, { credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .then(function (d) { cb(d && d.message !== undefined ? d.message : null); })
        .catch(function ()  { cb(null); });
    }
  } catch (e) { cb(null); }
}
