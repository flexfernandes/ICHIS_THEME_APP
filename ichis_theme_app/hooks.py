app_name        = "ichis_theme_app"
app_title       = "GF Theme App"
app_publisher   = "GREENFARMS"
app_description = "Central de Identidade Visual — GREENFARMS"
app_email       = "contato@greenfarms.com.br"
app_license     = "mit"
app_version     = "1.0.0"

# ──────────────────────────────────────────────────────────────
# ASSETS — Desk (usuário logado)
# Ordem: tema primeiro, depois desk_modern
# ──────────────────────────────────────────────────────────────
app_include_css = [
    "/assets/ichis_theme_app/css/gf_theme.css?v=25",
    "/assets/ichis_theme_app/desk_modern/desk_modern.css?v=25",
]

app_include_js = [
    "/assets/ichis_theme_app/js/gf_theme.js?v=25",
    "/assets/ichis_theme_app/desk_modern/desk_modern.js?v=25",
]

# Login (páginas públicas — só tema)
web_include_css = [
    "/assets/ichis_theme_app/css/gf_theme.css?v=25",
]

web_include_js = [
    "/assets/ichis_theme_app/js/gf_theme.js?v=25",
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
]
