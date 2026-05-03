app_name        = "ichis_theme_app"
app_title       = "GF Theme App"
app_publisher   = "GREENFARMS"
app_description = "Central de Identidade Visual e UI Overlay — GREENFARMS"
app_email       = "contato@greenfarms.com.br"
app_license     = "mit"
app_version     = "1.0.0"

# ──────────────────────────────────────────────────────────────
# ASSETS
# ──────────────────────────────────────────────────────────────

# Desk (usuário logado)
app_include_css = [
    "/assets/ichis_theme_app/css/gf_theme.css?v=12",
    "/assets/ichis_theme_app/css/gf_overlay.css?v=12",
]

app_include_js = [
    "/assets/ichis_theme_app/js/gf_theme.js?v=12",
    "/assets/ichis_theme_app/js/gf_overlay.js?v=12",
]

# Login (páginas públicas)
web_include_css = [
    "/assets/ichis_theme_app/css/gf_theme.css?v=12",
]

web_include_js = [
    "/assets/ichis_theme_app/js/gf_theme.js?v=12",
]

# ──────────────────────────────────────────────────────────────
# HOME PAGE
# ──────────────────────────────────────────────────────────────
role_home_page = {
    "System User": "gf-modern-desk",
    "Administrator": "gf-modern-desk",
}

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
