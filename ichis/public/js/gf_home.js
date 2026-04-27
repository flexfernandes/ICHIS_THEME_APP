(function () {
    const GF_HOME_CONFIG = {
        title: "GREENFARMS ERP",
        subtitle: "Gestão industrial, processos, engenharia, produção e controle operacional em um único ambiente.",
        target_workspaces: ["Home", "Projects", "Projeto", "Projetos"],

        cards: [
            {
                title: "Vendas",
                description: "Propostas, pedidos, clientes e acompanhamento comercial.",
                icon: "shopping-cart",
                route: ["workspace", "Selling"]
            },
            {
                title: "Compras",
                description: "Fornecedores, pedidos de compra e controle de aquisições.",
                icon: "shopping-bag",
                route: ["workspace", "Buying"]
            },
            {
                title: "Estoque",
                description: "Itens, movimentações, almoxarifado e disponibilidade.",
                icon: "package",
                route: ["workspace", "Stock"]
            },
            {
                title: "Produção",
                description: "Ordens, processos industriais e acompanhamento operacional.",
                icon: "tool",
                route: ["workspace", "Manufacturing"]
            },
            {
                title: "Projetos",
                description: "Planejamento, tarefas, entregas e acompanhamento técnico.",
                icon: "folder",
                route: ["workspace", "Projects"]
            },
            {
                title: "Financeiro",
                description: "Contas, pagamentos, recebimentos e visão financeira.",
                icon: "credit-card",
                route: ["workspace", "Accounting"]
            },
            {
                title: "CRM",
                description: "Leads, oportunidades, relacionamento e funil comercial.",
                icon: "users",
                route: ["workspace", "CRM"]
            },
            {
                title: "Relatórios",
                description: "Indicadores, consultas e análises gerenciais.",
                icon: "bar-chart",
                route: ["query-report"]
            },
            {
                title: "Configurações",
                description: "Ajustes gerais, usuários, permissões e parametrizações.",
                icon: "settings",
                route: ["workspace", "Settings"]
            }
        ]
    };

    function getRoute() {
        if (!window.frappe || !frappe.get_route) return [];
        return frappe.get_route() || [];
    }

    function isTargetRoute() {
        const route = getRoute();
        const first = String(route[0] || "").toLowerCase();
        const second = String(route[1] || "");

        if (!route.length) return true;

        const isWorkspace =
            first === "workspace" ||
            first === "workspaces";

        if (!isWorkspace) return false;

        if (!second) return true;

        return GF_HOME_CONFIG.target_workspaces.includes(second);
    }

    function iconSvg(name) {
        const icons = {
            "shopping-cart": "M6 6h15l-1.5 9h-12z M6 6L5 3H2 M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
            "shopping-bag": "M6 8h12l-1 13H7z M9 8a3 3 0 0 1 6 0",
            "package": "M21 8l-9-5-9 5 9 5 9-5z M3 8v8l9 5 9-5V8 M12 13v8",
            "tool": "M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-3 3-3-3z",
            "folder": "M3 6h7l2 2h9v11H3z",
            "credit-card": "M3 5h18v14H3z M3 10h18",
            "users": "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
            "bar-chart": "M4 19V9 M12 19V5 M20 19v-8",
            "settings": "M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-1.9.3l-.2.1-3.5-2-.1-.2a1.7 1.7 0 0 0-1.8 0l-.1.2-3.5 2-.2-.1a1.7 1.7 0 0 0-1.9-.3l-.2.1-2-3.4.1-.1a1.7 1.7 0 0 0 .3-1.9V15l-2-3.5.1-.2a1.7 1.7 0 0 0 0-1.8l-.1-.2 2-3.5.2.1a1.7 1.7 0 0 0 1.9-.3l.2-.1 3.5-2 .1.2a1.7 1.7 0 0 0 1.8 0l.1-.2 3.5 2 .2.1a1.7 1.7 0 0 0 1.9.3l.2-.1 2 3.5-.1.2a1.7 1.7 0 0 0 0 1.8l.1.2z"
        };

        return `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="${icons[name] || icons.folder}" />
            </svg>
        `;
    }

    function goToRoute(route) {
        if (!window.frappe || !frappe.set_route) return;

        if (route.length === 1) {
            frappe.set_route(route[0]);
            return;
        }

        frappe.set_route(route);
    }

    function buildHomeHtml() {
        const cardsHtml = GF_HOME_CONFIG.cards.map((card, index) => `
            <button class="gf-home-card" data-gf-card-index="${index}" type="button">
                <span class="gf-home-card-icon">${iconSvg(card.icon)}</span>
                <span class="gf-home-card-title">${card.title}</span>
                <span class="gf-home-card-desc">${card.description}</span>
            </button>
        `).join("");

        return `
            <section id="gf-modern-home" class="gf-modern-home">
                <div class="gf-home-hero">
                    <div>
                        <div class="gf-home-kicker">Ambiente corporativo</div>
                        <h1>${GF_HOME_CONFIG.title}</h1>
                        <p>${GF_HOME_CONFIG.subtitle}</p>
                    </div>
                    <div class="gf-home-badge">
                        <span></span>
                        Sistema personalizado
                    </div>
                </div>

                <div class="gf-home-grid">
                    ${cardsHtml}
                </div>
            </section>
        `;
    }

    function getTargetContainer() {
        return (
            document.querySelector(".layout-main-section") ||
            document.querySelector(".page-content") ||
            document.querySelector(".workspace")
        );
    }

    function applyHome() {
        if (!isTargetRoute()) {
            removeHome();
            return;
        }

        const container = getTargetContainer();
        if (!container) return;

        document.body.classList.add("gf-home-active");

        let existing = document.getElementById("gf-modern-home");
        if (!existing) {
            container.insertAdjacentHTML("afterbegin", buildHomeHtml());
            existing = document.getElementById("gf-modern-home");
        }

        existing.querySelectorAll("[data-gf-card-index]").forEach((el) => {
            el.onclick = function () {
                const index = Number(this.getAttribute("data-gf-card-index"));
                const card = GF_HOME_CONFIG.cards[index];
                if (card && card.route) {
                    goToRoute(card.route);
                }
            };
        });
    }

    function removeHome() {
        document.body.classList.remove("gf-home-active");

        const existing = document.getElementById("gf-modern-home");
        if (existing) {
            existing.remove();
        }
    }

    function scheduleApply() {
        setTimeout(applyHome, 300);
        setTimeout(applyHome, 900);
    }

    if (window.frappe) {
        frappe.ready(function () {
            scheduleApply();

            if (frappe.router && frappe.router.on) {
                frappe.router.on("change", function () {
                    scheduleApply();
                });
            }

            window.addEventListener("hashchange", scheduleApply);
        });
    }
})();