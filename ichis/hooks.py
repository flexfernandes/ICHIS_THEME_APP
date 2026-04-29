app_name = "ichis"
app_title = "ICHIS Theme App"
app_publisher = "GREENFARMS"
app_description = "Tema visual genérico inspirado no Aura para Frappe/ERPNext v16"
app_email = "contato@greenfarms.com.br"
app_license = "mit"
app_version = "0.0.2"

# Carregado no Desk do Frappe/ERPNext.
# Mantém o tema base e adiciona a GF Home em duas formas:
# 1) bundle oficial do Frappe para produção
# 2) fallback direto via /assets/ichis para ambientes onde o bundle não for resolvido imediatamente
app_include_css = [
    "/assets/ichis/css/gf_aura_tokens.css",
    "/assets/ichis/css/gf_aura_desk_safe.css",
    "/assets/ichis/css/gf_home_overlay.css",
]

app_include_js = [
    "ichis_gf_home.bundle.js",
    "/assets/ichis/js/gf_aura_loader.js",
    "/assets/ichis/js/gf_home_boot.js",
]

# Compatibilidade adicional para Portal/Web. Não substitui o Desk,
# apenas garante disponibilidade se alguma rota pública chamar os ativos.
web_include_css = [
    "/assets/ichis/css/gf_aura_tokens.css",
    "/assets/ichis/css/gf_aura_desk_safe.css",
    "/assets/ichis/css/gf_home_overlay.css",
]

web_include_js = [
    "/assets/ichis/js/gf_aura_loader.js",
    "/assets/ichis/js/gf_home_boot.js",
]

# Registra/garante a Page standard gf-home após migrate/update.
after_migrate = "ichis.install.after_migrate"

# Quando a Page gf-home existir, este arquivo reforça o render no padrão Desk Page.
page_js = {
    "gf-home": "ichis/ichis_theme_app/page/gf_home/gf_home.js"
}
