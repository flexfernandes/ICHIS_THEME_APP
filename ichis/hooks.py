app_name = "ichis"
app_title = "ICHIS Theme App"
app_publisher = "GREENFARMS"
app_description = "Tema visual genérico inspirado no Aura para Frappe/ERPNext v16"
app_email = "contato@greenfarms.com.br"
app_license = "mit"

# Carregado no Desk do Frappe/ERPNext
app_include_css = [
    "/assets/ichis/css/gf_aura_tokens.css",
    "/assets/ichis/css/gf_aura_desk_safe.css",
    "/assets/ichis/css/gf_home.css",
]

app_include_js = [
    "/assets/ichis/js/gf_aura_loader.js",
    "/assets/ichis/js/gf_home.js",
]

# Compatibilidade adicional para Desk/Web em versões novas do Frappe.
# Mantém os includes originais e reforça o carregamento dos mesmos arquivos.
web_include_css = [
    "/assets/ichis/css/gf_aura_tokens.css",
    "/assets/ichis/css/gf_aura_desk_safe.css",
    "/assets/ichis/css/gf_home.css",
]

web_include_js = [
    "/assets/ichis/js/gf_aura_loader.js",
    "/assets/ichis/js/gf_home.js",
]
