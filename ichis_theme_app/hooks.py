app_name        = "ichis_theme_app"
app_title       = "GF Theme App"
app_publisher   = "GREENFARMS"
app_description = "Central de Identidade Visual e UI Overlay — GREENFARMS"
app_email       = "contato@greenfarms.com.br"
app_license     = "mit"
app_version     = "1.0.0"

# ──────────────────────────────────────────────────────────────
# ASSETS — ordem de carregamento é importante:
#   1. gf_theme.css    → variáveis CSS globais (--gf-*)
#   2. gf_overlay.css  → layout do Modern Desk (consome --gf-*)
#   3. gf_theme_v3.js     → aplica variáveis no :root via API
#   4. gf_overlay_v2.js   → intercepta rota e renderiza overlay
# ──────────────────────────────────────────────────────────────

app_include_css = [
    "/assets/ichis_theme_app/css/gf_theme.css",
    "/assets/ichis_theme_app/css/gf_overlay.css",
]

app_include_js = [
    "/assets/ichis_theme_app/js/gf_theme_v3.js",
    "/assets/ichis_theme_app/js/gf_overlay_v2.js",
]

# Login: apenas tema (sem overlay, que é só no Desk)
web_include_css = [
    "/assets/ichis_theme_app/css/gf_theme.css",
]

web_include_js = [
    "/assets/ichis_theme_app/js/gf_theme_v3.js",
]

# ──────────────────────────────────────────────────────────────
# INSTALAÇÃO
# ──────────────────────────────────────────────────────────────
after_install = "ichis_theme_app.install.after_install"

# ──────────────────────────────────────────────────────────────
# FIXTURES
# ──────────────────────────────────────────────────────────────
fixtures = [
    {"doctype": "Custom Field", "filters": [["module", "=", "Gf Theme Control"]]},
    {"doctype": "Custom Field", "filters": [["module", "=", "Gf Ui Overlay"]]},
]

app_include_js = [
    "/assets/ichis_theme_app/js/gf_theme_v3.js?v=5",
    "/assets/ichis_theme_app/js/gf_overlay_v2.js?v=5",
]

web_include_js = [
    "/assets/ichis_theme_app/js/gf_theme_v3.js?v=5",
]
