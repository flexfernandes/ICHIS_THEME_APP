/**
 * GF Theme Control — gf_theme_control.js
 * GREENFARMS | Central Administrativa de Identidade Visual
 *
 * Este script é carregado globalmente pelo Frappe (Desk e Web/Login).
 *
 * Responsabilidades:
 *  1. Detectar se está no Login ou no Desk
 *  2. Buscar configurações do Doctype GF Theme Settings via API
 *  3. Aplicar variáveis CSS dinamicamente em document.documentElement
 *  4. Substituir logomarcas do ERPNext pelas configuradas no Doctype
 *  5. Usar MutationObserver para garantir substituição em elementos dinâmicos
 *  6. Expor variáveis de diagnóstico no window
 *
 * Diagnóstico (console do navegador):
 *   window.gfThemeVersion      → "GF_THEME_CONTROL_V1"
 *   window.gfThemeControlLoaded → true
 */

// =============================================================
// DIAGNÓSTICO - identificação do script no console
// =============================================================
window.gfThemeVersion = "GF_THEME_CONTROL_V1";

// Evita carregamento duplicado
if (window.gfThemeControlLoaded) {
  console.log("GF Theme Control: já carregado, ignorando duplicata.");
} else {
  window.gfThemeControlLoaded = true;
  console.log("GF Theme Control carregado", window.gfThemeVersion);
  gfThemeInit();
}

// =============================================================
// CONSTANTES
// =============================================================
const GF_FALLBACK_LOGO = "/assets/ichis_theme_app/images/app_underline_logo.png";

/**
 * Padrões de src de logo do ERPNext/Frappe que devem ser substituídos.
 * Qualquer imagem cujo src contenha estas strings será trocada.
 */
const GF_LOGO_PATTERNS = [
  "frappe-framework-logo",
  "erpnext-logo",
  "erpnext_logo",
  "frappe_logo",
  "/assets/frappe/",
  "/assets/erpnext/images/",
  "erpnext/public/images",
  "frappe/public/images",
  "app_logo.png",
];

// =============================================================
// FUNÇÃO PRINCIPAL
// =============================================================
function gfThemeInit() {
  try {
    const isLoginPage = gfIsLoginPage();
    console.log("GF Theme Control: página =", isLoginPage ? "login" : "desk");

    if (isLoginPage) {
      // No login: busca configurações públicas (allow_guest=True)
      gfFetchPublicSettings()
        .then(function (settings) {
          if (!settings || !settings.ativar_tema_gf) return;
          gfApplyLoginTheme(settings);
          if (settings.substituir_logos_erpnext) {
            gfInitLogoReplacement(settings);
          }
        })
        .catch(function (err) {
          console.warn("GF Theme Control: erro ao buscar configurações públicas:", err);
        });
    } else {
      // No Desk: busca configurações completas para usuário logado
      // Aguarda o Frappe estar pronto
      gfWhenFrappeReady(function () {
        gfFetchDeskSettings()
          .then(function (settings) {
            if (!settings || !settings.ativar_tema_gf) return;
            if (settings.aplicar_no_desk) {
              gfApplyDeskTheme(settings);
            }
            if (settings.substituir_logos_erpnext) {
              gfInitLogoReplacement(settings);
            }
          })
          .catch(function (err) {
            console.warn("GF Theme Control: erro ao buscar configurações do desk:", err);
          });
      });
    }
  } catch (err) {
    console.warn("GF Theme Control: erro na inicialização:", err);
  }
}

// =============================================================
// DETECÇÃO DE CONTEXTO
// =============================================================

/**
 * Detecta se a página atual é a tela de login.
 * Verifica pathname, body classes e ausência do Frappe Desk.
 */
function gfIsLoginPage() {
  const path = window.location.pathname || "";
  const bodyClass = document.body ? document.body.className || "" : "";

  if (path.includes("/login") || path === "/" && !document.getElementById("page-desktop")) {
    return true;
  }
  if (bodyClass.includes("login")) {
    return true;
  }
  if (document.querySelector(".login-content, .login-main, .login-page")) {
    return true;
  }
  // Se o Frappe app não está definido ou não tem sidebar, provavelmente é login
  if (typeof frappe === "undefined" || !document.querySelector(".desk-sidebar, .standard-sidebar")) {
    // Mas só considerar login se não houver desk elements
    if (!document.getElementById("page-desktop")) {
      return true;
    }
  }
  return false;
}

/**
 * Aguarda o Frappe estar pronto para uso.
 * O Frappe executa frappe.ready() quando o app termina de carregar.
 */
function gfWhenFrappeReady(callback) {
  if (typeof frappe !== "undefined" && frappe.ready) {
    frappe.ready(callback);
  } else {
    // Fallback: aguardar o DOM estar carregado
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      setTimeout(callback, 300);
    }
  }
}

// =============================================================
// CHAMADAS DE API
// =============================================================

/**
 * Busca configurações públicas para a tela de Login.
 * Usa fetch nativo porque o Frappe JS pode não estar disponível no login.
 */
function gfFetchPublicSettings() {
  return fetch(
    "/api/method/ichis_theme_app.api.theme.get_public_theme_settings",
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
    }
  )
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      return data.message || data;
    });
}

/**
 * Busca configurações completas para o Desk.
 * Usa frappe.call quando disponível, senão usa fetch.
 */
function gfFetchDeskSettings() {
  if (typeof frappe !== "undefined" && frappe.call) {
    return new Promise(function (resolve, reject) {
      frappe.call({
        method: "ichis_theme_app.api.theme.get_theme_settings",
        callback: function (r) {
          if (r && r.message) resolve(r.message);
          else reject(new Error("Resposta vazia do servidor"));
        },
        error: function (err) {
          reject(err);
        },
      });
    });
  } else {
    // Fallback com fetch
    return fetch(
      "/api/method/ichis_theme_app.api.theme.get_theme_settings",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
      }
    )
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        return data.message || data;
      });
  }
}

// =============================================================
// APLICAÇÃO DO TEMA - LOGIN
// =============================================================

/**
 * Aplica o tema na tela de login.
 * Injeta variáveis CSS e estilo específico da página de login.
 */
function gfApplyLoginTheme(settings) {
  try {
    const tema = settings.tema_ativo || "Padrão";

    const corFundo = settings.login_cor_fundo || "#f8fafc";
    const corTexto = settings.login_cor_texto || "#111827";
    const corCard = settings.login_cor_card || "#ffffff";

    // Injeta estilo inline na página de login
    const styleId = "gf-login-theme";
    let el = document.getElementById(styleId);
    if (!el) {
      el = document.createElement("style");
      el.id = styleId;
      document.head.appendChild(el);
    }

    el.textContent = `
      :root {
        --gf-bg-main: ${corFundo};
        --gf-text-main: ${corTexto};
        --gf-card-bg: ${corCard};
      }
      body,
      html,
      .login-content,
      .login-main,
      .page-card {
        background-color: ${corFundo} !important;
        color: ${corTexto} !important;
      }
      .login-card,
      .page-card .card-body,
      .login-content .card {
        background-color: ${corCard} !important;
      }
    `;

    // Aplica imagem de fundo se configurada
    if (settings.login_usar_imagem_fundo && settings.login_imagem_fundo) {
      const bgStyle = document.createElement("style");
      bgStyle.id = "gf-login-bg";
      bgStyle.textContent = `
        body, .login-content, .login-main {
          background-image: url("${settings.login_imagem_fundo}") !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
      `;
      document.head.appendChild(bgStyle);
    }

    console.log("GF Theme Control: tema de login aplicado. Tema:", tema);
  } catch (err) {
    console.warn("GF Theme Control: erro ao aplicar tema de login:", err);
  }
}

// =============================================================
// APLICAÇÃO DO TEMA - DESK
// =============================================================

/**
 * Aplica o tema completo no Desk do ERPNext.
 * Injeta todas as variáveis CSS calculadas conforme o tema ativo.
 */
function gfApplyDeskTheme(settings) {
  try {
    const tema = settings.tema_ativo || "Padrão";
    const p = tema === "Black" ? "black_" : "padrao_";
    const root = document.documentElement;

    /**
     * Aplica uma variável CSS no :root se o valor existir nas configurações.
     */
    function setVar(cssVar, fieldname, fallback) {
      const val = settings[fieldname] || fallback;
      if (val) root.style.setProperty(cssVar, val);
    }

    // === Fundo ===
    setVar("--gf-bg-main",      p + "cor_fundo_principal",    "#f8fafc");
    setVar("--gf-bg-secondary", p + "cor_fundo_secundaria",   "#ffffff");
    setVar("--gf-bg-content",   p + "cor_fundo_conteudo",     "#ffffff");
    setVar("--gf-bg-card",      p + "cor_fundo_cards",        "#ffffff");
    setVar("--gf-bg-navbar",    p + "cor_fundo_navbar",       "#ffffff");
    setVar("--gf-bg-sidebar",   p + "cor_fundo_sidebar",      "#f9fafb");
    setVar("--gf-bg-menu",      p + "cor_fundo_menu",         "#ffffff");
    setVar("--gf-bg-modal",     p + "cor_fundo_modal",        "#ffffff");
    setVar("--gf-bg-dropdown",  p + "cor_fundo_dropdown",     "#ffffff");

    // === Texto ===
    setVar("--gf-text-main",      p + "cor_fonte_principal",  "#111827");
    setVar("--gf-text-secondary", p + "cor_fonte_secundaria", "#6b7280");
    setVar("--gf-text-soft",      p + "cor_fonte_suave",      "#94a3b8");
    setVar("--gf-text-title",     p + "cor_titulo",           "#111827");
    setVar("--gf-text-subtitle",  p + "cor_subtitulo",        "#374151");
    setVar("--gf-text-link",      p + "cor_link",             "#15803d");

    // === Destaque ===
    setVar("--gf-accent",      p + "cor_destaque",        "#16a34a");
    setVar("--gf-accent-dark", p + "cor_destaque_escura", "#166534");
    setVar("--gf-border",      p + "cor_borda",           "#e5e7eb");
    setVar("--gf-shadow",      p + "cor_sombra",          "rgba(15, 23, 42, 0.08)");
    setVar("--gf-hover",       p + "cor_hover",           "#dcfce7");
    setVar("--gf-selection",   p + "cor_selecao",         "#bbf7d0");

    // === Estado ===
    setVar("--gf-success", p + "cor_sucesso", "#16a34a");
    setVar("--gf-warning", p + "cor_alerta",  "#f59e0b");
    setVar("--gf-error",   p + "cor_erro",    "#dc2626");
    setVar("--gf-info",    p + "cor_info",    "#2563eb");

    // === Fontes ===
    setVar("--gf-font-main",     p + "fonte_principal",        'Inter, "Segoe UI", Arial, sans-serif');
    setVar("--gf-font-title",    p + "fonte_titulos",          'Inter, "Segoe UI", Arial, sans-serif');
    setVar("--gf-font-subtitle", p + "fonte_subtitulos",       'Inter, "Segoe UI", Arial, sans-serif');
    setVar("--gf-font-heading",  p + "fonte_cabecalhos",       'Inter, "Segoe UI", Arial, sans-serif');
    setVar("--gf-font-table",    p + "fonte_tabelas",          'Inter, "Segoe UI", Arial, sans-serif');
    setVar("--gf-font-button",   p + "fonte_botoes",           'Inter, "Segoe UI", Arial, sans-serif');
    setVar("--gf-font-field",    p + "fonte_campos",           'Inter, "Segoe UI", Arial, sans-serif');
    setVar("--gf-font-menu",     p + "fonte_menus",            'Inter, "Segoe UI", Arial, sans-serif');
    setVar("--gf-font-aux",      p + "fonte_textos_auxiliares",'Inter, "Segoe UI", Arial, sans-serif');
    setVar("--gf-font-number",   p + "fonte_numeros",          '"Roboto Mono", Consolas, monospace');

    // === Tamanhos ===
    setVar("--gf-fs-base",     p + "tamanho_fonte_base",              "13px");
    setVar("--gf-fs-title",    p + "tamanho_fonte_titulo",            "18px");
    setVar("--gf-fs-subtitle", p + "tamanho_fonte_subtitulo",         "14px");
    setVar("--gf-fs-menu",     p + "tamanho_fonte_menu",              "13px");
    setVar("--gf-fs-button",   p + "tamanho_fonte_botao",             "13px");
    setVar("--gf-fs-field",    p + "tamanho_fonte_campo",             "13px");
    setVar("--gf-fs-table",    p + "tamanho_fonte_tabela",            "12px");
    setVar("--gf-fs-th",       p + "tamanho_fonte_tabela_cabecalho",  "11px");

    // === Pesos ===
    setVar("--gf-fw-regular",  p + "peso_fonte_regular",  "400");
    setVar("--gf-fw-medium",   p + "peso_fonte_medio",    "500");
    setVar("--gf-fw-semibold", p + "peso_fonte_semibold", "600");
    setVar("--gf-fw-bold",     p + "peso_fonte_bold",     "700");

    // === Grid ===
    setVar("--gf-grid-row-h",    p + "grid_altura_linha",             "34px");
    setVar("--gf-grid-head-h",   p + "grid_altura_cabecalho",         "38px");
    setVar("--gf-grid-col-min",  p + "grid_largura_minima_coluna",    "120px");
    setVar("--gf-grid-px",       p + "grid_padding_horizontal",       "10px");
    setVar("--gf-grid-py",       p + "grid_padding_vertical",         "6px");
    setVar("--gf-grid-radius",   p + "grid_raio_borda",               "10px");
    setVar("--gf-grid-bg-head",  p + "grid_cor_fundo_cabecalho",      "#f3f4f6");
    setVar("--gf-grid-bg-row",   p + "grid_cor_fundo_linha",          "#ffffff");
    setVar("--gf-grid-bg-alt",   p + "grid_cor_fundo_linha_alternada","#f9fafb");
    setVar("--gf-grid-bg-hover", p + "grid_cor_fundo_hover",          "#ecfdf5");
    setVar("--gf-grid-text-row", p + "grid_cor_fonte_linha",          "#111827");
    setVar("--gf-grid-text-head",p + "grid_cor_fonte_cabecalho",      "#374151");
    setVar("--gf-grid-border",   p + "grid_cor_borda",                "#e5e7eb");
    setVar("--gf-grid-select",   p + "grid_cor_selecao",              "#bbf7d0");
    setVar("--gf-grid-fs-row",   p + "grid_tamanho_fonte_linha",      "12px");
    setVar("--gf-grid-fs-head",  p + "grid_tamanho_fonte_cabecalho",  "11px");
    setVar("--gf-grid-fw-head",  p + "grid_peso_fonte_cabecalho",     "600");

    // === Botões ===
    setVar("--gf-btn-bg",       p + "botao_primario_fundo",    "#16a34a");
    setVar("--gf-btn-text",     p + "botao_primario_texto",    "#ffffff");
    setVar("--gf-btn-sec-bg",   p + "botao_secundario_fundo",  "#f3f4f6");
    setVar("--gf-btn-sec-text", p + "botao_secundario_texto",  "#374151");
    setVar("--gf-btn-hover",    p + "botao_hover_fundo",       "#166534");
    setVar("--gf-btn-radius",   p + "botao_raio_borda",        "6px");
    setVar("--gf-btn-h",        p + "botao_altura",            "32px");
    setVar("--gf-btn-px",       p + "botao_padding_horizontal","14px");
    setVar("--gf-btn-fw",       p + "botao_peso_fonte",        "500");

    // === Campos ===
    setVar("--gf-field-bg",     p + "campo_fundo",           "#ffffff");
    setVar("--gf-field-text",   p + "campo_texto",           "#111827");
    setVar("--gf-field-ph",     p + "campo_placeholder",     "#9ca3af");
    setVar("--gf-field-border", p + "campo_borda",           "#d1d5db");
    setVar("--gf-field-focus",  p + "campo_borda_foco",      "#16a34a");
    setVar("--gf-field-h",      p + "campo_altura",          "30px");
    setVar("--gf-field-p",      p + "campo_padding",         "6px 10px");
    setVar("--gf-field-fs",     p + "campo_tamanho_fonte",   "13px");
    setVar("--gf-field-radius", p + "campo_raio_borda",      "6px");

    // === Cards ===
    setVar("--gf-card-bg",     p + "card_fundo",     "#ffffff");
    setVar("--gf-card-border", p + "card_borda",     "#e5e7eb");
    setVar("--gf-card-shadow", p + "card_sombra",    "0 1px 4px rgba(15,23,42,0.08)");
    setVar("--gf-card-radius", p + "card_raio_borda","10px");
    setVar("--gf-card-p",      p + "card_padding",   "16px");
    setVar("--gf-card-title",  p + "card_titulo",    "#111827");
    setVar("--gf-card-text",   p + "card_texto",     "#6b7280");

    console.log("GF Theme Control: variáveis CSS aplicadas para tema:", tema);

  } catch (err) {
    console.warn("GF Theme Control: erro ao aplicar variáveis CSS:", err);
  }
}

// =============================================================
// SUBSTITUIÇÃO DE LOGOMARCAS
// =============================================================

/**
 * Inicia a substituição de logomarcas do ERPNext pelas configuradas.
 * Usa MutationObserver para detectar novos elementos carregados dinamicamente.
 */
function gfInitLogoReplacement(settings) {
  try {
    const logoUrl = gfResolveLogoUrl(settings);

    // Substituição imediata
    gfReplaceLogos(logoUrl, settings);

    // Substituição contínua com MutationObserver
    const observer = new MutationObserver(function (mutations) {
      let shouldReplace = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          shouldReplace = true;
          break;
        }
      }
      if (shouldReplace) {
        gfReplaceLogos(logoUrl, settings);
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });

    // Substituição adicional após carregamento completo da página
    if (document.readyState !== "complete") {
      window.addEventListener("load", function () {
        gfReplaceLogos(logoUrl, settings);
      });
    }

    console.log("GF Theme Control: substituição de logos iniciada. URL:", logoUrl);

  } catch (err) {
    console.warn("GF Theme Control: erro na substituição de logos:", err);
  }
}

/**
 * Determina qual URL de logo usar conforme o contexto.
 */
function gfResolveLogoUrl(settings) {
  const isLogin = gfIsLoginPage();
  if (isLogin) {
    return settings.logo_login || settings.logo_global || GF_FALLBACK_LOGO;
  }
  return settings.logo_navbar || settings.logo_global || GF_FALLBACK_LOGO;
}

/**
 * Substitui todas as imagens de logo detectadas no DOM.
 * Também trata elementos de texto que exibem o nome do sistema.
 */
function gfReplaceLogos(logoUrl, settings) {
  try {
    // 1. Substitui imagens cujo src corresponda a padrões do ERPNext/Frappe
    const images = document.querySelectorAll("img");
    images.forEach(function (img) {
      const src = img.getAttribute("src") || "";
      const dataSrc = img.getAttribute("data-src") || "";

      const isErpnextLogo = GF_LOGO_PATTERNS.some(function (pattern) {
        return src.includes(pattern) || dataSrc.includes(pattern);
      });

      if (isErpnextLogo && src !== logoUrl) {
        img.setAttribute("src", logoUrl);
        img.removeAttribute("data-src");
        img.style.objectFit = "contain";
      }
    });

    // 2. Substitui logo na navbar/sidebar (class navbar-brand img, .app-logo img, etc.)
    const logoSelectors = [
      ".navbar-brand img",
      ".app-logo img",
      ".app-logo",
      ".navbar-header img",
      ".sidebar-logo img",
      ".website-logo img",
      '[class*="logo"] img',
    ];

    logoSelectors.forEach(function (selector) {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(function (el) {
          if (el.tagName === "IMG") {
            const currentSrc = el.getAttribute("src") || "";
            if (currentSrc !== logoUrl && !currentSrc.includes("ichis_theme_app")) {
              el.setAttribute("src", logoUrl);
              el.style.objectFit = "contain";
            }
          }
        });
      } catch (e) {
        // Ignora erros de seletor inválido
      }
    });

    // 3. Atualiza texto do sistema se configurado
    const textoSistema = settings && settings.texto_sistema;
    if (textoSistema) {
      const brandTexts = document.querySelectorAll(
        ".navbar-brand span, .app-name, .system-name, .brand-name"
      );
      brandTexts.forEach(function (el) {
        const currentText = el.textContent || "";
        if (
          currentText.includes("ERPNext") ||
          currentText.includes("Frappe") ||
          currentText.includes("frappe")
        ) {
          el.textContent = textoSistema;
        }
      });
    }

    // 4. Atualiza favicon se configurado
    gfUpdateFavicon(settings);

  } catch (err) {
    // Falhas silenciosas para não quebrar o ERPNext
    console.warn("GF Theme Control: erro ao substituir logos:", err);
  }
}

/**
 * Atualiza o favicon do navegador se configurado.
 */
function gfUpdateFavicon(settings) {
  try {
    const faviconUrl = settings && settings.favicon_customizado;
    if (!faviconUrl) return;

    let favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.href = faviconUrl;
  } catch (e) {
    // Silencioso
  }
}
