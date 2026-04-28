# ICHIS Theme App

Tema inspirado no Aura, adaptado para ERPNext/Frappe v16 com foco em regras genéricas e seguras.

## O que este pacote controla

- Cores globais do Desk
- Tema claro e escuro
- Navbar superior
- Sidebar e menus
- Área central
- Cards e widgets
- Formulários
- Modais
- Dropdowns
- Alertas
- Workspace
- Kanban
- Calendário
- Tabelas, grids, List View, Report View e Datatable
- Botões principais, secundários, pequenos e estados hover/focus/disabled
- Labels, campos obrigatórios, textos de ajuda, badges, pills e indicadores

## Arquivos principais

- `gf_aura_tokens.css`: variáveis globais do tema.
- `gf_aura_desk_safe.css`: regras visuais aplicadas ao Desk.
- `gf_aura_loader.js`: reforço para carregar os CSS dentro do Desk.
- `hooks.py`: registra CSS e JS no Frappe.

## Onde ajustar as tabelas

Edite em `public/css/gf_aura_tokens.css`:

```css
--gf-table-font-size: 12px;
--gf-table-line-height: 1.25;
--gf-table-padding-y: 5px;
--gf-table-padding-x: 8px;
--gf-table-header-padding-y: 7px;
--gf-table-header-padding-x: 8px;
```

Para deixar as linhas mais juntas, reduza principalmente:

```css
--gf-table-padding-y: 3px;
--gf-table-line-height: 1.15;
```

## Onde ajustar os botões

Edite em `public/css/gf_aura_tokens.css`:

```css
--gf-btn-font-size: 13px;
--gf-btn-padding-y: 7px;
--gf-btn-padding-x: 12px;
--gf-btn-radius: 8px;
--gf-btn-primary-bg: var(--gf-primary);
--gf-btn-primary-hover-bg: var(--gf-primary-dark);
```

## Onde ajustar os labels

Edite em `public/css/gf_aura_tokens.css`:

```css
--gf-label-font-size: 11px;
--gf-label-font-weight: 600;
--gf-label-margin-bottom: 4px;
--gf-field-help-font-size: 10px;
```

## Instalação no Frappe Cloud

1. Suba este app para um repositório GitHub.
2. Instale o app no site pelo Frappe Cloud.
3. Aguarde o build automático.
4. Limpe o cache do navegador.

## Observação

Este pacote evita copiar telas específicas do Aura. Ele usa apenas uma base segura de aparência global, com foco em compatibilidade e manutenção.
