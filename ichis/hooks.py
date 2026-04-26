# -*- coding: utf-8 -*-
# =============================================================================
# ICHIS / GREEN FARMS - HOOKS DO APP
# =============================================================================
#
# Este arquivo é lido pelo Frappe Framework durante o carregamento do sistema.
# Aqui registramos os arquivos globais de CSS e JavaScript do app.
#
# Princípios adotados:
# - não alterar o core do ERPNext;
# - não substituir arquivos nativos;
# - aplicar apenas uma camada visual por cima da interface existente;
# - manter a barra superior padrão do ERPNext preservada;
# - permitir evolução futura do tema e da Home principal.
#
# =============================================================================

app_name = "ichis"
app_title = "ICHIS"
app_publisher = "GREEN FARMS"
app_description = "Camada visual moderna e Home principal customizada para ERPNext."
app_email = "flexfernandes@gmail.com"
app_license = "MIT"

# -----------------------------------------------------------------------------
# ARQUIVOS GLOBAIS DO DESK
# -----------------------------------------------------------------------------
# Estes arquivos serão carregados no Desk do ERPNext.
# O CSS aplica o tema global e o visual da Home.
# O JS controla a renderização da Home principal customizada.
# -----------------------------------------------------------------------------

app_include_css = "/assets/ichis/css/gf_theme.css"
app_include_js = "/assets/ichis/js/gf_global.js"
