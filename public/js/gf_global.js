/* ============================================================================
   ICHIS / GREEN FARMS - JAVASCRIPT GLOBAL PARA ERPNEXT
   ============================================================================

   Objetivo:
   Criar uma nova Home principal para o ERPNext, renderizada como camada visual
   sobre o conteúdo central do Workspace inicial, sem alterar o core.

   O que este arquivo faz:
   1. Aguarda o carregamento do Frappe Desk.
   2. Monitora mudanças de rota.
   3. Identifica quando o usuário está no Workspace inicial.
   4. Substitui apenas o conteúdo central por uma Home corporativa moderna.
   5. Preserva a barra superior padrão, busca, notificações e avatar.

   Cuidados:
   - Não remove Workspaces nativos.
   - Não altera arquivos internos do ERPNext.
   - Não interfere em formulários, listas ou relatórios.
   - Possui chave de ativação para desligar a Home customizada.
============================================================================ */

(function () {
    "use strict";

    /* ------------------------------------------------------------------------
       1. CONFIGURAÇÕES GERAIS
       ------------------------------------------------------------------------
       GF_ENABLE_CUSTOM_HOME:
       - true: ativa a Home customizada.
       - false: mantém o Workspace padrão do ERPNext.

       GF_DEBUG:
       - true: exibe logs no console para testes.
       - false: operação silenciosa em uso normal.
    ------------------------------------------------------------------------ */
    const GF_ENABLE_CUSTOM_HOME = true;
    const GF_DEBUG = false;

    /* ------------------------------------------------------------------------
       2. LISTA DE ROTAS CONSIDERADAS COMO HOME PRINCIPAL
       ------------------------------------------------------------------------
       Ajuste esta lista conforme o nome real do Workspace que abre após login.
       Em muitas instalações, a rota inicial pode ser:
       - workspace
       - workspace/Home
       - workspace/ERPNext
       - workspace/Desk
       - workspace/Projects

       O app só renderiza a Home customizada quando a rota atual estiver nessa
       lista ou quando for um Workspace raiz sem subtítulo definido.
    ------------------------------------------------------------------------ */
    const GF_HOME_WORKSPACES = [
        "Home",
        "ERPNext",
        "Desk",
        "Workspace",
        "Projects"
    ];

    /* ------------------------------------------------------------------------
       3. CATÁLOGO DE CARDS DA HOME
       ------------------------------------------------------------------------
       Cada item abaixo cria um card clicável.

       Campos:
       - title: título exibido no card.
       - description: breve explicação para o operador.
       - icon: símbolo simples em texto, sem dependência externa.
       - route: rota interna chamada com frappe.set_route.

       Para adicionar novos cards, copie um item e ajuste title, description,
       icon e route.
    ------------------------------------------------------------------------ */
    const GF_HOME_SECTIONS = [
        {
            title: "Operação Comercial",
            subtitle: "Acessos mais usados no fluxo de vendas e relacionamento.",
            cards: [
                { title: "Clientes", description: "Cadastro e consulta de clientes.", icon: "👥", route: ["List", "Customer"] },
                { title: "Orçamentos de Venda", description: "Propostas comerciais enviadas a clientes.", icon: "📄", route: ["List", "Quotation"] },
                { title: "Pedidos de Venda", description: "Pedidos confirmados e acompanhamento comercial.", icon: "🧾", route: ["List", "Sales Order"] },
                { title: "Faturas de Venda", description: "Emissão e gestão de faturamento de venda.", icon: "💳", route: ["List", "Sales Invoice"] }
            ]
        },
        {
            title: "Compras e Fornecedores",
            subtitle: "Fluxo de suprimentos, fornecedores, compras e recebimentos.",
            cards: [
                { title: "Fornecedores", description: "Cadastro e consulta de fornecedores.", icon: "🏭", route: ["List", "Supplier"] },
                { title: "Orçamentos de Compra", description: "Cotações e solicitações junto a fornecedores.", icon: "📑", route: ["List", "Supplier Quotation"] },
                { title: "Pedidos de Compra", description: "Pedidos emitidos para fornecedores.", icon: "🛒", route: ["List", "Purchase Order"] },
                { title: "Faturas de Compra", description: "Lançamento e controle de contas a pagar.", icon: "📥", route: ["List", "Purchase Invoice"] }
            ]
        },
        {
            title: "Produção, Estoque e Projetos",
            subtitle: "Controle operacional da empresa, materiais, fabricação e projetos.",
            cards: [
                { title: "Itens", description: "Cadastro de produtos, peças, serviços e materiais.", icon: "🏷️", route: ["List", "Item"] },
                { title: "Estoque", description: "Movimentações e saldo de materiais.", icon: "📦", route: ["workspace", "Stock"] },
                { title: "Ordens de Produção", description: "Acompanhamento de fabricação e manufatura.", icon: "⚙️", route: ["List", "Work Order"] },
                { title: "Projetos", description: "Gestão de projetos, etapas e atividades.", icon: "📊", route: ["List", "Project"] }
            ]
        },
        {
            title: "Gestão e Relatórios",
            subtitle: "Visão gerencial, contabilidade, qualidade e indicadores.",
            cards: [
                { title: "Contabilidade", description: "Área fiscal, contábil e financeira.", icon: "📚", route: ["workspace", "Accounting"] },
                { title: "Qualidade", description: "Controle de qualidade e inspeções.", icon: "✅", route: ["workspace", "Quality"] },
                { title: "Relatórios", description: "Acesso aos relatórios principais do ERPNext.", icon: "📈", route: ["query-report"] },
                { title: "Fabricação", description: "Módulo completo de manufatura.", icon: "🏗️", route: ["workspace", "Manufacturing"] }
            ]
        }
    ];

    /* ------------------------------------------------------------------------
       4. ÁREA SECUNDÁRIA
       ------------------------------------------------------------------------
       Opções menos usadas ficam em uma seção inferior, sem disputar atenção
       com as rotinas principais da empresa.
    ------------------------------------------------------------------------ */
    const GF_ADMIN_CARDS = [
        { title: "Configurações ERPNext", description: "Ajustes gerais do sistema.", icon: "🔧", route: ["workspace", "ERPNext Settings"] },
        { title: "Organização", description: "Empresa, filiais, departamentos e estrutura.", icon: "🏢", route: ["workspace", "Organization"] },
        { title: "Framework", description: "Recursos técnicos do Frappe Framework.", icon: "🧩", route: ["workspace", "Framework"] },
        { title: "Permissões", description: "Usuários, perfis e regras de acesso.", icon: "🔐", route: ["List", "Role"] },
        { title: "Integrações", description: "Ferramentas conectadas e automações.", icon: "🔗", route: ["List", "Connected App"] }
    ];

    /* ------------------------------------------------------------------------
       5. FUNÇÃO DE LOG CONTROLADO
    ------------------------------------------------------------------------ */
    function gfLog(message, data) {
        if (!GF_DEBUG) return;
        if (data !== undefined) {
            console.log(`[ICHIS] ${message}`, data);
        } else {
            console.log(`[ICHIS] ${message}`);
        }
    }

    /* ------------------------------------------------------------------------
       6. VERIFICA SE A ROTA ATUAL É A HOME QUE SERÁ SOBREPOSTA
       ------------------------------------------------------------------------
       A função é conservadora: só atua em Workspace.
       Isso evita interferir em formulários, listas, relatórios e outras telas.
    ------------------------------------------------------------------------ */
    function gfIsHomeWorkspaceRoute() {
        const route = frappe.get_route ? frappe.get_route() : [];

        if (!route || route[0] !== "workspace") {
            return false;
        }

        const workspaceName = route[1];

        if (!workspaceName) {
            return true;
        }

        return GF_HOME_WORKSPACES.includes(workspaceName);
    }

    /* ------------------------------------------------------------------------
       7. LOCALIZA O CONTAINER CENTRAL DO ERPNEXT
       ------------------------------------------------------------------------
       Esta função tenta encontrar a área central onde o conteúdo do Workspace
       é exibido. Se o ERPNext mudar alguma classe no futuro, o fallback evita
       que o sistema quebre.
    ------------------------------------------------------------------------ */
    function gfGetMainContainer() {
        return (
            document.querySelector(".layout-main-section") ||
            document.querySelector(".page-content") ||
            document.querySelector("main")
        );
    }

    /* ------------------------------------------------------------------------
       8. NAVEGAÇÃO INTERNA SEGURA
       ------------------------------------------------------------------------
       Usa frappe.set_route, preservando a navegação original do ERPNext.
    ------------------------------------------------------------------------ */
    function gfGoTo(route) {
        if (!route || !Array.isArray(route)) return;
        frappe.set_route(...route);
    }

    /* ------------------------------------------------------------------------
       9. MONTA UM CARD HTML
       ------------------------------------------------------------------------
       O HTML é gerado por template string para manter o app independente,
       sem depender de bibliotecas externas.
    ------------------------------------------------------------------------ */
    function gfCardTemplate(card) {
        const routePayload = encodeURIComponent(JSON.stringify(card.route));

        return `
            <button class="gf-module-card" type="button" data-gf-route="${routePayload}">
                <div class="gf-module-icon" aria-hidden="true">${card.icon}</div>
                <div class="gf-module-content">
                    <h3 class="gf-module-title">${card.title}</h3>
                    <p class="gf-module-description">${card.description}</p>
                </div>
            </button>
        `;
    }

    /* ------------------------------------------------------------------------
       10. MONTA UMA SEÇÃO DA HOME
    ------------------------------------------------------------------------ */
    function gfSectionTemplate(section) {
        return `
            <section class="gf-section">
                <div class="gf-section-header">
                    <div>
                        <h2 class="gf-section-title">${section.title}</h2>
                        <p class="gf-section-subtitle">${section.subtitle}</p>
                    </div>
                </div>
                <div class="gf-card-grid">
                    ${section.cards.map(gfCardTemplate).join("")}
                </div>
            </section>
        `;
    }

    /* ------------------------------------------------------------------------
       11. RENDERIZA A HOME PRINCIPAL
       ------------------------------------------------------------------------
       Substitui apenas o conteúdo central do Workspace.
       A barra superior do ERPNext permanece intacta.
    ------------------------------------------------------------------------ */
    function gfRenderHome() {
        if (!GF_ENABLE_CUSTOM_HOME) {
            gfLog("Home customizada desativada.");
            return;
        }

        if (!gfIsHomeWorkspaceRoute()) {
            return;
        }

        const container = gfGetMainContainer();

        if (!container) {
            gfLog("Container principal não encontrado. Execução ignorada.");
            return;
        }

        if (container.getAttribute("data-gf-home-rendered") === "true") {
            gfLog("Home já renderizada nesta navegação.");
            return;
        }

        container.setAttribute("data-gf-home-rendered", "true");

        container.innerHTML = `
            <div class="gf-home-shell">
                <header class="gf-home-hero">
                    <div class="gf-hero-main">
                        <span class="gf-eyebrow">GREEN FARMS ERP</span>
                        <h1 class="gf-home-title">Ambiente de trabalho inteligente</h1>
                        <p class="gf-home-subtitle">
                            Acesse rapidamente as principais rotinas da empresa em uma tela limpa,
                            moderna e organizada para operação, gestão e tomada de decisão.
                        </p>
                        <div class="gf-quick-row">
                            <button class="gf-quick-button" type="button" data-gf-route="${encodeURIComponent(JSON.stringify(["List", "Sales Invoice"]))}">Faturas de Venda</button>
                            <button class="gf-quick-button" type="button" data-gf-route="${encodeURIComponent(JSON.stringify(["List", "Purchase Invoice"]))}">Faturas de Compra</button>
                            <button class="gf-quick-button" type="button" data-gf-route="${encodeURIComponent(JSON.stringify(["List", "Project"]))}">Projetos</button>
                            <button class="gf-quick-button" type="button" data-gf-route="${encodeURIComponent(JSON.stringify(["List", "Item"]))}">Itens</button>
                        </div>
                    </div>

                    <aside class="gf-hero-side">
                        <div>
                            <h2 class="gf-side-title">Visão organizada por prioridade</h2>
                            <p class="gf-side-text">
                                As rotinas mais usadas ficam no primeiro plano. Configurações e áreas técnicas
                                permanecem disponíveis em seção secundária.
                            </p>
                        </div>
                        <div class="gf-side-metrics">
                            <div class="gf-metric"><strong>4</strong><span>áreas principais</span></div>
                            <div class="gf-metric"><strong>20+</strong><span>atalhos úteis</span></div>
                        </div>
                    </aside>
                </header>

                ${GF_HOME_SECTIONS.map(gfSectionTemplate).join("")}

                <section class="gf-section gf-admin-section">
                    <div class="gf-section-header">
                        <div>
                            <h2 class="gf-section-title">Administração e configurações</h2>
                            <p class="gf-section-subtitle">Acessos técnicos e configurações ficam abaixo para não atrapalhar a operação diária.</p>
                        </div>
                    </div>
                    <div class="gf-card-grid gf-secondary-grid">
                        ${GF_ADMIN_CARDS.map(gfCardTemplate).join("")}
                    </div>
                </section>

                <div class="gf-footer-note">
                    ICHIS Theme App • Camada visual segura sobre ERPNext • Core preservado
                </div>
            </div>
        `;

        gfBindNavigation(container);
        gfLog("Home ICHIS renderizada com sucesso.");
    }

    /* ------------------------------------------------------------------------
       12. VINCULA CLIQUES DOS CARDS À NAVEGAÇÃO
       ------------------------------------------------------------------------
       Usar addEventListener evita onclick inline e melhora organização.
    ------------------------------------------------------------------------ */
    function gfBindNavigation(container) {
        const routeButtons = container.querySelectorAll("[data-gf-route]");

        routeButtons.forEach((button) => {
            button.addEventListener("click", function () {
                try {
                    const route = JSON.parse(decodeURIComponent(button.getAttribute("data-gf-route")));
                    gfGoTo(route);
                } catch (error) {
                    gfLog("Erro ao interpretar rota do card.", error);
                }
            });
        });
    }

    /* ------------------------------------------------------------------------
       13. AGENDA RENDERIZAÇÃO COM PEQUENO ATRASO
       ------------------------------------------------------------------------
       O atraso curto permite que o ERPNext termine de montar o Workspace antes
       da camada ICHIS substituir o conteúdo central.
    ------------------------------------------------------------------------ */
    function gfScheduleRender() {
        window.setTimeout(gfRenderHome, 120);
    }

    /* ------------------------------------------------------------------------
       14. INICIALIZAÇÃO GLOBAL
       ------------------------------------------------------------------------
       Registra a execução no carregamento inicial e em mudanças de rota.
    ------------------------------------------------------------------------ */
    frappe.ready(function () {
        gfLog("JavaScript global ICHIS carregado.");

        gfScheduleRender();

        if (frappe.router && frappe.router.on) {
            frappe.router.on("change", function () {
                gfScheduleRender();
            });
        }
    });
})();
