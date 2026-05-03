# Copyright (c) 2024, GREENFARMS
# ichis_theme_app — Instalação unificada

import frappe


def after_install():
    frappe.logger().info("GF Theme App: instalando dados padrão...")
    try:
        _install_theme_settings()
        _install_overlay_settings()
        _install_modern_desk()
        frappe.db.commit()
        frappe.logger().info("GF Theme App: instalação concluída.")
    except Exception as e:
        frappe.logger().error(f"GF Theme App after_install: {e}")
        import traceback
        frappe.logger().error(traceback.format_exc())


# ══════════════════════════════════════════════════════════════
# GF THEME SETTINGS
# ══════════════════════════════════════════════════════════════

def _install_theme_settings():
    if not frappe.db.exists("DocType", "GF Theme Settings"):
        return

    defaults = {
        "ativar_tema_gf": 1, "tema_ativo": "Padrão",
        "aplicar_no_login": 1, "aplicar_no_desk": 1,
        "substituir_logos_erpnext": 1, "texto_sistema": "GREENFARMS",
        # Padrão — Fundo
        "padrao_cor_fundo_principal":"#f8fafc","padrao_cor_fundo_secundaria":"#ffffff",
        "padrao_cor_fundo_conteudo":"#ffffff","padrao_cor_fundo_cards":"#ffffff",
        "padrao_cor_fundo_navbar":"#ffffff","padrao_cor_fundo_sidebar":"#f9fafb",
        "padrao_cor_fundo_menu":"#ffffff","padrao_cor_fundo_modal":"#ffffff",
        "padrao_cor_fundo_dropdown":"#ffffff",
        # Padrão — Texto
        "padrao_cor_fonte_principal":"#111827","padrao_cor_fonte_secundaria":"#6b7280",
        "padrao_cor_fonte_suave":"#94a3b8","padrao_cor_titulo":"#111827",
        "padrao_cor_subtitulo":"#374151","padrao_cor_destaque":"#16a34a",
        "padrao_cor_destaque_escura":"#166534","padrao_cor_borda":"#e5e7eb",
        "padrao_cor_sombra":"rgba(15,23,42,0.08)","padrao_cor_link":"#15803d",
        "padrao_cor_hover":"#dcfce7","padrao_cor_selecao":"#bbf7d0",
        "padrao_cor_sucesso":"#16a34a","padrao_cor_alerta":"#f59e0b",
        "padrao_cor_erro":"#dc2626","padrao_cor_info":"#2563eb",
        # Padrão — Fontes
        "padrao_fonte_principal":'Inter,"Segoe UI",Arial,sans-serif',
        "padrao_fonte_titulos":'Inter,"Segoe UI",Arial,sans-serif',
        "padrao_fonte_subtitulos":'Inter,"Segoe UI",Arial,sans-serif',
        "padrao_fonte_cabecalhos":'Inter,"Segoe UI",Arial,sans-serif',
        "padrao_fonte_tabelas":'Inter,"Segoe UI",Arial,sans-serif',
        "padrao_fonte_botoes":'Inter,"Segoe UI",Arial,sans-serif',
        "padrao_fonte_campos":'Inter,"Segoe UI",Arial,sans-serif',
        "padrao_fonte_menus":'Inter,"Segoe UI",Arial,sans-serif',
        "padrao_fonte_textos_auxiliares":'Inter,"Segoe UI",Arial,sans-serif',
        "padrao_fonte_numeros":'"Roboto Mono","SFMono-Regular",Consolas,monospace',
        # Padrão — Tamanhos
        "padrao_tamanho_fonte_base":"13px","padrao_tamanho_fonte_titulo":"18px",
        "padrao_tamanho_fonte_subtitulo":"14px","padrao_tamanho_fonte_menu":"13px",
        "padrao_tamanho_fonte_botao":"13px","padrao_tamanho_fonte_campo":"13px",
        "padrao_tamanho_fonte_tabela":"12px","padrao_tamanho_fonte_tabela_cabecalho":"11px",
        "padrao_peso_fonte_regular":"400","padrao_peso_fonte_medio":"500",
        "padrao_peso_fonte_semibold":"600","padrao_peso_fonte_bold":"700",
        # Padrão — Grid
        "padrao_grid_altura_linha":"34px","padrao_grid_altura_cabecalho":"38px",
        "padrao_grid_largura_minima_coluna":"120px","padrao_grid_padding_horizontal":"10px",
        "padrao_grid_padding_vertical":"6px","padrao_grid_raio_borda":"10px",
        "padrao_grid_cor_fundo_cabecalho":"#f3f4f6","padrao_grid_cor_fundo_linha":"#ffffff",
        "padrao_grid_cor_fundo_linha_alternada":"#f9fafb","padrao_grid_cor_fundo_hover":"#ecfdf5",
        "padrao_grid_cor_fonte_linha":"#111827","padrao_grid_cor_fonte_cabecalho":"#374151",
        "padrao_grid_cor_borda":"#e5e7eb","padrao_grid_cor_selecao":"#bbf7d0",
        "padrao_grid_tamanho_fonte_linha":"12px","padrao_grid_tamanho_fonte_cabecalho":"11px",
        "padrao_grid_peso_fonte_cabecalho":"600",
        # Padrão — Botões, Campos, Cards
        "padrao_botao_primario_fundo":"#16a34a","padrao_botao_primario_texto":"#ffffff",
        "padrao_botao_secundario_fundo":"#f3f4f6","padrao_botao_secundario_texto":"#374151",
        "padrao_botao_hover_fundo":"#166534","padrao_botao_raio_borda":"6px",
        "padrao_botao_altura":"32px","padrao_botao_padding_horizontal":"14px","padrao_botao_peso_fonte":"500",
        "padrao_campo_fundo":"#ffffff","padrao_campo_texto":"#111827","padrao_campo_placeholder":"#9ca3af",
        "padrao_campo_borda":"#d1d5db","padrao_campo_borda_foco":"#16a34a",
        "padrao_campo_altura":"30px","padrao_campo_padding":"6px 10px",
        "padrao_campo_tamanho_fonte":"13px","padrao_campo_raio_borda":"6px",
        "padrao_card_fundo":"#ffffff","padrao_card_borda":"#e5e7eb",
        "padrao_card_sombra":"0 1px 4px rgba(15,23,42,0.08)",
        "padrao_card_raio_borda":"10px","padrao_card_padding":"16px",
        "padrao_card_titulo":"#111827","padrao_card_texto":"#6b7280",
        # Login
        "login_cor_fundo_padrao":"#f8fafc","login_cor_texto_padrao":"#111827",
        "login_cor_card_padrao":"#ffffff","login_cor_fundo_black":"#020617",
        "login_cor_texto_black":"#f9fafb","login_cor_card_black":"#111827",
        "login_logo_largura":"160px","login_logo_altura":"auto",
        "login_exibir_logo":1,"login_usar_imagem_fundo":0,
        # Black — Fundo
        "black_cor_fundo_principal":"#020617","black_cor_fundo_secundaria":"#0f172a",
        "black_cor_fundo_conteudo":"#0f172a","black_cor_fundo_cards":"#111827",
        "black_cor_fundo_navbar":"#020617","black_cor_fundo_sidebar":"#020617",
        "black_cor_fundo_menu":"#0f172a","black_cor_fundo_modal":"#0f172a",
        "black_cor_fundo_dropdown":"#111827",
        # Black — Texto
        "black_cor_fonte_principal":"#f9fafb","black_cor_fonte_secundaria":"#cbd5e1",
        "black_cor_fonte_suave":"#94a3b8","black_cor_titulo":"#f9fafb",
        "black_cor_subtitulo":"#e5e7eb","black_cor_destaque":"#22c55e",
        "black_cor_destaque_escura":"#16a34a","black_cor_borda":"#1f2937",
        "black_cor_sombra":"rgba(0,0,0,0.35)","black_cor_link":"#4ade80",
        "black_cor_hover":"#064e3b","black_cor_selecao":"#166534",
        "black_cor_sucesso":"#22c55e","black_cor_alerta":"#fbbf24",
        "black_cor_erro":"#f87171","black_cor_info":"#60a5fa",
        # Black — Fontes (iguais ao padrão)
        "black_fonte_principal":'Inter,"Segoe UI",Arial,sans-serif',
        "black_fonte_titulos":'Inter,"Segoe UI",Arial,sans-serif',
        "black_fonte_subtitulos":'Inter,"Segoe UI",Arial,sans-serif',
        "black_fonte_cabecalhos":'Inter,"Segoe UI",Arial,sans-serif',
        "black_fonte_tabelas":'Inter,"Segoe UI",Arial,sans-serif',
        "black_fonte_botoes":'Inter,"Segoe UI",Arial,sans-serif',
        "black_fonte_campos":'Inter,"Segoe UI",Arial,sans-serif',
        "black_fonte_menus":'Inter,"Segoe UI",Arial,sans-serif',
        "black_fonte_textos_auxiliares":'Inter,"Segoe UI",Arial,sans-serif',
        "black_fonte_numeros":'"Roboto Mono","SFMono-Regular",Consolas,monospace',
        # Black — Tamanhos
        "black_tamanho_fonte_base":"13px","black_tamanho_fonte_titulo":"18px",
        "black_tamanho_fonte_subtitulo":"14px","black_tamanho_fonte_menu":"13px",
        "black_tamanho_fonte_botao":"13px","black_tamanho_fonte_campo":"13px",
        "black_tamanho_fonte_tabela":"12px","black_tamanho_fonte_tabela_cabecalho":"11px",
        "black_peso_fonte_regular":"400","black_peso_fonte_medio":"500",
        "black_peso_fonte_semibold":"600","black_peso_fonte_bold":"700",
        # Black — Grid
        "black_grid_altura_linha":"34px","black_grid_altura_cabecalho":"38px",
        "black_grid_largura_minima_coluna":"120px","black_grid_padding_horizontal":"10px",
        "black_grid_padding_vertical":"6px","black_grid_raio_borda":"10px",
        "black_grid_cor_fundo_cabecalho":"#111827","black_grid_cor_fundo_linha":"#020617",
        "black_grid_cor_fundo_linha_alternada":"#0f172a","black_grid_cor_fundo_hover":"#064e3b",
        "black_grid_cor_fonte_linha":"#f9fafb","black_grid_cor_fonte_cabecalho":"#cbd5e1",
        "black_grid_cor_borda":"#1f2937","black_grid_cor_selecao":"#166534",
        "black_grid_tamanho_fonte_linha":"12px","black_grid_tamanho_fonte_cabecalho":"11px",
        "black_grid_peso_fonte_cabecalho":"600",
        # Black — Botões, Campos, Cards
        "black_botao_primario_fundo":"#22c55e","black_botao_primario_texto":"#020617",
        "black_botao_secundario_fundo":"#1f2937","black_botao_secundario_texto":"#e5e7eb",
        "black_botao_hover_fundo":"#16a34a","black_botao_raio_borda":"6px",
        "black_botao_altura":"32px","black_botao_padding_horizontal":"14px","black_botao_peso_fonte":"500",
        "black_campo_fundo":"#0f172a","black_campo_texto":"#f9fafb","black_campo_placeholder":"#64748b",
        "black_campo_borda":"#1f2937","black_campo_borda_foco":"#22c55e",
        "black_campo_altura":"30px","black_campo_padding":"6px 10px",
        "black_campo_tamanho_fonte":"13px","black_campo_raio_borda":"6px",
        "black_card_fundo":"#111827","black_card_borda":"#1f2937",
        "black_card_sombra":"0 1px 4px rgba(0,0,0,0.35)",
        "black_card_raio_borda":"10px","black_card_padding":"16px",
        "black_card_titulo":"#f9fafb","black_card_texto":"#cbd5e1",
    }

    for fieldname, value in defaults.items():
        try:
            cur = frappe.db.get_single_value("GF Theme Settings", fieldname)
            if cur is None or cur == "":
                frappe.db.set_single_value("GF Theme Settings", fieldname, value)
        except Exception as e:
            frappe.logger().warning(f"GF Theme Settings '{fieldname}': {e}")

    frappe.logger().info("GF Theme Settings: configurado.")


# ══════════════════════════════════════════════════════════════
# GF UI OVERLAY SETTINGS
# ══════════════════════════════════════════════════════════════

def _install_overlay_settings():
    if not frappe.db.exists("DocType", "GF UI Overlay Settings"):
        return

    defaults = {
        "ativar_sobreposicoes": 1, "ativar_sobreposicao_desk": 1,
        "modo_padrao_sobreposicao": "Substituir Tela",
        "permitir_fallback_tela_original": 0,
        "mostrar_botao_voltar_tela_original": 0,
        "usar_tema_gf": 1, "animacao_entrada": "Suave",
        "tempo_animacao_ms": 250, "diagnostico_console": 1,
        "aplicar_por_usuario": 0, "aplicar_por_perfil": 0,
    }
    for fieldname, value in defaults.items():
        try:
            cur = frappe.db.get_single_value("GF UI Overlay Settings", fieldname)
            if cur is None:
                frappe.db.set_single_value("GF UI Overlay Settings", fieldname, value)
        except Exception as e:
            frappe.logger().warning(f"GF UI Overlay Settings '{fieldname}': {e}")

    frappe.logger().info("GF UI Overlay Settings: configurado.")


# ══════════════════════════════════════════════════════════════
# GF MODERN DESK
# ══════════════════════════════════════════════════════════════

def _install_modern_desk():
    if not frappe.db.exists("DocType", "GF UI Overlay Page"):
        return

    existing = frappe.db.get_value(
        "GF UI Overlay Page", {"nome_tecnico": "gf_modern_desk"}, "name"
    )

    if existing:
        # Só atualiza CSS/JS, preserva configurações do usuário
        doc = frappe.get_doc("GF UI Overlay Page", existing)
        doc.css_customizado = DESK_CSS
        doc.js_customizado  = DESK_JS
        doc.save(ignore_permissions=True)
        frappe.db.commit()
        frappe.logger().info(f"GF Modern Desk atualizado ({existing}).")
        return

    frappe.logger().info("GF Modern Desk: criando...")

    doc = frappe.new_doc("GF UI Overlay Page")
    doc.nome_tecnico                       = "gf_modern_desk"
    doc.titulo                             = "GF Modern Desk"
    doc.descricao                          = "Home moderna corporativa — substitui o Desk padrão."
    doc.ativo                              = 1
    doc.tipo_alvo                          = "Desk"
    doc.rota_alvo                          = "/app"
    doc.modo_sobreposicao                  = "Substituir Tela"
    doc.ocultar_tela_original              = 1
    doc.preservar_tela_original_em_memoria = 1
    doc.permitir_retorno_original          = 1
    doc.aplicar_para_todos                 = 1
    doc.tipo_layout                        = "Home Moderna"
    doc.exibir_busca_global                = 1
    doc.exibir_area_boas_vindas            = 1
    doc.exibir_cards_atalhos               = 1
    doc.exibir_indicadores                 = 1
    doc.exibir_ultimas_atividades          = 1
    doc.titulo_pagina                      = "Central de Gestão GREENFARMS"
    doc.subtitulo_pagina                   = "Sistema de Gestão Integrada"
    doc.texto_boas_vindas                  = "Gerencie sua operação com eficiência e clareza."
    doc.prioridade_execucao                = 1
    doc.tempo_espera_ms                    = 100
    doc.carregar_ao_abrir_rota             = 1
    doc.recarregar_ao_mudar_rota           = 1
    doc.observar_dom                       = 1
    doc.habilitar_logs                     = 1
    doc.versao_overlay                     = "1.0.0"
    doc.css_customizado                    = DESK_CSS
    doc.js_customizado                     = DESK_JS

    doc.insert(ignore_permissions=True)
    frappe.db.commit()

    # Fase 2: adicionar cards
    doc2 = frappe.get_doc("GF UI Overlay Page", doc.name)
    for card in DESK_CARDS:
        doc2.append("cards", card)
    doc2.save(ignore_permissions=True)
    frappe.db.commit()

    frappe.logger().info(f"GF Modern Desk criado com {len(DESK_CARDS)} cards.")


# ══════════════════════════════════════════════════════════════
# CSS DO MODERN DESK
# Consome --gf-* do gf_theme.js que já aplicou as variáveis
# ══════════════════════════════════════════════════════════════

DESK_CSS = """
/* GF Modern Desk — CSS v1.0 (ichis_theme_app unificado)
   Consome variáveis --gf-* definidas pelo gf_theme.js */

#gf-ui-overlay-root {
  --d-font:    var(--gf-font-main, Inter,"Segoe UI",system-ui,Arial,sans-serif);
  --d-bg:      var(--gf-bg-main,   #f1f5f9);
  --d-surface: var(--gf-bg-card,   #ffffff);
  --d-border:  var(--gf-border,    #e2e8f0);
  --d-text:    var(--gf-text-main, #0f172a);
  --d-muted:   var(--gf-text-secondary, #64748b);
  --d-accent:  var(--gf-accent,    #16a34a);
  --d-accent2: var(--gf-accent-dark,#166534);
  --d-shadow:  var(--gf-shadow,    rgba(15,23,42,0.07));
  --d-hover:   var(--gf-hover,     #f0fdf4);
  --d-r: 14px;
  font-family: var(--d-font) !important;
  background:  var(--d-bg) !important;
  color:       var(--d-text) !important;
  -webkit-font-smoothing: antialiased;
}
#gf-ui-overlay-root, #gf-ui-overlay-root * { box-sizing: border-box; }

.gfd-topbar {
  height:52px; display:flex; align-items:center; gap:16px;
  padding:0 24px; background:var(--d-surface);
  border-bottom:1px solid var(--d-border); flex-shrink:0;
  box-shadow:0 1px 4px var(--d-shadow);
}
.gfd-brand { font-size:15px; font-weight:800; letter-spacing:.04em; color:var(--d-accent); white-space:nowrap; font-family:var(--d-font); }
.gfd-search-wrap {
  flex:1; max-width:480px; margin:0 auto;
  display:flex; align-items:center; gap:10px;
  background:var(--d-bg); border:1.5px solid var(--d-border);
  border-radius:10px; padding:0 14px;
  transition:border-color .15s,box-shadow .15s;
}
.gfd-search-wrap:focus-within { border-color:var(--d-accent); box-shadow:0 0 0 3px color-mix(in srgb,var(--d-accent) 12%,transparent); background:var(--d-surface); }
.gfd-search-ico { color:var(--d-muted); font-size:15px; }
.gfd-search-inp { flex:1; border:none; outline:none; background:transparent; font-family:var(--d-font); font-size:13px; color:var(--d-text); padding:9px 0; }
.gfd-search-inp::placeholder { color:var(--d-muted); }
.gfd-search-kbd { font-size:10px; color:var(--d-muted); background:var(--d-border); border-radius:4px; padding:2px 6px; white-space:nowrap; }
.gfd-user { width:34px; height:34px; border-radius:50%; background:var(--d-accent); color:#fff; font-size:14px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:var(--d-font); }

.gfd-layout { display:flex; flex:1; overflow:hidden; }

.gfd-sidebar {
  width:220px; flex-shrink:0; background:var(--d-surface);
  border-right:1px solid var(--d-border);
  overflow-y:auto; display:flex; flex-direction:column; padding:12px 0 16px;
}
.gfd-sidebar::-webkit-scrollbar { width:4px; }
.gfd-sidebar::-webkit-scrollbar-thumb { background:var(--d-border); border-radius:2px; }
.gfd-ng { display:flex; flex-direction:column; padding:4px 10px 8px; }
.gfd-ng+.gfd-ng { border-top:1px solid var(--d-border); margin-top:4px; padding-top:10px; }
.gfd-ng.bot { margin-top:auto; }
.gfd-nl { font-size:9.5px; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:var(--d-muted); padding:0 8px; margin:0 0 4px; font-family:var(--d-font); }
.gfd-na {
  display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:8px;
  font-size:13px; font-weight:500; color:var(--d-muted); text-decoration:none;
  cursor:pointer; border:none; background:transparent; width:100%; text-align:left;
  font-family:var(--d-font); transition:background .12s,color .12s;
}
.gfd-na:hover,.gfd-na.active { background:color-mix(in srgb,var(--d-accent) 10%,transparent); color:var(--d-accent2); }
.gfd-na.sm { font-size:11.5px; opacity:.65; }
.gfd-na.sm:hover { opacity:1; }

.gfd-content { flex:1; overflow-y:auto; padding:28px 32px 56px; display:flex; flex-direction:column; gap:28px; }
.gfd-content::-webkit-scrollbar { width:5px; }
.gfd-content::-webkit-scrollbar-thumb { background:var(--d-border); border-radius:3px; }
.gfd-content::-webkit-scrollbar-thumb:hover { background:var(--d-accent); }

.gfd-hero {
  background:linear-gradient(135deg,color-mix(in srgb,var(--d-accent) 7%,var(--d-surface)),var(--d-surface) 70%);
  border:1px solid var(--d-border); border-radius:var(--d-r);
  padding:28px 32px; display:flex; align-items:flex-start;
  justify-content:space-between; gap:24px; flex-wrap:wrap;
}
.gfd-hero-left { flex:1; min-width:240px; }
.gfd-greet { font-size:13px; color:var(--d-muted); margin:0 0 6px; font-family:var(--d-font); }
.gfd-greet strong { color:var(--d-accent); font-weight:600; }
.gfd-htitle { font-size:26px; font-weight:800; color:var(--d-text); margin:0 0 8px; letter-spacing:-.025em; line-height:1.15; font-family:var(--d-font); }
.gfd-hsub { font-size:13.5px; color:var(--d-muted); margin:0; line-height:1.6; font-family:var(--d-font); }
.gfd-kpis { display:flex; gap:12px; flex-wrap:wrap; }
.gfd-kpi { display:flex; flex-direction:column; align-items:center; gap:5px; background:var(--d-surface); border:1px solid var(--d-border); border-radius:12px; padding:16px 20px; min-width:100px; box-shadow:0 1px 3px var(--d-shadow); text-align:center; }
.gfd-kpi-v { font-size:24px; font-weight:800; color:var(--d-text); line-height:1; font-family:var(--d-font); }
.gfd-kpi-l { font-size:10px; font-weight:600; color:var(--d-muted); text-transform:uppercase; letter-spacing:.06em; font-family:var(--d-font); }

.gfd-sec { display:flex; flex-direction:column; gap:14px; }
.gfd-sec-hd { display:flex; align-items:center; justify-content:space-between; }
.gfd-sec-title { font-size:14px; font-weight:700; color:var(--d-text); margin:0; display:flex; align-items:center; gap:8px; font-family:var(--d-font); }
.gfd-sec-title::before { content:""; display:block; width:3px; height:16px; background:var(--d-accent); border-radius:2px; }
.gfd-sec-link { font-size:12px; color:var(--d-accent); text-decoration:none; font-weight:600; font-family:var(--d-font); }
.gfd-sec-link:hover { text-decoration:underline; }

.gfd-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; }
.gfd-card {
  display:flex; align-items:center; gap:14px;
  background:var(--d-surface); border:1.5px solid var(--d-border);
  border-radius:var(--d-r); padding:16px 18px;
  text-decoration:none; color:var(--d-text); cursor:pointer;
  transition:transform .15s,box-shadow .15s,border-color .15s;
  position:relative; overflow:hidden; font-family:var(--d-font);
}
.gfd-card::before { content:""; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--card-acc,var(--d-accent)); opacity:0; transition:opacity .15s; border-radius:3px 0 0 3px; }
.gfd-card:hover { transform:translateY(-2px); box-shadow:0 6px 24px var(--d-shadow); border-color:color-mix(in srgb,var(--card-acc,var(--d-accent)) 35%,var(--d-border)); }
.gfd-card:hover::before { opacity:1; }
.gfd-card-ic { width:44px; height:44px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; background:color-mix(in srgb,var(--card-acc,var(--d-accent)) 12%,transparent); }
.gfd-card-info { flex:1; display:flex; flex-direction:column; gap:3px; min-width:0; }
.gfd-card-title { font-size:13.5px; font-weight:600; color:var(--d-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-family:var(--d-font); }
.gfd-card-desc { font-size:11.5px; color:var(--d-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-family:var(--d-font); }
.gfd-card-arr { color:var(--d-muted); font-size:16px; transition:color .15s,transform .15s; flex-shrink:0; }
.gfd-card:hover .gfd-card-arr { color:var(--card-acc,var(--d-accent)); transform:translateX(3px); }

.gfd-acts { background:var(--d-surface); border:1.5px solid var(--d-border); border-radius:var(--d-r); overflow:hidden; }
.gfd-act-row { display:flex; align-items:center; gap:14px; padding:13px 20px; border-bottom:1px solid var(--d-border); transition:background .12s; font-family:var(--d-font); }
.gfd-act-row:last-child { border-bottom:none; }
.gfd-act-row:hover { background:var(--d-hover); }
.gfd-act-dot { width:7px; height:7px; border-radius:50%; background:var(--d-accent); flex-shrink:0; }
.gfd-act-body { flex:1; min-width:0; }
.gfd-act-title { font-size:13px; font-weight:500; color:var(--d-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:0 0 2px; font-family:var(--d-font); }
.gfd-act-sub { font-size:11.5px; color:var(--d-muted); margin:0; font-family:var(--d-font); }
.gfd-act-time { font-size:11px; color:var(--d-muted); flex-shrink:0; white-space:nowrap; }
.gfd-act-empty { padding:28px; text-align:center; font-size:13px; color:var(--d-muted); font-family:var(--d-font); }
.gfd-sk { background:linear-gradient(90deg,var(--d-border) 25%,color-mix(in srgb,var(--d-border) 50%,transparent) 50%,var(--d-border) 75%); background-size:200% 100%; animation:gfdSk 1.4s infinite; border-radius:4px; }
@keyframes gfdSk { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

body[data-gf-tema="Black"] #gf-ui-overlay-root {
  --d-bg:#020617; --d-surface:#0f172a; --d-border:#1e293b;
  --d-text:#f1f5f9; --d-muted:#94a3b8;
  --d-accent:#22c55e; --d-accent2:#16a34a;
  --d-shadow:rgba(0,0,0,.4); --d-hover:#064e3b;
}
@media(max-width:900px) { .gfd-sidebar{display:none} .gfd-content{padding:18px 16px 40px} .gfd-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))} }
@media(max-width:600px) { .gfd-hero{padding:20px;flex-direction:column} .gfd-kpis{width:100%} .gfd-grid{grid-template-columns:1fr 1fr} .gfd-content{padding:14px 12px 40px;gap:20px} .gfd-topbar{padding:0 14px} }
"""


# ══════════════════════════════════════════════════════════════
# JS DO MODERN DESK
# ══════════════════════════════════════════════════════════════

DESK_JS = """
/* GF Modern Desk — JS v1.0 (ichis_theme_app unificado)
   Executado pelo gf_overlay.js após criar o container.
   window.gfCurrentPageData já contém os dados da página + cards. */

(function gfDeskRender() {
  var root = document.getElementById("gf-ui-overlay-root");
  if (!root || root.dataset.rendered === "1") return;
  root.dataset.rendered = "1";

  // Sincronizar variáveis --gf-* do tema para --d-* do overlay
  try {
    var cs = getComputedStyle(document.documentElement);
    [["--gf-font-main","--d-font"],["--gf-bg-main","--d-bg"],["--gf-bg-card","--d-surface"],
     ["--gf-border","--d-border"],["--gf-text-main","--d-text"],["--gf-text-secondary","--d-muted"],
     ["--gf-accent","--d-accent"],["--gf-accent-dark","--d-accent2"],
     ["--gf-shadow","--d-shadow"],["--gf-hover","--d-hover"]
    ].forEach(function(p){
      var v=cs.getPropertyValue(p[0]).trim();
      if(v){root.style.setProperty(p[1],v); if(p[0]==="--gf-font-main")root.style.fontFamily=v;}
    });
  } catch(e){}

  var page = window.gfCurrentPageData || {};
  var cards = (page.cards||[]).filter(function(c){return c.ativo!==0;});
  var settings = window.gfOverlaySettings || {};
  var showBack = settings.mostrar_botao_voltar_tela_original;

  var uName = "usuário", fName = "usuário";
  try { uName=(frappe.session.user||"").split("@")[0]||"usuário"; fName=frappe.session.full_name||frappe.boot.full_name||uName; } catch(e){}
  var h=new Date().getHours();
  var greet = h<12?"Bom dia":h<18?"Boa tarde":"Boa noite";
  var dateStr = new Date().toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short"});

  function cardHref(c){
    if(c.tipo_acao==="Abrir Doctype"&&c.doctype_destino) return "/app/"+c.doctype_destino.toLowerCase().replace(/\\s+/g,"-");
    if(c.tipo_acao==="Abrir URL"&&c.url_destino) return c.url_destino;
    return c.rota_destino||"#";
  }

  var cardsHtml = cards.length ? cards.map(function(c){
    var href=cardHref(c), acc=c.cor_icone||"var(--d-accent)", bg=c.cor_fundo||"transparent";
    var tgt=c.abrir_em_nova_aba?' target="_blank"':"";
    return '<a class="gfd-card" href="'+href+'"'+tgt+' onclick="return gfNav(\\''+href+'\\',event)" style="--card-acc:'+acc+'">'+
      '<div class="gfd-card-ic" style="background:'+bg+'">'+( c.icone||"📌")+'</div>'+
      '<div class="gfd-card-info"><span class="gfd-card-title">'+(c.titulo||"")+'</span><span class="gfd-card-desc">'+(c.descricao||"")+'</span></div>'+
      '<span class="gfd-card-arr">→</span></a>';
  }).join("") : _defCards();

  var sk=""; for(var i=0;i<5;i++) sk+='<div class="gfd-act-row"><div class="gfd-sk" style="width:7px;height:7px;border-radius:50%;flex-shrink:0"></div><div class="gfd-act-body"><div class="gfd-sk" style="height:13px;width:55%;margin-bottom:5px"></div><div class="gfd-sk" style="height:11px;width:35%"></div></div><div class="gfd-sk" style="height:11px;width:28px"></div></div>';

  root.innerHTML =
    '<div class="gfd-topbar">'+
      '<span class="gfd-brand">&#127807; GREENFARMS</span>'+
      '<div class="gfd-search-wrap">'+
        '<span class="gfd-search-ico">&#128269;</span>'+
        '<input id="gfd-si" class="gfd-search-inp" type="text" placeholder="Buscar no sistema... (pressione /)" autocomplete="off"/>'+
        '<span class="gfd-search-kbd">Enter</span>'+
      '</div>'+
      '<div class="gfd-user" title="'+uName+'">'+fName.charAt(0).toUpperCase()+'</div>'+
    '</div>'+
    '<div class="gfd-layout">'+
      '<nav class="gfd-sidebar">'+
        '<div class="gfd-ng"><p class="gfd-nl">Início</p>'+
        '<a class="gfd-na active" href="/app" onclick="return gfNav(\\'/app\\',event)">&#127968; Início</a></div>'+
        '<div class="gfd-ng"><p class="gfd-nl">Operações</p>'+
        '<a class="gfd-na" href="/app/selling"      onclick="return gfNav(\\'/app/selling\\',event)">&#128722; Vendas</a>'+
        '<a class="gfd-na" href="/app/buying"       onclick="return gfNav(\\'/app/buying\\',event)">&#128230; Compras</a>'+
        '<a class="gfd-na" href="/app/stock"        onclick="return gfNav(\\'/app/stock\\',event)">&#127981; Estoque</a>'+
        '<a class="gfd-na" href="/app/accounts"     onclick="return gfNav(\\'/app/accounts\\',event)">&#128176; Financeiro</a>'+
        '<a class="gfd-na" href="/app/hr"           onclick="return gfNav(\\'/app/hr\\',event)">&#128101; RH</a>'+
        '<a class="gfd-na" href="/app/project"      onclick="return gfNav(\\'/app/project\\',event)">&#128203; Projetos</a>'+
        '<a class="gfd-na" href="/app/crm"          onclick="return gfNav(\\'/app/crm\\',event)">&#129309; CRM</a></div>'+
        '<div class="gfd-ng"><p class="gfd-nl">Análises</p>'+
        '<a class="gfd-na" href="/app/query-report" onclick="return gfNav(\\'/app/query-report\\',event)">&#128202; Relatórios</a></div>'+
        '<div class="gfd-ng bot"><p class="gfd-nl">Sistema</p>'+
        '<a class="gfd-na" href="/app/setup"        onclick="return gfNav(\\'/app/setup\\',event)">&#9881;&#65039; Configurações</a>'+
        '<a class="gfd-na" href="/app/gf-theme-settings" onclick="return gfNav(\\'/app/gf-theme-settings\\',event)">&#127912; Tema Visual</a>'+
        (showBack?'<button class="gfd-na sm" onclick="gfReturnToOriginalDesk()">&#8617; Desk Original</button>':'')+
        '</div>'+
      '</nav>'+
      '<main class="gfd-content">'+
        '<div class="gfd-hero">'+
          '<div class="gfd-hero-left">'+
            '<p class="gfd-greet">'+greet+', <strong>'+fName+'</strong> &#128075;</p>'+
            '<h1 class="gfd-htitle">'+(page.titulo_pagina||"Central de Gestão GREENFARMS")+'</h1>'+
            '<p class="gfd-hsub">'+(page.texto_boas_vindas||"Gerencie sua operação com eficiência e clareza.")+'</p>'+
          '</div>'+
          '<div class="gfd-kpis">'+
            '<div class="gfd-kpi"><span class="gfd-kpi-v" id="gfd-kpi-notif">—</span><span class="gfd-kpi-l">Notificações</span></div>'+
            '<div class="gfd-kpi"><span class="gfd-kpi-v" id="gfd-kpi-date">'+dateStr+'</span><span class="gfd-kpi-l">Hoje</span></div>'+
          '</div>'+
        '</div>'+
        '<div class="gfd-sec"><div class="gfd-sec-hd"><h2 class="gfd-sec-title">Módulos</h2></div>'+
        '<div class="gfd-grid">'+cardsHtml+'</div></div>'+
        '<div class="gfd-sec"><div class="gfd-sec-hd">'+
          '<h2 class="gfd-sec-title">Atividades Recentes</h2>'+
          '<a class="gfd-sec-link" href="/app/activity" onclick="return gfNav(\\'/app/activity\\',event)">Ver todas →</a>'+
        '</div><div class="gfd-acts" id="gfd-ap">'+sk+'</div></div>'+
      '</main>'+
    '</div>';

  // Busca global
  var si = document.getElementById("gfd-si");
  if(si){
    si.addEventListener("keydown",function(e){
      if(e.key!=="Enter")return; var q=si.value.trim(); if(!q)return; e.preventDefault();
      try{ if(typeof frappe!=="undefined"&&frappe.utils&&frappe.utils.global_search)frappe.utils.global_search(q);
           else window.location.href="/app?q="+encodeURIComponent(q); }
      catch(ex){window.location.href="/app?q="+encodeURIComponent(q);}
    });
    document.addEventListener("keydown",function(e){
      if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)){e.preventDefault();si.focus();si.select();}
    });
  }

  // Notificações
  try{
    if(typeof frappe!=="undefined"&&frappe.call)
      frappe.call({method:"frappe.client.get_count",
        args:{doctype:"Notification Log",filters:[["read","=",0]]},
        callback:function(r){var el=document.getElementById("gfd-kpi-notif");if(el&&r!==undefined)el.textContent=r.message||"0";},error:function(){}});
  }catch(e){}

  // Atividades
  try{
    if(typeof frappe!=="undefined"&&frappe.call)
      frappe.call({method:"frappe.client.get_list",
        args:{doctype:"Activity Log",fields:["subject","full_name","user","creation"],
              filters:[["user","=",frappe.session.user]],limit:7,order_by:"creation desc"},
        callback:function(r){
          var p=document.getElementById("gfd-ap"); if(!p)return;
          var items=(r&&r.message)?r.message:[];
          if(!items.length){p.innerHTML='<div class="gfd-act-empty">Nenhuma atividade recente.</div>';return;}
          p.innerHTML=items.map(function(a){
            var d=(Date.now()-new Date(a.creation).getTime())/1000;
            var t=d<60?"agora":d<3600?Math.floor(d/60)+"min":d<86400?Math.floor(d/3600)+"h":Math.floor(d/86400)+"d";
            return '<div class="gfd-act-row"><div class="gfd-act-dot"></div><div class="gfd-act-body">'+
              '<p class="gfd-act-title">'+(a.subject||"Atividade")+'</p>'+
              '<p class="gfd-act-sub">'+(a.full_name||a.user||"")+'</p></div>'+
              '<span class="gfd-act-time">'+t+'</span></div>';
          }).join("");},error:function(){}});
  }catch(e){}

  function _defCards(){
    return [{t:"Vendas",d:"Pedidos e faturamento",i:"\\uD83D\\uDED2",r:"/app/selling",c:"#16a34a"},
      {t:"Compras",d:"Fornecedores e recebimentos",i:"\\uD83D\\uDCE6",r:"/app/buying",c:"#2563eb"},
      {t:"Estoque",d:"Produtos e armazéns",i:"\\uD83C\\uDFED",r:"/app/stock",c:"#ca8a04"},
      {t:"Financeiro",d:"Contas e pagamentos",i:"\\uD83D\\uDCB0",r:"/app/accounts",c:"#db2777"},
      {t:"Projetos",d:"Tarefas e cronogramas",i:"\\uD83D\\uDCCB",r:"/app/project",c:"#7c3aed"},
      {t:"CRM",d:"Leads e oportunidades",i:"\\uD83E\\uDD1D",r:"/app/crm",c:"#ea580c"},
      {t:"RH",d:"Colaboradores e folha",i:"\\uD83D\\uDC65",r:"/app/hr",c:"#0369a1"},
      {t:"Relatórios",d:"Análises gerenciais",i:"\\uD83D\\uDCCA",r:"/app/query-report",c:"#15803d"},
      {t:"Configurações",d:"Administração",i:"\\u2699\\uFE0F",r:"/app/setup",c:"#374151"},
    ].map(function(d){
      return '<a class="gfd-card" href="'+d.r+'" onclick="return gfNav(\\''+d.r+'\\',event)" style="--card-acc:'+d.c+'">'+
        '<div class="gfd-card-ic">'+d.i+'</div>'+
        '<div class="gfd-card-info"><span class="gfd-card-title">'+d.t+'</span><span class="gfd-card-desc">'+d.d+'</span></div>'+
        '<span class="gfd-card-arr">→</span></a>';
    }).join("");
  }
})();
"""


# ══════════════════════════════════════════════════════════════
# CARDS PADRÃO
# ══════════════════════════════════════════════════════════════

DESK_CARDS = [
    {"titulo":"Vendas",        "descricao":"Pedidos, clientes e faturamento",    "icone":"🛒","tipo_acao":"Abrir Rota",   "rota_destino":"/app/selling",      "cor_fundo":"#f0fdf4","cor_icone":"#16a34a","ordem":1, "ativo":1,"abrir_em_nova_aba":0},
    {"titulo":"Compras",       "descricao":"Fornecedores e recebimentos",        "icone":"📦","tipo_acao":"Abrir Rota",   "rota_destino":"/app/buying",       "cor_fundo":"#eff6ff","cor_icone":"#2563eb","ordem":2, "ativo":1,"abrir_em_nova_aba":0},
    {"titulo":"Estoque",       "descricao":"Produtos, armazéns e movimentações", "icone":"🏭","tipo_acao":"Abrir Rota",   "rota_destino":"/app/stock",        "cor_fundo":"#fefce8","cor_icone":"#ca8a04","ordem":3, "ativo":1,"abrir_em_nova_aba":0},
    {"titulo":"Financeiro",    "descricao":"Contas, pagamentos e conciliação",   "icone":"💰","tipo_acao":"Abrir Rota",   "rota_destino":"/app/accounts",     "cor_fundo":"#fdf2f8","cor_icone":"#db2777","ordem":4, "ativo":1,"abrir_em_nova_aba":0},
    {"titulo":"Projetos",      "descricao":"Tarefas, cronogramas e equipes",     "icone":"📋","tipo_acao":"Abrir Rota",   "rota_destino":"/app/project",      "cor_fundo":"#f5f3ff","cor_icone":"#7c3aed","ordem":5, "ativo":1,"abrir_em_nova_aba":0},
    {"titulo":"CRM",           "descricao":"Leads, oportunidades e contatos",    "icone":"🤝","tipo_acao":"Abrir Rota",   "rota_destino":"/app/crm",          "cor_fundo":"#fff7ed","cor_icone":"#ea580c","ordem":6, "ativo":1,"abrir_em_nova_aba":0},
    {"titulo":"RH",            "descricao":"Colaboradores, folha e benefícios",  "icone":"👥","tipo_acao":"Abrir Rota",   "rota_destino":"/app/hr",           "cor_fundo":"#f0f9ff","cor_icone":"#0369a1","ordem":7, "ativo":1,"abrir_em_nova_aba":0},
    {"titulo":"Relatórios",    "descricao":"Análises e relatórios gerenciais",   "icone":"📊","tipo_acao":"Abrir Rota",   "rota_destino":"/app/query-report", "cor_fundo":"#f0fdf4","cor_icone":"#15803d","ordem":8, "ativo":1,"abrir_em_nova_aba":0},
    {"titulo":"Configurações", "descricao":"Administração e configurações",      "icone":"⚙️","tipo_acao":"Abrir Rota",   "rota_destino":"/app/setup",        "cor_fundo":"#f8fafc","cor_icone":"#374151","ordem":9, "ativo":1,"abrir_em_nova_aba":0},
    {"titulo":"Tema Visual",   "descricao":"Cores, fontes e identidade visual",  "icone":"🎨","tipo_acao":"Abrir Doctype","doctype_destino":"GF Theme Settings","cor_fundo":"#fdf4ff","cor_icone":"#a21caf","ordem":10,"ativo":1,"abrir_em_nova_aba":0},
]
