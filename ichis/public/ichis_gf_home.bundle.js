(function () {
    "use strict";

    var VERSION = "260429-r2";
    var HOME_ROUTE = "gf-home";
    var CSS_ID = "ichis-gf-home-overlay-css";
    var CSS_HREF = "/assets/ichis/css/gf_home_overlay.css?v=" + VERSION;
    var STATE_KEY = "ichis_gf_home_loaded";

    function log() {
        try {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("[ICHIS GF HOME " + VERSION + "]");
            console.log.apply(console, args);
        } catch (e) {}
    }

    function loadCss() {
        if (document.getElementById(CSS_ID)) return;
        var link = document.createElement("link");
        link.id = CSS_ID;
        link.rel = "stylesheet";
        link.href = CSS_HREF;
        document.head.appendChild(link);
    }

    function getRouteParts() {
        try {
            if (window.frappe && frappe.get_route) return frappe.get_route() || [];
        } catch (e) {}

        var hash = (window.location.hash || "").replace(/^#/, "");
        if (hash) return hash.split("/").filter(Boolean);

        var path = (window.location.pathname || "").replace(/^\/+/, "");
        return path.split("/").filter(Boolean);
    }

    function isDeskHomeRoute() {
        var path = window.location.pathname || "";
        var hash = window.location.hash || "";
        var route = getRouteParts();
        var first = (route[0] || "").toLowerCase();
        var second = (route[1] || "").toLowerCase();

        if (path === "/app" || path === "/app/" || path === "/desk" || path === "/desk/") return true;
        if (first === "workspace") return true;
        if (first === "app" && (second === "" || second === "workspace")) return true;
        if (hash.indexOf("workspace") >= 0) return true;
        return false;
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function card(icon, title, text, route) {
        return "<div class='gf-home-card' data-gf-route='" + escapeHtml(route) + "'>" +
            "<div class='gf-home-icon'>" + escapeHtml(icon) + "</div>" +
            "<div class='gf-home-card-title'>" + escapeHtml(title) + "</div>" +
            "<div class='gf-home-card-text'>" + escapeHtml(text) + "</div>" +
        "</div>";
    }

    function homeHtml() {
        var user = "";
        try { user = frappe.session.user_fullname || frappe.session.user || "Usuário"; } catch (e) { user = "Usuário"; }
        var today = new Date().toLocaleDateString("pt-BR");

        return "<div class='gf-home-root'>" +
            "<div class='gf-home-shell'>" +
                "<div class='gf-home-hero'>" +
                    "<section class='gf-home-panel'>" +
                        "<div class='gf-home-panel-inner'>" +
                            "<div class='gf-home-kicker'>GREENFARMS • ERPNext</div>" +
                            "<h1 class='gf-home-title'>Bem-vindo ao ambiente operacional</h1>" +
                            "<p class='gf-home-subtitle'>Esta é a nova tela inicial personalizada do app ICHIS, carregada sobre o desktop padrão do ERPNext sem alterar o tema base. Use os atalhos abaixo para acessar rapidamente as áreas principais do sistema.</p>" +
                            "<div class='gf-home-actions'>" +
                                "<button class='gf-home-btn' data-gf-route='workspace/Accounting'>Abrir financeiro</button>" +
                                "<button class='gf-home-btn secondary' data-gf-route='workspace/Stock'>Abrir estoque</button>" +
                                "<button class='gf-home-btn secondary' data-gf-route='workspace/Selling'>Abrir vendas</button>" +
                            "</div>" +
                        "</div>" +
                    "</section>" +
                    "<aside class='gf-home-panel gf-home-side'>" +
                        "<div>" +
                            "<div class='gf-home-kicker'>Sessão ativa</div>" +
                            "<div class='gf-home-status' style='margin-top:14px'>" +
                                "<div class='gf-home-status-row'><span>Usuário</span><strong>" + escapeHtml(user) + "</strong></div>" +
                                "<div class='gf-home-status-row'><span>Data</span><strong>" + escapeHtml(today) + "</strong></div>" +
                                "<div class='gf-home-status-row'><span>Status</span><strong>GF Home ativa</strong></div>" +
                            "</div>" +
                        "</div>" +
                        "<div class='gf-home-footer-note'>Versão " + escapeHtml(VERSION) + " • camada isolada</div>" +
                    "</aside>" +
                "</div>" +
                "<div class='gf-home-grid'>" +
                    card("💼", "Contabilidade", "Acesse contas, faturas, pagamentos e visão financeira.", "workspace/Accounting") +
                    card("📦", "Estoque", "Movimentações, itens, armazéns e materiais.", "workspace/Stock") +
                    card("🧾", "Vendas", "Propostas, pedidos, clientes e faturamento.", "workspace/Selling") +
                    card("🛠️", "Projetos", "Acompanhamento técnico, tarefas e entregas.", "workspace/Projects") +
                    card("🏭", "Produção", "Ordens, operações e rotinas produtivas.", "workspace/Manufacturing") +
                    card("🤝", "CRM", "Oportunidades, contatos e relacionamento comercial.", "workspace/CRM") +
                    card("👥", "RH", "Equipe, presença, despesas e documentos internos.", "workspace/HR") +
                    card("⚙️", "Configurações", "Administração, usuários e ajustes do sistema.", "workspace/Settings") +
                "</div>" +
            "</div>" +
        "</div>";
    }

    function bindLinks(root) {
        var nodes = root.querySelectorAll("[data-gf-route]");
        nodes.forEach(function (node) {
            node.addEventListener("click", function () {
                var route = node.getAttribute("data-gf-route");
                if (!route) return;
                try {
                    if (window.frappe && frappe.set_route) {
                        frappe.set_route.apply(frappe, route.split("/"));
                    } else {
                        window.location.href = "/app/" + route;
                    }
                } catch (e) {
                    window.location.href = "/app/" + route;
                }
            });
        });
    }

    function findMainContainer() {
        return document.querySelector(".layout-main-section") ||
            document.querySelector(".page-container") ||
            document.querySelector(".main-section") ||
            document.querySelector("#body") ||
            document.body;
    }

    function renderInto(container) {
        if (!container) return false;
        loadCss();
        document.body.classList.add("gf-home-active");
        container.innerHTML = homeHtml();
        bindLinks(container);
        window[STATE_KEY] = true;
        log("GF Home renderizada em", container);
        return true;
    }

    function renderPage(wrapper) {
        var target = wrapper;
        try {
            var page = frappe.ui.make_app_page({
                parent: wrapper,
                title: "GREENFARMS",
                single_column: true
            });
            target = page.main && page.main[0] ? page.main[0] : wrapper;
        } catch (e) {}
        renderInto(target);
    }

    function enforceHome() {
        loadCss();
        if (!document.body) return;

        if (isDeskHomeRoute()) {
            renderInto(findMainContainer());
        }
    }

    function start() {
        window.ICHIS_GF_HOME = {
            version: VERSION,
            renderPage: renderPage,
            enforceHome: enforceHome
        };

        log("bundle carregado");
        enforceHome();
        setTimeout(enforceHome, 250);
        setTimeout(enforceHome, 900);
        setTimeout(enforceHome, 1800);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }

    window.addEventListener("load", function () {
        setTimeout(enforceHome, 120);
        setTimeout(enforceHome, 650);
    });

    function attachRouter() {
        try {
            if (window.frappe && frappe.router && frappe.router.on) {
                frappe.router.on("change", function () {
                    document.body && document.body.classList.remove("gf-home-active");
                    setTimeout(enforceHome, 80);
                    setTimeout(enforceHome, 400);
                });
                log("router hook conectado");
                return true;
            }
        } catch (e) {}
        return false;
    }

    if (!attachRouter()) {
        var tries = 0;
        var timer = setInterval(function () {
            tries += 1;
            if (attachRouter() || tries > 30) clearInterval(timer);
        }, 250);
    }

    var observerTimer;
    var observer = new MutationObserver(function () {
        clearTimeout(observerTimer);
        observerTimer = setTimeout(enforceHome, 120);
    });

    function startObserver() {
        try {
            if (document.body) observer.observe(document.body, { childList: true, subtree: true });
        } catch (e) {}
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startObserver);
    } else {
        startObserver();
    }
})();
