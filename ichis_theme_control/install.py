# Copyright (c) 2024, GREENFARMS and contributors
# For license information, please see license.txt

import frappe


def after_install():
    """
    Executado automaticamente após a instalação do app.

    Popula o Doctype GF Theme Settings com valores padrão elegantes,
    sem sobrescrever valores já personalizados pelo usuário.

    Segue a regra:
    - Se campo vazio: preencher com default
    - Se campo já preenchido: manter valor existente
    """
    frappe.logger().info("GF Theme Control: iniciando configuração padrão após instalação...")

    try:
        # Verifica se o Doctype existe
        if not frappe.db.exists("DocType", "GF Theme Settings"):
            frappe.logger().warning("GF Theme Control: Doctype GF Theme Settings não encontrado. Aguarde a migração.")
            return

        # Definição dos valores padrão para todos os campos
        defaults = _get_default_values()

        # Aplica cada valor padrão apenas se o campo estiver vazio
        for fieldname, default_value in defaults.items():
            current = frappe.db.get_single_value("GF Theme Settings", fieldname)
            if current is None or current == "" or current == 0:
                frappe.db.set_single_value("GF Theme Settings", fieldname, default_value)

        frappe.db.commit()
        frappe.logger().info("GF Theme Control: configuração padrão aplicada com sucesso.")

    except Exception as e:
        frappe.logger().error(f"GF Theme Control: erro ao aplicar configuração padrão: {e}")


def _get_default_values():
    """Retorna dicionário com todos os valores padrão do tema."""
    return {
        # ======================================================
        # CONFIGURAÇÃO GERAL
        # ======================================================
        "ativar_tema_gf": 1,
        "tema_ativo": "Padrão",
        "aplicar_no_login": 1,
        "aplicar_no_desk": 1,
        "substituir_logos_erpnext": 1,
        "texto_sistema": "GREENFARMS",

        # ======================================================
        # TEMA PADRÃO - CORES DE FUNDO
        # ======================================================
        "padrao_cor_fundo_principal": "#f8fafc",
        "padrao_cor_fundo_secundaria": "#ffffff",
        "padrao_cor_fundo_conteudo": "#ffffff",
        "padrao_cor_fundo_cards": "#ffffff",
        "padrao_cor_fundo_navbar": "#ffffff",
        "padrao_cor_fundo_sidebar": "#f9fafb",
        "padrao_cor_fundo_menu": "#ffffff",
        "padrao_cor_fundo_modal": "#ffffff",
        "padrao_cor_fundo_dropdown": "#ffffff",

        # TEMA PADRÃO - CORES DE TEXTO
        "padrao_cor_fonte_principal": "#111827",
        "padrao_cor_fonte_secundaria": "#6b7280",
        "padrao_cor_fonte_suave": "#94a3b8",
        "padrao_cor_titulo": "#111827",
        "padrao_cor_subtitulo": "#374151",
        "padrao_cor_destaque": "#16a34a",
        "padrao_cor_destaque_escura": "#166534",
        "padrao_cor_borda": "#e5e7eb",
        "padrao_cor_sombra": "rgba(15, 23, 42, 0.08)",
        "padrao_cor_link": "#15803d",

        # TEMA PADRÃO - CORES DE ESTADO
        "padrao_cor_hover": "#dcfce7",
        "padrao_cor_selecao": "#bbf7d0",
        "padrao_cor_sucesso": "#16a34a",
        "padrao_cor_alerta": "#f59e0b",
        "padrao_cor_erro": "#dc2626",
        "padrao_cor_info": "#2563eb",

        # ======================================================
        # TEMA PADRÃO - FONTES
        # ======================================================
        "padrao_fonte_principal": 'Inter, "Segoe UI", Arial, sans-serif',
        "padrao_fonte_titulos": 'Inter, "Segoe UI", Arial, sans-serif',
        "padrao_fonte_subtitulos": 'Inter, "Segoe UI", Arial, sans-serif',
        "padrao_fonte_cabecalhos": 'Inter, "Segoe UI", Arial, sans-serif',
        "padrao_fonte_tabelas": 'Inter, "Segoe UI", Arial, sans-serif',
        "padrao_fonte_botoes": 'Inter, "Segoe UI", Arial, sans-serif',
        "padrao_fonte_campos": 'Inter, "Segoe UI", Arial, sans-serif',
        "padrao_fonte_menus": 'Inter, "Segoe UI", Arial, sans-serif',
        "padrao_fonte_textos_auxiliares": 'Inter, "Segoe UI", Arial, sans-serif',
        "padrao_fonte_numeros": '"Roboto Mono", "SFMono-Regular", Consolas, monospace',

        # TEMA PADRÃO - TAMANHOS
        "padrao_tamanho_fonte_base": "13px",
        "padrao_tamanho_fonte_titulo": "18px",
        "padrao_tamanho_fonte_subtitulo": "14px",
        "padrao_tamanho_fonte_menu": "13px",
        "padrao_tamanho_fonte_botao": "13px",
        "padrao_tamanho_fonte_campo": "13px",
        "padrao_tamanho_fonte_tabela": "12px",
        "padrao_tamanho_fonte_tabela_cabecalho": "11px",
        "padrao_peso_fonte_regular": "400",
        "padrao_peso_fonte_medio": "500",
        "padrao_peso_fonte_semibold": "600",
        "padrao_peso_fonte_bold": "700",

        # ======================================================
        # TEMA PADRÃO - GRIDS E TABELAS
        # ======================================================
        "padrao_grid_altura_linha": "34px",
        "padrao_grid_altura_cabecalho": "38px",
        "padrao_grid_largura_minima_coluna": "120px",
        "padrao_grid_padding_horizontal": "10px",
        "padrao_grid_padding_vertical": "6px",
        "padrao_grid_raio_borda": "10px",
        "padrao_grid_cor_fundo_cabecalho": "#f3f4f6",
        "padrao_grid_cor_fundo_linha": "#ffffff",
        "padrao_grid_cor_fundo_linha_alternada": "#f9fafb",
        "padrao_grid_cor_fundo_hover": "#ecfdf5",
        "padrao_grid_cor_fonte_linha": "#111827",
        "padrao_grid_cor_fonte_cabecalho": "#374151",
        "padrao_grid_cor_borda": "#e5e7eb",
        "padrao_grid_cor_selecao": "#bbf7d0",
        "padrao_grid_tamanho_fonte_linha": "12px",
        "padrao_grid_tamanho_fonte_cabecalho": "11px",
        "padrao_grid_peso_fonte_cabecalho": "600",

        # ======================================================
        # TEMA PADRÃO - BOTÕES
        # ======================================================
        "padrao_botao_primario_fundo": "#16a34a",
        "padrao_botao_primario_texto": "#ffffff",
        "padrao_botao_secundario_fundo": "#f3f4f6",
        "padrao_botao_secundario_texto": "#374151",
        "padrao_botao_hover_fundo": "#166534",
        "padrao_botao_raio_borda": "6px",
        "padrao_botao_altura": "32px",
        "padrao_botao_padding_horizontal": "14px",
        "padrao_botao_peso_fonte": "500",

        # ======================================================
        # TEMA PADRÃO - CAMPOS
        # ======================================================
        "padrao_campo_fundo": "#ffffff",
        "padrao_campo_texto": "#111827",
        "padrao_campo_placeholder": "#9ca3af",
        "padrao_campo_borda": "#d1d5db",
        "padrao_campo_borda_foco": "#16a34a",
        "padrao_campo_altura": "30px",
        "padrao_campo_padding": "6px 10px",
        "padrao_campo_tamanho_fonte": "13px",
        "padrao_campo_raio_borda": "6px",

        # ======================================================
        # TEMA PADRÃO - CARDS
        # ======================================================
        "padrao_card_fundo": "#ffffff",
        "padrao_card_borda": "#e5e7eb",
        "padrao_card_sombra": "0 1px 4px rgba(15, 23, 42, 0.08)",
        "padrao_card_raio_borda": "10px",
        "padrao_card_padding": "16px",
        "padrao_card_titulo": "#111827",
        "padrao_card_texto": "#6b7280",

        # ======================================================
        # TEMA BLACK - CORES DE FUNDO
        # ======================================================
        "black_cor_fundo_principal": "#020617",
        "black_cor_fundo_secundaria": "#0f172a",
        "black_cor_fundo_conteudo": "#0f172a",
        "black_cor_fundo_cards": "#111827",
        "black_cor_fundo_navbar": "#020617",
        "black_cor_fundo_sidebar": "#020617",
        "black_cor_fundo_menu": "#0f172a",
        "black_cor_fundo_modal": "#0f172a",
        "black_cor_fundo_dropdown": "#111827",

        # TEMA BLACK - CORES DE TEXTO
        "black_cor_fonte_principal": "#f9fafb",
        "black_cor_fonte_secundaria": "#cbd5e1",
        "black_cor_fonte_suave": "#94a3b8",
        "black_cor_titulo": "#f9fafb",
        "black_cor_subtitulo": "#e5e7eb",
        "black_cor_destaque": "#22c55e",
        "black_cor_destaque_escura": "#16a34a",
        "black_cor_borda": "#1f2937",
        "black_cor_sombra": "rgba(0, 0, 0, 0.35)",
        "black_cor_link": "#4ade80",

        # TEMA BLACK - CORES DE ESTADO
        "black_cor_hover": "#064e3b",
        "black_cor_selecao": "#166534",
        "black_cor_sucesso": "#22c55e",
        "black_cor_alerta": "#fbbf24",
        "black_cor_erro": "#f87171",
        "black_cor_info": "#60a5fa",

        # ======================================================
        # TEMA BLACK - FONTES
        # ======================================================
        "black_fonte_principal": 'Inter, "Segoe UI", Arial, sans-serif',
        "black_fonte_titulos": 'Inter, "Segoe UI", Arial, sans-serif',
        "black_fonte_subtitulos": 'Inter, "Segoe UI", Arial, sans-serif',
        "black_fonte_cabecalhos": 'Inter, "Segoe UI", Arial, sans-serif',
        "black_fonte_tabelas": 'Inter, "Segoe UI", Arial, sans-serif',
        "black_fonte_botoes": 'Inter, "Segoe UI", Arial, sans-serif',
        "black_fonte_campos": 'Inter, "Segoe UI", Arial, sans-serif',
        "black_fonte_menus": 'Inter, "Segoe UI", Arial, sans-serif',
        "black_fonte_textos_auxiliares": 'Inter, "Segoe UI", Arial, sans-serif',
        "black_fonte_numeros": '"Roboto Mono", "SFMono-Regular", Consolas, monospace',

        # TEMA BLACK - TAMANHOS
        "black_tamanho_fonte_base": "13px",
        "black_tamanho_fonte_titulo": "18px",
        "black_tamanho_fonte_subtitulo": "14px",
        "black_tamanho_fonte_menu": "13px",
        "black_tamanho_fonte_botao": "13px",
        "black_tamanho_fonte_campo": "13px",
        "black_tamanho_fonte_tabela": "12px",
        "black_tamanho_fonte_tabela_cabecalho": "11px",
        "black_peso_fonte_regular": "400",
        "black_peso_fonte_medio": "500",
        "black_peso_fonte_semibold": "600",
        "black_peso_fonte_bold": "700",

        # ======================================================
        # TEMA BLACK - GRIDS E TABELAS
        # ======================================================
        "black_grid_altura_linha": "34px",
        "black_grid_altura_cabecalho": "38px",
        "black_grid_largura_minima_coluna": "120px",
        "black_grid_padding_horizontal": "10px",
        "black_grid_padding_vertical": "6px",
        "black_grid_raio_borda": "10px",
        "black_grid_cor_fundo_cabecalho": "#111827",
        "black_grid_cor_fundo_linha": "#020617",
        "black_grid_cor_fundo_linha_alternada": "#0f172a",
        "black_grid_cor_fundo_hover": "#064e3b",
        "black_grid_cor_fonte_linha": "#f9fafb",
        "black_grid_cor_fonte_cabecalho": "#cbd5e1",
        "black_grid_cor_borda": "#1f2937",
        "black_grid_cor_selecao": "#166534",
        "black_grid_tamanho_fonte_linha": "12px",
        "black_grid_tamanho_fonte_cabecalho": "11px",
        "black_grid_peso_fonte_cabecalho": "600",

        # ======================================================
        # TEMA BLACK - BOTÕES
        # ======================================================
        "black_botao_primario_fundo": "#22c55e",
        "black_botao_primario_texto": "#020617",
        "black_botao_secundario_fundo": "#1f2937",
        "black_botao_secundario_texto": "#e5e7eb",
        "black_botao_hover_fundo": "#16a34a",
        "black_botao_raio_borda": "6px",
        "black_botao_altura": "32px",
        "black_botao_padding_horizontal": "14px",
        "black_botao_peso_fonte": "500",

        # ======================================================
        # TEMA BLACK - CAMPOS
        # ======================================================
        "black_campo_fundo": "#0f172a",
        "black_campo_texto": "#f9fafb",
        "black_campo_placeholder": "#64748b",
        "black_campo_borda": "#1f2937",
        "black_campo_borda_foco": "#22c55e",
        "black_campo_altura": "30px",
        "black_campo_padding": "6px 10px",
        "black_campo_tamanho_fonte": "13px",
        "black_campo_raio_borda": "6px",

        # ======================================================
        # TEMA BLACK - CARDS
        # ======================================================
        "black_card_fundo": "#111827",
        "black_card_borda": "#1f2937",
        "black_card_sombra": "0 1px 4px rgba(0, 0, 0, 0.35)",
        "black_card_raio_borda": "10px",
        "black_card_padding": "16px",
        "black_card_titulo": "#f9fafb",
        "black_card_texto": "#cbd5e1",

        # ======================================================
        # LOGIN
        # ======================================================
        "login_cor_fundo_padrao": "#f8fafc",
        "login_cor_texto_padrao": "#111827",
        "login_cor_card_padrao": "#ffffff",
        "login_cor_fundo_black": "#020617",
        "login_cor_texto_black": "#f9fafb",
        "login_cor_card_black": "#111827",
        "login_logo_largura": "160px",
        "login_logo_altura": "auto",
        "login_exibir_logo": 1,
        "login_usar_imagem_fundo": 0,
    }
