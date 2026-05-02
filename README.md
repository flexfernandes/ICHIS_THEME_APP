# GF Theme App — GREENFARMS (app unificado)

App único que integra o controle de identidade visual e o sistema de UI Overlay do ERPNext.

## O que este app faz

**Módulo 1 — GF Theme Control**
- Controla cores, fontes, tamanhos, grids, tabelas, botões, campos, cards e login via Doctype Single `GF Theme Settings`
- Aplica variáveis CSS `--gf-*` globalmente no `:root`
- Substitui logomarcas do ERPNext via MutationObserver
- Dois temas completos: Padrão (claro) e Black (escuro)

**Módulo 2 — GF UI Overlay**
- Intercepta rotas do ERPNext (SPA) e substitui telas por páginas modernas
- Modern Desk corporativo com sidebar, cards de módulos, barra de busca, KPIs e atividades recentes
- Configurável por Doctype (`GF UI Overlay Page` + `GF UI Overlay Card`)
- Fallback seguro para o Desk original

## Estrutura

```
ichis_theme_app/
├── ichis_theme_app/
│   ├── hooks.py                    ← carrega CSS/JS na ordem correta
│   ├── install.py                  ← popula GF Theme Settings + GF Modern Desk
│   ├── modules.txt                 ← "Gf Theme Control" + "Gf Ui Overlay"
│   ├── api/
│   │   └── theme.py                ← API unificada (tema + overlay)
│   ├── gf_theme_control/
│   │   └── doctype/
│   │       └── gf_theme_settings/  ← Single Doctype de tema
│   ├── gf_ui_overlay/
│   │   └── doctype/
│   │       ├── gf_ui_overlay_settings/  ← Single Doctype de overlay
│   │       ├── gf_ui_overlay_page/      ← Cadastro de páginas
│   │       └── gf_ui_overlay_card/      ← Child: cards de atalho
│   └── public/
│       ├── css/
│       │   ├── gf_theme.css        ← variáveis CSS --gf-* + seletores ERPNext
│       │   └── gf_overlay.css      ← boot-hiding + container overlay
│       ├── js/
│       │   ├── gf_theme.js         ← aplica tema e logos via API
│       │   └── gf_overlay.js       ← intercepta rota e renderiza Modern Desk
│       └── images/
│           └── app_underline_logo.png  ← ⚠️ SUBSTITUIR pela logo real
```

## Instalação no Frappe Cloud

```
1. Publicar em repositório Git
2. Frappe Cloud → Sites → Apps → Add App
3. Informar o repositório Git
```

**Self-hosted:**
```bash
bench get-app ichis_theme_app <url-do-repo>
bench --site seusite.com install-app ichis_theme_app
bench --site seusite.com migrate
bench build --app ichis_theme_app
bench restart
```

## Recriar dados padrão (após reinstalação)

```python
# No console bench (bench console)
from ichis_theme_app.install import after_install
after_install()
```

## API

| Método | Acesso | Descrição |
|---|---|---|
| `ichis_theme_app.api.theme.get_public_theme_settings` | allow_guest | Login: logo, cores |
| `ichis_theme_app.api.theme.get_theme_settings` | logado | Todas as configs de tema |
| `ichis_theme_app.api.theme.get_css_variables` | logado | String CSS com --gf-* |
| `ichis_theme_app.api.theme.get_overlay_settings` | logado | Config global de overlay |
| `ichis_theme_app.api.theme.get_active_overlay_pages` | logado | Páginas ativas com cards |

## Diagnóstico

```javascript
// Console do navegador
window.gfThemeVersion      // "GF_THEME_CONTROL_V1"
window.gfThemeControlLoaded // true
window.gfOverlayVersion    // "GF_OVERLAY"
window.gfOverlayLoaded     // true
window.gfCurrentRoute      // rota atual
window.gfCurrentPageData   // dados da página ativa
window.gfOverlayPages      // array de páginas carregadas
```

---
GREENFARMS — contato@greenfarms.com.br
