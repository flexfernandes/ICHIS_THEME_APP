# -*- coding: utf-8 -*-
"""
Hooks do app ICHIS.

Este arquivo é lido pelo Frappe Framework durante o carregamento do sistema.
Aqui registramos os arquivos globais de CSS e JavaScript que serão aplicados no Desk.

Princípio de segurança:
- não alterar core do ERPNext;
- não substituir arquivos nativos;
- aplicar apenas uma camada visual por cima da interface existente.
"""

app_name = "ichis"
app_title = "ICHIS"
app_publisher = "GREEN FARMS"
app_description = "Camada visual moderna e Home principal customizada para ERPNext."
app_email = ""
app_license = "MIT"

# -----------------------------------------------------------------------------
# CSS GLOBAL
# -----------------------------------------------------------------------------
# Carrega a identidade visual global do ICHIS no Desk do ERPNext.
# Este arquivo trata cores, fontes, fundos, botões, formulários, grids e a Home.
app_include_css = "/assets/ichis/css/gf_theme.css"

# -----------------------------------------------------------------------------
# JAVASCRIPT GLOBAL
# -----------------------------------------------------------------------------
# Carrega o controlador visual do ICHIS.
# Este arquivo detecta a rota do Workspace inicial e renderiza a nova Home.
app_include_js = "/assets/ichis/js/gf_global.js"
