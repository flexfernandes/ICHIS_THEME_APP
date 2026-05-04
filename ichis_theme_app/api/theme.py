# Copyright (c) 2024, GREENFARMS
# ichis_theme_app — API unificada de Tema e Overlay

import frappe

FALLBACK_LOGO = "/assets/ichis_theme_app/images/app_underline_logo.png"


# ══════════════════════════════════════════════════════════════
# THEME API
# ══════════════════════════════════════════════════════════════

@frappe.whitelist(allow_guest=True)
def get_public_theme_settings():
    """Configurações públicas para tela de Login (allow_guest)."""
    try:
        if not frappe.db.exists("DocType", "GF Theme Settings"):
            return {"ativar_tema_gf": 0, "fallback_logo": FALLBACK_LOGO}

        doc  = frappe.get_single("GF Theme Settings")
        tema = doc.tema_ativo or "Padrão"

        logo_login   = doc.logo_login   or doc.logo_global or FALLBACK_LOGO
        logo_loading = doc.logo_loading or doc.logo_global or FALLBACK_LOGO

        if tema == "Black":
            login_fundo = doc.login_cor_fundo_black or "#020617"
            login_texto = doc.login_cor_texto_black or "#f9fafb"
            login_card  = doc.login_cor_card_black  or "#111827"
        else:
            login_fundo = doc.login_cor_fundo_padrao or "#f8fafc"
            login_texto = doc.login_cor_texto_padrao or "#111827"
            login_card  = doc.login_cor_card_padrao  or "#ffffff"

        return {
            "ativar_tema_gf":           int(doc.ativar_tema_gf or 0),
            "tema_ativo":               tema,
            "aplicar_no_login":         int(doc.aplicar_no_login or 0),
            "substituir_logos_erpnext": int(doc.substituir_logos_erpnext or 0),
            "logo_login":               logo_login,
            "logo_loading":             logo_loading,
            "fallback_logo":            FALLBACK_LOGO,
            "login_exibir_logo":        int(doc.login_exibir_logo or 0),
            "login_logo_largura":       doc.login_logo_largura or "160px",
            "login_logo_altura":        doc.login_logo_altura  or "auto",
            "login_cor_fundo":          login_fundo,
            "login_cor_texto":          login_texto,
            "login_cor_card":           login_card,
            "login_usar_imagem_fundo":  int(doc.login_usar_imagem_fundo or 0),
            "login_imagem_fundo":       doc.login_imagem_fundo or "",
        }
    except Exception as e:
        frappe.logger().error(f"GF Theme [get_public_theme_settings]: {e}")
        return {"ativar_tema_gf": 0, "fallback_logo": FALLBACK_LOGO}


@frappe.whitelist()
def get_theme_settings():
    """Todas as configurações do tema ativo para usuário logado."""
    try:
        if not frappe.db.exists("DocType", "GF Theme Settings"):
            return {"ativar_tema_gf": 0}

        doc  = frappe.get_single("GF Theme Settings")
        data = doc.as_dict()

        # Remove campos internos
        for k in ["doctype","name","owner","creation","modified","modified_by",
                  "idx","docstatus","__unsaved"]:
            data.pop(k, None)

        data["fallback_logo"] = FALLBACK_LOGO
        data["logo_global"]   = data.get("logo_global")   or FALLBACK_LOGO
        data["logo_navbar"]   = data.get("logo_navbar")   or data["logo_global"]
        data["logo_login"]    = data.get("logo_login")    or data["logo_global"]
        data["logo_loading"]  = data.get("logo_loading")  or data["logo_global"]
        return data
    except Exception as e:
        frappe.logger().error(f"GF Theme [get_theme_settings]: {e}")
        return {"ativar_tema_gf": 0}


@frappe.whitelist()
def get_css_variables():
    """Retorna string CSS com variáveis calculadas conforme tema ativo."""
    try:
        if not frappe.db.exists("DocType", "GF Theme Settings"):
            return {"css": ":root{}", "tema_ativo": "Padrão"}

        doc  = frappe.get_single("GF Theme Settings")
        tema = doc.tema_ativo or "Padrão"
        p    = "black_" if tema == "Black" else "padrao_"

        def v(campo, fb=""):
            return getattr(doc, p + campo, None) or fb

        css = f"""
:root {{
  --gf-bg-main:        {v('cor_fundo_principal','#f8fafc')};
  --gf-bg-secondary:   {v('cor_fundo_secundaria','#ffffff')};
  --gf-bg-content:     {v('cor_fundo_conteudo','#ffffff')};
  --gf-bg-card:        {v('cor_fundo_cards','#ffffff')};
  --gf-bg-navbar:      {v('cor_fundo_navbar','#ffffff')};
  --gf-bg-sidebar:     {v('cor_fundo_sidebar','#f9fafb')};
  --gf-bg-modal:       {v('cor_fundo_modal','#ffffff')};
  --gf-bg-dropdown:    {v('cor_fundo_dropdown','#ffffff')};
  --gf-text-main:      {v('cor_fonte_principal','#111827')};
  --gf-text-secondary: {v('cor_fonte_secundaria','#6b7280')};
  --gf-text-soft:      {v('cor_fonte_suave','#94a3b8')};
  --gf-text-title:     {v('cor_titulo','#111827')};
  --gf-text-subtitle:  {v('cor_subtitulo','#374151')};
  --gf-text-link:      {v('cor_link','#15803d')};
  --gf-accent:         {v('cor_destaque','#16a34a')};
  --gf-accent-dark:    {v('cor_destaque_escura','#166534')};
  --gf-border:         {v('cor_borda','#e5e7eb')};
  --gf-shadow:         {v('cor_sombra','rgba(15,23,42,0.08)')};
  --gf-hover:          {v('cor_hover','#dcfce7')};
  --gf-selection:      {v('cor_selecao','#bbf7d0')};
  --gf-success:        {v('cor_sucesso','#16a34a')};
  --gf-warning:        {v('cor_alerta','#f59e0b')};
  --gf-error:          {v('cor_erro','#dc2626')};
  --gf-info:           {v('cor_info','#2563eb')};
  --gf-font-main:      {v('fonte_principal','Inter,"Segoe UI",Arial,sans-serif')};
  --gf-font-title:     {v('fonte_titulos','Inter,"Segoe UI",Arial,sans-serif')};
  --gf-font-number:    {v('fonte_numeros','"Roboto Mono",Consolas,monospace')};
  --gf-fs-base:        {v('tamanho_fonte_base','13px')};
  --gf-fs-title:       {v('tamanho_fonte_titulo','18px')};
  --gf-fs-subtitle:    {v('tamanho_fonte_subtitulo','14px')};
  --gf-fs-table:       {v('tamanho_fonte_tabela','12px')};
  --gf-fw-regular:     {v('peso_fonte_regular','400')};
  --gf-fw-medium:      {v('peso_fonte_medio','500')};
  --gf-fw-semibold:    {v('peso_fonte_semibold','600')};
  --gf-fw-bold:        {v('peso_fonte_bold','700')};
  --gf-btn-bg:         {v('botao_primario_fundo','#16a34a')};
  --gf-btn-text:       {v('botao_primario_texto','#ffffff')};
  --gf-btn-hover:      {v('botao_hover_fundo','#166534')};
  --gf-btn-radius:     {v('botao_raio_borda','6px')};
  --gf-field-bg:       {v('campo_fundo','#ffffff')};
  --gf-field-text:     {v('campo_texto','#111827')};
  --gf-field-border:   {v('campo_borda','#d1d5db')};
  --gf-field-focus:    {v('campo_borda_foco','#16a34a')};
  --gf-field-radius:   {v('campo_raio_borda','6px')};
  --gf-card-bg:        {v('card_fundo','#ffffff')};
  --gf-card-border:    {v('card_borda','#e5e7eb')};
  --gf-card-shadow:    {v('card_sombra','0 1px 4px rgba(15,23,42,0.08)')};
  --gf-card-radius:    {v('card_raio_borda','10px')};
  --gf-grid-bg-head:   {v('grid_cor_fundo_cabecalho','#f3f4f6')};
  --gf-grid-bg-row:    {v('grid_cor_fundo_linha','#ffffff')};
  --gf-grid-bg-alt:    {v('grid_cor_fundo_linha_alternada','#f9fafb')};
  --gf-grid-bg-hover:  {v('grid_cor_fundo_hover','#ecfdf5')};
  --gf-grid-text-row:  {v('grid_cor_fonte_linha','#111827')};
  --gf-grid-text-head: {v('grid_cor_fonte_cabecalho','#374151')};
  --gf-grid-border:    {v('grid_cor_borda','#e5e7eb')};
  --gf-grid-row-h:     {v('grid_altura_linha','34px')};
  --gf-grid-head-h:    {v('grid_altura_cabecalho','38px')};
  --gf-grid-fs-row:    {v('grid_tamanho_fonte_linha','12px')};
  --gf-grid-fs-head:   {v('grid_tamanho_fonte_cabecalho','11px')};
  --gf-grid-fw-head:   {v('grid_peso_fonte_cabecalho','600')};
}}
"""
        return {"css": css, "tema_ativo": tema}
    except Exception as e:
        frappe.logger().error(f"GF Theme [get_css_variables]: {e}")
        return {"css": ":root{}", "tema_ativo": "Padrão"}


