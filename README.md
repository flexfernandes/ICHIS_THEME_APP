# ICHIS Theme App para ERPNext

Camada visual moderna para ERPNext/Frappe Cloud com tema global e Home principal customizada.

## Objetivo

Este app aplica uma identidade visual moderna ao ERPNext sem alterar o core do sistema.

## Estrutura

```text
ICHIS_THEME_APP/
├── ichis/
│   ├── __init__.py
│   ├── hooks.py
│   ├── patches.txt
│   └── public/
│       ├── css/
│       │   └── gf_theme.css
│       └── js/
│           └── gf_global.js
├── MANIFEST.in
├── README.md
├── pyproject.toml
└── setup.py
```

## Instalação no Frappe Cloud

1. Subir este projeto para o GitHub.
2. Adicionar o app no Private Bench.
3. Fazer Deploy do Bench.
4. Instalar o app no Site.
5. Limpar cache e reiniciar o site.

## Personalização

### Alterar cores

Edite as variáveis no início do arquivo:

```css
ichis/public/css/gf_theme.css
```

### Ativar ou desativar a Home

Edite no arquivo:

```javascript
ichis/public/js/gf_global.js
```

```javascript
const GF_ENABLE_CUSTOM_HOME = true;
```

Troque para `false` para manter o Workspace padrão do ERPNext.

## Segurança

Este app não altera arquivos nativos do ERPNext.
Toda a customização é aplicada como camada visual por CSS e JavaScript globais.
