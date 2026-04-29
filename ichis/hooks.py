app_name = "ichis"
app_title = "ICHIS Theme App"
app_publisher = "GREENFARMS"
app_description = "Tema visual genérico inspirado no Aura para Frappe/ERPNext v16"
app_email = "contato@greenfarms.com.br"
app_license = "mit"

# Carregado no Desk do Frappe/ERPNext.
# Referências sem barra inicial, conforme padrão documentado do Frappe para app_include_js/app_include_css.
app_include_css = [
    "assets/ichis/css/gf_aura_tokens.css",
    "assets/ichis/css/gf_aura_desk_safe.css",
    "assets/ichis/css/gf_home_force.css",
]

app_include_js = [
    "assets/ichis/js/gf_aura_loader.js",
    "assets/ichis/js/gf_home_force.js",
]

# Mantido para compatibilidade com telas web/portal, sem substituir o tema base.
web_include_css = [
    "assets/ichis/css/gf_aura_tokens.css",
    "assets/ichis/css/gf_aura_desk_safe.css",
]

web_include_js = [
    "assets/ichis/js/gf_aura_loader.js",
]
