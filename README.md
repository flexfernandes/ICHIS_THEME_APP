# GF Theme Control — GREENFARMS

**Central Administrativa de Identidade Visual do ERPNext**

App Frappe/ERPNext para controle visual completo do sistema via Doctype administrativo.

---

## O que este app faz

- Controla globalmente cores, fontes, tamanhos, grids, tabelas, botões, campos, cards, navbar, sidebar, modal e login do ERPNext
- Dois temas completos: **Padrão** (claro) e **Black** (escuro)
- Substituição automática de logomarcas do ERPNext/Frappe pela identidade visual da empresa
- Configuração 100% via Doctype (sem editar CSS ou JS manualmente)
- Funciona imediatamente após instalação (valores padrão elegantes aplicados via `after_install`)

---

## Estrutura do App

```
ichis_theme_control/
├── ichis_theme_control/
│   ├── __init__.py
│   ├── hooks.py                          ← configuração central do app
│   ├── install.py                        ← popula defaults após instalação
│   ├── modules.txt
│   ├── patches.txt
│   ├── api/
│   │   ├── __init__.py
│   │   └── theme.py                      ← API Python (get_public_theme_settings, get_theme_settings, get_css_variables)
│   ├── doctype/
│   │   └── gf_theme_settings/
│   │       ├── __init__.py
│   │       ├── gf_theme_settings.json    ← definição do Doctype Single
│   │       └── gf_theme_settings.py      ← classe do documento
│   └── public/
│       ├── css/
│       │   └── gf_theme_control.css      ← variáveis CSS + seletores ERPNext
│       ├── js/
│       │   └── gf_theme_control.js       ← loader, aplicador de tema, substituição de logos
│       └── images/
│           └── app_underline_logo.png    ← logo padrão de fallback (SUBSTITUA pela logo real)
├── pyproject.toml
├── setup.py
├── MANIFEST.in
├── requirements.txt
└── README.md
```

---

## Instalação no Frappe Cloud

### 1. Hospedar o app em repositório Git

Faça upload deste app para um repositório Git (GitHub, GitLab, Bitbucket).

Exemplo:
```
https://github.com/suaempresa/ichis_theme_control
```

### 2. Adicionar o app ao site no Frappe Cloud

1. Acesse o painel do Frappe Cloud
2. Vá em **Sites → seu site → Apps**
3. Clique em **Add App**
4. Informe o repositório Git do app
5. Confirme a instalação

O Frappe Cloud executará automaticamente:
```
bench get-app <repositorio>
bench --site <seusite> install-app ichis_theme_control
bench --site <seusite> migrate
bench build
```

### 3. Instalação manual (self-hosted)

```bash
# Obter o app
bench get-app ichis_theme_control https://github.com/suaempresa/ichis_theme_control

# Instalar no site
bench --site seusite.com install-app ichis_theme_control

# Migrar banco de dados
bench --site seusite.com migrate

# Build dos assets
bench build --app ichis_theme_control

# Reiniciar
bench restart
```

---

## Configuração após instalação

1. Acesse o ERPNext como **System Manager**
2. Navegue até: **GF Theme Settings** (pesquise na barra de busca)
3. Configure conforme necessário:
   - Escolha o **Tema Ativo** (Padrão ou Black)
   - Faça upload das **Logomarcas**
   - Ajuste **Cores, Fontes, Grids, Botões** etc.
4. Salve o documento
5. Recarregue a página do navegador

---

## Logo Padrão de Fallback

O arquivo `public/images/app_underline_logo.png` é o fallback visual do sistema.

**IMPORTANTE:** Substitua este arquivo pela logomarca real da empresa antes de publicar o app.

O arquivo deve ser uma imagem PNG com fundo transparente, preferencialmente com dimensões entre 200×60px e 400×120px.

---

## Diagnóstico no Console do Navegador

Após instalação, abra o Console do navegador (F12) e verifique:

```javascript
// Confirma que o script carregou
window.gfThemeVersion
// → "GF_THEME_CONTROL_V1"

window.gfThemeControlLoaded
// → true
```

---

## API Python disponível

| Método | Acesso | Descrição |
|--------|--------|-----------|
| `ichis_theme_control.api.theme.get_public_theme_settings` | `allow_guest=True` | Configurações para tela de login |
| `ichis_theme_control.api.theme.get_theme_settings` | Logado | Todas as configurações do tema ativo |
| `ichis_theme_control.api.theme.get_css_variables` | Logado | String CSS com variáveis calculadas |

---

## Observações Técnicas

- **Não altera o core do ERPNext** — usa apenas hooks, assets e Doctype próprio
- **Não depende de CDN externa** — todo CSS e JS é servido localmente
- **Compatível com Frappe Cloud** — estrutura validada com app de referência aceito pelo Cloud
- **Seguro** — todos os métodos JS têm try/catch; falhas não quebram o ERPNext
- **Sem sobrescrita** — `after_install` respeita configurações já existentes em reinstalações
- **MutationObserver** — garante substituição de logos em elementos carregados dinamicamente

---

## App de Referência Estrutural

O arquivo `ICHIS_THEME_APP.zip` fornecido foi usado **somente como referência estrutural** para garantir compatibilidade com o Frappe Cloud. Nenhuma lógica funcional, CSS visual ou regras daquele app foram copiadas.

---

## Autor

GREENFARMS — contato@greenfarms.com.br
