# ICHIS Theme App para ERPNext

Camada visual moderna para ERPNext/Frappe Cloud, com tema global e Home principal customizada no estilo portal corporativo.

## Objetivo

O app ICHIS aplica uma camada visual sobre o ERPNext sem alterar o core do sistema.

Ele preserva a barra superior nativa do ERPNext, incluindo busca, notificações, avatar e menus, e substitui apenas o conteúdo central do Workspace inicial por uma Home moderna e organizada.

## Estrutura

```text
ichis/
    ichis/
        __init__.py
        hooks.py
    public/
        css/
            gf_theme.css
        js/
            gf_global.js
    README.md
    setup.py
    pyproject.toml
    MANIFEST.in
```

## Arquivos principais

### `ichis/hooks.py`

Registra os arquivos globais no Desk:

```python
app_include_css = "/assets/ichis/css/gf_theme.css"
app_include_js = "/assets/ichis/js/gf_global.js"
```

### `public/css/gf_theme.css`

Contém:

- variáveis globais de cor;
- fonte padrão;
- ajustes visuais leves em formulários, botões, grids e cards;
- estilos completos da Home principal ICHIS.

### `public/js/gf_global.js`

Contém:

- controle de ativação da Home;
- detecção de rota do Workspace;
- renderização da Home;
- cards principais por área;
- navegação interna com `frappe.set_route`;
- fallback seguro.

## Como personalizar cores

Abra:

```text
public/css/gf_theme.css
```

Altere as variáveis em `:root`:

```css
--gf-primary: #0f766e;
--gf-accent: #2563eb;
--gf-bg-page: #f4f7fb;
```

## Como personalizar fonte

No mesmo arquivo, altere:

```css
--gf-font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
```

## Como adicionar novo card

Abra:

```text
public/js/gf_global.js
```

Localize `GF_HOME_SECTIONS` e adicione um novo item:

```javascript
{ title: "Novo Acesso", description: "Descrição do acesso.", icon: "⭐", route: ["List", "Nome do DocType"] }
```

## Como desativar temporariamente a Home customizada

Abra:

```text
public/js/gf_global.js
```

Altere:

```javascript
const GF_ENABLE_CUSTOM_HOME = true;
```

para:

```javascript
const GF_ENABLE_CUSTOM_HOME = false;
```

## Como ativar logs para teste

Altere:

```javascript
const GF_DEBUG = false;
```

para:

```javascript
const GF_DEBUG = true;
```

## Instalação no Frappe Cloud

1. Suba este app para um repositório GitHub.
2. No Frappe Cloud, adicione o app customizado na Bench.
3. Instale o app no site desejado.
4. Rode build/restart conforme o painel solicitar.
5. Limpe cache do site.

## Cuidados

- Este app não altera o core do ERPNext.
- A barra superior padrão é preservada.
- A Home é aplicada apenas em rotas de Workspace definidas no JavaScript.
- Caso o ERPNext altere classes internas em futuras versões, o script possui fallback para não travar o sistema.

## Versão

0.0.1
