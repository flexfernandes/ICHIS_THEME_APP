/* =============================================================================
   ICHIS / GREEN FARMS - JAVASCRIPT GLOBAL DO DESK
   =============================================================================
   Renderiza uma Home principal customizada, estilo portal corporativo, somente
   na tela inicial do Workspace, preservando a barra superior e o restante do ERP.
   ============================================================================= */

const GF_ENABLE_CUSTOM_HOME = true;
const GF_DEBUG = false;

function gfLog(message, data) {
    if (!GF_DEBUG) return;
    if (data !== undefined) console.log("[ICHIS]", message, data);
    else console.log("[ICHIS]", message);
}

const GF_PRIMARY_MODULES = [
    { title: "Clientes", subtitle: "Cadastro e gestão de clientes.", icon: "👥", route: ["List", "Customer"] },
    { title: "Fornecedores", subtitle: "Parceiros, compras e suprimentos.", icon: "🏭", route: ["List", "Supplier"] },
    { title: "Orçamentos de Venda", subtitle: "Propostas comerciais para clientes.", icon: "🧾", route: ["List", "Quotation"] },
    { title: "Pedidos de Venda", subtitle: "Pedidos aprovados e acompanhamento.", icon: "📦", route: ["List", "Sales Order"] },
    { title: "Faturas de Venda", subtitle: "Emissão e controle de faturamento.", icon: "💳", route: ["List", "Sales Invoice"] },
    { title: "Pedidos de Compra", subtitle: "Aquisições, compras e aprovações.", icon: "🛒", route: ["List", "Purchase Order"] },
    { title: "Faturas de Compra", subtitle: "Entrada de notas e contas a pagar.", icon: "📥", route: ["List", "Purchase Invoice"] },
    { title: "Itens", subtitle: "Produtos, serviços e materiais.", icon: "🏷️", route: ["List", "Item"] },
    { title: "Estoque", subtitle: "Movimentações e saldo de materiais.", icon: "📚", route: ["workspace", "Stock"] },
    { title: "Projetos", subtitle: "Controle de projetos e atividades.", icon: "📊", route: ["workspace", "Projects"] },
    { title: "Produção", subtitle: "Ordens de produção e fabricação.", icon: "⚙️", route: ["workspace", "Manufacturing"] },
    { title: "Contabilidade", subtitle: "Financeiro, contas e relatórios.", icon: "📈", route: ["workspace", "Accounting"] }
];

const GF_SECONDARY_MODULES = [
    { title: "Configurações do ERPNext", subtitle: "Parâmetros gerais e ajustes do sistema.", route: ["workspace", "ERPNext Settings"] },
    { title: "Usuários e permissões", subtitle: "Acessos, papéis e segurança.", route: ["List", "User"] },
    { title: "Relatórios", subtitle: "Acesso geral aos relatórios do sistema.", route: ["query-report"] },
    { title: "Compras", subtitle: "Área completa de compras.", route: ["workspace", "Buying"] },
    { title: "Vendas", subtitle: "Área completa de vendas.", route: ["workspace", "Selling"] },
    { title: "Qualidade", subtitle: "Inspeções e controles de qualidade.", route: ["workspace", "Quality"] }
];

const GF_QUICK_ACTIONS = [
    { label: "Nova Fatura de Venda", route: ["Form", "Sales Invoice", "new-sales-invoice"] },
    { label: "Novo Pedido de Compra", route: ["Form", "Purchase Order", "new-purchase-order"] },
    { label: "Novo Item", route: ["Form", "Item", "new-item"] }
];

function gfGo(route) {
    if (!route || !Array.isArray(route)) return;
    frappe.set_route(...route);
}

function gfIsWorkspaceRoute() {
    const route = frappe.get_route ? frappe.get_route() : [];
    if (!route || !route.length) return false;
    return route[0] === "workspace";
}

function gfFindMainContainer() {
    return document.querySelector(".layout-main-section") || document.querySelector(".page-content") || document.querySelector(".page-container");
}

function gfEncodeRoute(route) {
    return encodeURIComponent(JSON.stringify(route));
}

function gfModuleCard(module) {
    return `
        <div class="gf-module-card" data-gf-route="${gfEncodeRoute(module.route)}">
            <div>
                <div class="gf-module-icon">${module.icon || "●"}</div>
                <h3 class="gf-module-title">${module.title}</h3>
                <p class="gf-module-subtitle">${module.subtitle || ""}</p>
            </div>
        </div>
    `;
}

function gfSecondaryCard(module) {
    return `
        <div class="gf-link-card" data-gf-route="${gfEncodeRoute(module.route)}">
            <h3 class="gf-module-title">${module.title}</h3>
            <p class="gf-module-subtitle">${module.subtitle || ""}</p>
        </div>
    `;
}

function gfQuickAction(action) {
    return `
        <div class="gf-side-item" data-gf-route="${gfEncodeRoute(action.route)}">
            <span>${action.label}</span>
            <span>→</span>
        </div>
    `;
}

function gfBindRouteEvents(container) {
    container.querySelectorAll("[data-gf-route]").forEach((element) => {
        element.addEventListener("click", () => {
            try {
                const route = JSON.parse(decodeURIComponent(element.getAttribute("data-gf-route")));
                gfGo(route);
            } catch (error) {
                gfLog("Erro ao abrir rota", error);
            }
        });
    });
}

function gfRenderCustomHome() {
    if (!GF_ENABLE_CUSTOM_HOME) return;
    if (!gfIsWorkspaceRoute()) return;

    const container = gfFindMainContainer();
    if (!container) {
        gfLog("Container principal não encontrado. Home não renderizada.");
        return;
    }

    if (container.getAttribute("data-gf-home-rendered") === "true") return;
    container.setAttribute("data-gf-home-rendered", "true");

    container.innerHTML = `
        <section class="gf-home-shell">
            <div class="gf-home-hero">
                <div class="gf-hero-card">
                    <div class="gf-eyebrow">GREEN FARMS • ERPNext</div>
                    <h1 class="gf-home-title">Painel principal corporativo</h1>
                    <p class="gf-home-subtitle">
                        Acesse rapidamente as áreas mais usadas da empresa em uma interface limpa,
                        moderna e organizada, mantendo toda a segurança e estrutura nativa do ERPNext.
                    </p>
                    <div class="gf-hero-actions">
                        <button class="gf-hero-button primary" data-gf-route="${gfEncodeRoute(["List", "Sales Invoice"])}">Faturas de Venda</button>
                        <button class="gf-hero-button secondary" data-gf-route="${gfEncodeRoute(["List", "Purchase Invoice"])}">Faturas de Compra</button>
                        <button class="gf-hero-button secondary" data-gf-route="${gfEncodeRoute(["List", "Item"])}">Itens</button>
                    </div>
                </div>
                <aside class="gf-side-panel">
                    <h2 class="gf-side-title">Ações rápidas</h2>
                    <div class="gf-side-list">${GF_QUICK_ACTIONS.map(gfQuickAction).join("")}</div>
                </aside>
            </div>

            <div class="gf-home-section">
                <div class="gf-section-header">
                    <div>
                        <h2 class="gf-section-title">Operação principal</h2>
                        <p class="gf-section-subtitle">Áreas mais utilizadas no dia a dia da empresa.</p>
                    </div>
                </div>
                <div class="gf-card-grid">${GF_PRIMARY_MODULES.map(gfModuleCard).join("")}</div>
            </div>

            <div class="gf-home-section">
                <div class="gf-section-header">
                    <div>
                        <h2 class="gf-section-title">Administração e áreas secundárias</h2>
                        <p class="gf-section-subtitle">Configurações, áreas completas e recursos de menor uso diário.</p>
                    </div>
                </div>
                <div class="gf-secondary-grid">${GF_SECONDARY_MODULES.map(gfSecondaryCard).join("")}</div>
            </div>

            <div class="gf-footer-note">ICHIS Theme • Camada visual aplicada sem alteração do core do ERPNext.</div>
        </section>
    `;

    gfBindRouteEvents(container);
    gfLog("Home principal ICHIS renderizada.");
}

frappe.ready(function () {
    gfLog("ICHIS Global JS carregado.");
    setTimeout(gfRenderCustomHome, 500);

    if (frappe.router && frappe.router.on) {
        frappe.router.on("change", function () {
            setTimeout(gfRenderCustomHome, 350);
        });
    }
});
