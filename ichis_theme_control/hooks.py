app_name = "ichis_theme_control"
app_title = "GF Theme Control"
app_publisher = "GREENFARMS"
app_description = "Central administrativa de identidade visual do ERPNext - GREENFARMS"
app_email = "contato@greenfarms.com.br"
app_license = "mit"
app_version = "1.0.0"

# ==========================================================
# ASSETS GLOBAIS - Carregados no Desk do Frappe/ERPNext
# ==========================================================

# CSS carregado no Desk (usuário logado)
app_include_css = [
    "/assets/ichis_theme_control/css/gf_theme_control.css",
]

# JS carregado no Desk (usuário logado)
app_include_js = [
    "/assets/ichis_theme_control/js/gf_theme_control.js",
]

# CSS carregado em páginas web (inclui login)
web_include_css = [
    "/assets/ichis_theme_control/css/gf_theme_control.css",
]

# JS carregado em páginas web (inclui login)
web_include_js = [
    "/assets/ichis_theme_control/js/gf_theme_control.js",
]

# ==========================================================
# INSTALAÇÃO
# ==========================================================

after_install = "ichis_theme_control.install.after_install"

# ==========================================================
# FIXTURES (exportação do Doctype junto com o app)
# ==========================================================

fixtures = [
    {
        "doctype": "Custom Field",
        "filters": [["module", "=", "Gf Theme Control"]]
    }
]
