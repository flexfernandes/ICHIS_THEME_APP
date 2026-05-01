# Copyright (c) 2024, GREENFARMS and contributors
# For license information, please see license.txt

"""
API do GF Theme Control.

Expõe endpoints para que o JavaScript possa buscar as configurações
de tema do Doctype GF Theme Settings.

Métodos disponíveis:
  - get_public_theme_settings: acessível sem login (allow_guest=True)
  - get_theme_settings:        acessível apenas para usuários logados
  - get_css_variables:         retorna string CSS com variáveis calculadas
"""

import frappe

# Imagem padrão de fallback do app
FALLBACK_LOGO = "/assets/ichis_theme_control/images/app_underline_logo.png"


def _safe_get(fieldname, fallback=""):
    """Lê um campo do Single Doctype com segurança, retornando fallback se vazio."""
    try:
        val = frappe.db.get_single_value("GF Theme Settings", fieldname)
        return val if val else fallback
    except Exception:
        return fallback


@frappe.whitelist(allow_guest=True)
def get_public_theme_settings():
    """
    Retorna configurações públicas necessárias para a tela de Login.
    Acessível sem autenticação (allow_guest=True).

    Retorna apenas os campos essenciais para não expor dados desnecessários.
    """
    try:
        ativo = _safe_get("ativar_tema_gf", 1)
        tema = _safe_get("tema_ativo", "Padrão")
        aplicar_login = _safe_get("aplicar_no_login", 1)
        substituir_logos = _safe_get("substituir_logos_erpnext", 1)
        logo_login = _safe_get("logo_login") or _safe_get("logo_global") or FALLBACK_LOGO
        logo_loading = _safe_get("logo_loading") or _safe_get("logo_global") or FALLBACK_LOGO
        login_exibir_logo = _safe_get("login_exibir_logo", 1)
        login_logo_largura = _safe_get("login_logo_largura", "160px")
        login_logo_altura = _safe_get("login_logo_altura", "auto")
        login_usar_imagem_fundo = _safe_get("login_usar_imagem_fundo", 0)
        login_imagem_fundo = _safe_get("login_imagem_fundo", "")

        # Cores do login conforme tema ativo
        if tema == "Black":
            login_cor_fundo = _safe_get("login_cor_fundo_black", "#020617")
            login_cor_texto = _safe_get("login_cor_texto_black", "#f9fafb")
            login_cor_card = _safe_get("login_cor_card_black", "#111827")
        else:
            login_cor_fundo = _safe_get("login_cor_fundo_padrao", "#f8fafc")
            login_cor_texto = _safe_get("login_cor_texto_padrao", "#111827")
            login_cor_card = _safe_get("login_cor_card_padrao", "#ffffff")

        return {
            "ativar_tema_gf": ativo,
            "tema_ativo": tema,
            "aplicar_no_login": aplicar_login,
            "substituir_logos_erpnext": substituir_logos,
            "logo_login": logo_login,
            "logo_loading": logo_loading,
            "fallback_logo": FALLBACK_LOGO,
            "login_exibir_logo": login_exibir_logo,
            "login_logo_largura": login_logo_largura,
            "login_logo_altura": login_logo_altura,
            "login_cor_fundo": login_cor_fundo,
            "login_cor_texto": login_cor_texto,
            "login_cor_card": login_cor_card,
            "login_usar_imagem_fundo": login_usar_imagem_fundo,
            "login_imagem_fundo": login_imagem_fundo,
        }

    except Exception as e:
        frappe.logger().error(f"GF Theme Control [get_public_theme_settings]: {e}")
        return {
            "ativar_tema_gf": 0,
            "tema_ativo": "Padrão",
            "fallback_logo": FALLBACK_LOGO,
        }


@frappe.whitelist()
def get_theme_settings():
    """
    Retorna todas as configurações do tema ativo para usuários logados.
    Lê o Doctype GF Theme Settings e retorna os campos do tema ativo.
    """
    try:
        doc = frappe.get_single("GF Theme Settings")
        data = doc.as_dict()

        # Remove campos internos do Frappe
        internal_keys = ["doctype", "name", "owner", "creation", "modified",
                         "modified_by", "idx", "docstatus", "__unsaved",
                         "__run_link_triggers", "__linkedname"]
        for k in internal_keys:
            data.pop(k, None)

        # Adiciona fallback logo
        data["fallback_logo"] = FALLBACK_LOGO

        # Garante fallbacks de logo
        if not data.get("logo_global"):
            data["logo_global"] = FALLBACK_LOGO
        if not data.get("logo_navbar"):
            data["logo_navbar"] = data.get("logo_global", FALLBACK_LOGO)
        if not data.get("logo_login"):
            data["logo_login"] = data.get("logo_global", FALLBACK_LOGO)
        if not data.get("logo_loading"):
            data["logo_loading"] = data.get("logo_global", FALLBACK_LOGO)

        return data

    except Exception as e:
        frappe.logger().error(f"GF Theme Control [get_theme_settings]: {e}")
        return {"error": str(e), "fallback_logo": FALLBACK_LOGO}


@frappe.whitelist()
def get_css_variables():
    """
    Retorna uma string CSS com todas as variáveis calculadas conforme tema ativo.
    Pode ser injetada diretamente como <style> no DOM.
    """
    try:
        tema = _safe_get("tema_ativo", "Padrão")
        prefixo = "black_" if tema == "Black" else "padrao_"

        def v(campo):
            return _safe_get(f"{prefixo}{campo}", "")

        css_vars = f"""
:root {{
  /* === Cores de Fundo === */
  --gf-bg-main:        {v('cor_fundo_principal')};
  --gf-bg-secondary:   {v('cor_fundo_secundaria')};
  --gf-bg-content:     {v('cor_fundo_conteudo')};
  --gf-bg-card:        {v('cor_fundo_cards')};
  --gf-bg-navbar:      {v('cor_fundo_navbar')};
  --gf-bg-sidebar:     {v('cor_fundo_sidebar')};
  --gf-bg-menu:        {v('cor_fundo_menu')};
  --gf-bg-modal:       {v('cor_fundo_modal')};
  --gf-bg-dropdown:    {v('cor_fundo_dropdown')};

  /* === Cores de Texto === */
  --gf-text-main:      {v('cor_fonte_principal')};
  --gf-text-secondary: {v('cor_fonte_secundaria')};
  --gf-text-soft:      {v('cor_fonte_suave')};
  --gf-text-title:     {v('cor_titulo')};
  --gf-text-subtitle:  {v('cor_subtitulo')};
  --gf-text-link:      {v('cor_link')};

  /* === Cores de Destaque === */
  --gf-accent:         {v('cor_destaque')};
  --gf-accent-dark:    {v('cor_destaque_escura')};
  --gf-border:         {v('cor_borda')};
  --gf-shadow:         {v('cor_sombra')};
  --gf-hover:          {v('cor_hover')};
  --gf-selection:      {v('cor_selecao')};

  /* === Cores de Estado === */
  --gf-success:        {v('cor_sucesso')};
  --gf-warning:        {v('cor_alerta')};
  --gf-error:          {v('cor_erro')};
  --gf-info:           {v('cor_info')};

  /* === Fontes === */
  --gf-font-main:      {v('fonte_principal')};
  --gf-font-title:     {v('fonte_titulos')};
  --gf-font-subtitle:  {v('fonte_subtitulos')};
  --gf-font-heading:   {v('fonte_cabecalhos')};
  --gf-font-table:     {v('fonte_tabelas')};
  --gf-font-button:    {v('fonte_botoes')};
  --gf-font-field:     {v('fonte_campos')};
  --gf-font-menu:      {v('fonte_menus')};
  --gf-font-aux:       {v('fonte_textos_auxiliares')};
  --gf-font-number:    {v('fonte_numeros')};

  /* === Tamanhos de Fonte === */
  --gf-fs-base:        {v('tamanho_fonte_base')};
  --gf-fs-title:       {v('tamanho_fonte_titulo')};
  --gf-fs-subtitle:    {v('tamanho_fonte_subtitulo')};
  --gf-fs-menu:        {v('tamanho_fonte_menu')};
  --gf-fs-button:      {v('tamanho_fonte_botao')};
  --gf-fs-field:       {v('tamanho_fonte_campo')};
  --gf-fs-table:       {v('tamanho_fonte_tabela')};
  --gf-fs-th:          {v('tamanho_fonte_tabela_cabecalho')};

  /* === Pesos de Fonte === */
  --gf-fw-regular:     {v('peso_fonte_regular')};
  --gf-fw-medium:      {v('peso_fonte_medio')};
  --gf-fw-semibold:    {v('peso_fonte_semibold')};
  --gf-fw-bold:        {v('peso_fonte_bold')};

  /* === Grid e Tabelas === */
  --gf-grid-row-h:     {v('grid_altura_linha')};
  --gf-grid-head-h:    {v('grid_altura_cabecalho')};
  --gf-grid-col-min:   {v('grid_largura_minima_coluna')};
  --gf-grid-px:        {v('grid_padding_horizontal')};
  --gf-grid-py:        {v('grid_padding_vertical')};
  --gf-grid-radius:    {v('grid_raio_borda')};
  --gf-grid-bg-head:   {v('grid_cor_fundo_cabecalho')};
  --gf-grid-bg-row:    {v('grid_cor_fundo_linha')};
  --gf-grid-bg-alt:    {v('grid_cor_fundo_linha_alternada')};
  --gf-grid-bg-hover:  {v('grid_cor_fundo_hover')};
  --gf-grid-text-row:  {v('grid_cor_fonte_linha')};
  --gf-grid-text-head: {v('grid_cor_fonte_cabecalho')};
  --gf-grid-border:    {v('grid_cor_borda')};
  --gf-grid-select:    {v('grid_cor_selecao')};
  --gf-grid-fs-row:    {v('grid_tamanho_fonte_linha')};
  --gf-grid-fs-head:   {v('grid_tamanho_fonte_cabecalho')};
  --gf-grid-fw-head:   {v('grid_peso_fonte_cabecalho')};

  /* === Botões === */
  --gf-btn-bg:         {v('botao_primario_fundo')};
  --gf-btn-text:       {v('botao_primario_texto')};
  --gf-btn-sec-bg:     {v('botao_secundario_fundo')};
  --gf-btn-sec-text:   {v('botao_secundario_texto')};
  --gf-btn-hover:      {v('botao_hover_fundo')};
  --gf-btn-radius:     {v('botao_raio_borda')};
  --gf-btn-h:          {v('botao_altura')};
  --gf-btn-px:         {v('botao_padding_horizontal')};
  --gf-btn-fw:         {v('botao_peso_fonte')};

  /* === Campos === */
  --gf-field-bg:       {v('campo_fundo')};
  --gf-field-text:     {v('campo_texto')};
  --gf-field-ph:       {v('campo_placeholder')};
  --gf-field-border:   {v('campo_borda')};
  --gf-field-focus:    {v('campo_borda_foco')};
  --gf-field-h:        {v('campo_altura')};
  --gf-field-p:        {v('campo_padding')};
  --gf-field-fs:       {v('campo_tamanho_fonte')};
  --gf-field-radius:   {v('campo_raio_borda')};

  /* === Cards === */
  --gf-card-bg:        {v('card_fundo')};
  --gf-card-border:    {v('card_borda')};
  --gf-card-shadow:    {v('card_sombra')};
  --gf-card-radius:    {v('card_raio_borda')};
  --gf-card-p:         {v('card_padding')};
  --gf-card-title:     {v('card_titulo')};
  --gf-card-text:      {v('card_texto')};
}}
"""
        return {"css": css_vars, "tema_ativo": tema}

    except Exception as e:
        frappe.logger().error(f"GF Theme Control [get_css_variables]: {e}")
        return {"css": ":root {}", "error": str(e)}
