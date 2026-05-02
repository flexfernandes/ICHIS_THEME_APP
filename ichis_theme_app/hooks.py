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

app_include_css = [
    "/assets/ichis_theme_app/css/gf_theme.css?v=7",
]

app_include_js = [
    "/assets/ichis_theme_app/js/gf_theme_v3.js?v=7",
]

web_include_css = [
    "/assets/ichis_theme_app/css/gf_theme.css?v=7",
]

web_include_js = [
    "/assets/ichis_theme_app/js/gf_theme_v3.js?v=7",
]

# ──────────────────────────────────────────────────────────────
# HOME PAGE — redireciona todos os usuários para o Modern Desk
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


