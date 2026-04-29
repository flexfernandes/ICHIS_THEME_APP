(function () {
    "use strict";

    var GF_HOME_ROUTE = "gf-home";
    var GF_HOME_VERSION = "2026.04.29.01";
    var REDIRECT_DONE_KEY = "gf_home_redirect_done";

    function isDeskContext() {
        return !!(window.frappe && document.body && (location.pathname.indexOf("/desk") === 0 || location.pathname.indexOf("/app") === 0));
    }

    function getRouteText() {
        try {
            if (window.frappe && frappe.get_route) return frappe.get_route().join("/");
        } catch (e) {}
        return "";
    }

    function isHomeRoute() {
        var route = getRouteText();
        return route === GF_HOME_ROUTE || route.indexOf(GF_HOME_ROUTE) === 0;
    }

    function isDefaultDeskRoute() {
        var route = getRouteText();
        var path = location.pathname || "";

        if (isHomeRoute()) return false;

        return (
            route === "" ||
            route === "desk" ||
            route === "workspace" ||
            route === "Workspaces" ||
            route.indexOf("workspace/") === 0 ||
            route.indexOf("Workspaces/") === 0 ||
            path === "/desk" ||
            path === "/desk/" ||
            path === "/app" ||
            path === "/app/"
        );
    }

    function redirectToHome() {
        if (!isDeskContext()) return;
        if (!window.frappe || !frappe.set_route) return;
        if (!isDefaultDeskRoute()) return;

        try {
            if (sessionStorage.getItem(REDIRECT_DONE_KEY) === "1" && isHomeRoute()) return;
            sessionStorage.setItem(REDIRECT_DONE_KEY, "1");
        } catch (e) {}

        frappe.set_route(GF_HOME_ROUTE);
    }

    function makeIcon(svgPath) {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + svgPath + '"></path></svg>';
    }

    var icons = {
        sales: "M4 5h16v3H4V5zm1 5h14v9H5v-9zm3 2v2h8v-2H8zm0 4v1h5v-1H8z",
        stock: "M4 6l8-4 8 4v12l-8 4-8-4V6zm8 2l4.8-2.4L12 3.2 7.2 5.6 12 8zm-6 1.2v7.6l5 2.5v-7.6l-5-2.5zm7 10.1l5-2.5V9.2l-5 2.5v7.6z",
        buying: "M7 4h10l2 5H5l2-5zm-2 7h14v8H5v-8zm3 2v4h8v-4H8z",
        manufacturing: "M4 20V8l5 4V8l5 4V5h6v15H4zm12-13v5h2V7h-2zM7 15v2h3v-2H7zm5 0v2h3v-2h-3z",
        quality: "M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-4zm-1 13.5l6-6-1.4-1.4L11 12.7 8.9 10.6 7.5 12l3.5 3.5z",
        projects: "M4 5h16v4H4V5zm0 6h7v8H4v-8zm9 0h7v8h-7v-8z",
        accounting: "M5 4h14v16H5V4zm3 3v3h8V7H8zm0 5v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zM8 16v2h2v-2H8zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2z",
        settings: "M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2.6-1.5L14 2h-4l-.4 2.5A7 7 0 0 0 7 6L4.6 5 2.6 8.5l2 1.5c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 2.6 1.5L10 22h4l.4-2.5A7 7 0 0 0 17 18l2.4 1 2-3.5-2-1.5zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z"
    };

    var modules = [
        { label: "Vendas", route: "workspace/Selling", icon: icons.sales, desc: "Propostas, pedidos, clientes e faturamento." },
        { label: "Estoque", route: "workspace/Stock", icon: icons.stock, desc: "Itens, movimentações, almoxarifado e saldos." },
        { label: "Compras", route: "workspace/Buying", icon: icons.buying, desc: "Fornecedores, solicitações e pedidos de compra." },
        { label: "Produção", route: "workspace/Manufacturing", icon: icons.manufacturing, desc: "Ordens, processos, materiais e fabricação." },
        { label: "Qualidade", route: "workspace/Quality", icon: icons.quality, desc: "Inspeções, padrões, registros e controle." },
        { label: "Projetos", route: "workspace/Projects", icon: icons.projects, desc: "Etapas, tarefas, prazos e acompanhamento." },
        { label: "Financeiro", route: "workspace/Accounting", icon: icons.accounting, desc: "Contas, recebimentos, pagamentos e resultados." },
        { label: "Configurações", route: "workspace/ERPNext Settings", icon: icons.settings, desc: "Parâmetros gerais e ajustes do sistema." }
    ];

    function go(route) {
        if (window.frappe && frappe.set_route) frappe.set_route(route);
    }

    function renderHome(wrapper) {
        var userName = "";
        try {
            userName = frappe.session && frappe.session.user_fullname ? frappe.session.user_fullname : "";
        } catch (e) {}

        var moduleCards = modules.map(function (item) {
            return '' +
                '<button class="gf-home-module" data-route="' + item.route + '" type="button">' +
                    '<span class="gf-home-module-icon">' + makeIcon(item.icon) + '</span>' +
                    '<span class="gf-home-module-text">' +
                        '<strong>' + item.label + '</strong>' +
                        '<small>' + item.desc + '</small>' +
                    '</span>' +
                '</button>';
        }).join("");

        wrapper.innerHTML = '' +
            '<main class="gf-home-page" data-version="' + GF_HOME_VERSION + '">' +
                '<section class="gf-home-hero">' +
                    '<div class="gf-home-hero-content">' +
                        '<div class="gf-home-brand-row">' +
                            '<span class="gf-home-brand-mark">GF</span>' +
                            '<span class="gf-home-brand-text">GREENFARMS</span>' +
                        '</div>' +
                        '<p class="gf-home-kicker">Desktop operacional</p>' +
                        '<h1>Bem-vindo ao ambiente GREENFARMS</h1>' +
                        '<p class="gf-home-subtitle">Uma entrada mais limpa, rápida e organizada para acessar os principais módulos do ERPNext.</p>' +
                        '<div class="gf-home-actions">' +
                            '<button class="gf-home-primary" data-route="List/ToDo/List" type="button">Minhas tarefas</button>' +
                            '<button class="gf-home-secondary" data-route="workspace/Selling" type="button">Área comercial</button>' +
                        '</div>' +
                    '</div>' +
                    '<aside class="gf-home-user-card">' +
                        '<span class="gf-home-user-label">Usuário conectado</span>' +
                        '<strong>' + (userName || "ERPNext") + '</strong>' +
                        '<small>Acesso rápido aos módulos principais</small>' +
                    '</aside>' +
                '</section>' +
                '<section class="gf-home-grid-wrap">' +
                    '<div class="gf-home-section-head">' +
                        '<div>' +
                            '<p>Módulos</p>' +
                            '<h2>Acesso rápido</h2>' +
                        '</div>' +
                        '<button class="gf-home-link" data-route="Workspaces" type="button">Ver workspace padrão</button>' +
                    '</div>' +
                    '<div class="gf-home-modules">' + moduleCards + '</div>' +
                '</section>' +
            '</main>';

        wrapper.querySelectorAll("[data-route]").forEach(function (el) {
            el.addEventListener("click", function () {
                go(el.getAttribute("data-route"));
            });
        });
    }

    function registerPage() {
        if (!window.frappe) return;

        frappe.provide("frappe.pages");

        frappe.pages[GF_HOME_ROUTE] = {
            on_page_load: function (wrapper) {
                wrapper.page = frappe.ui.make_app_page({
                    parent: wrapper,
                    title: "GREENFARMS",
                    single_column: true
                });

                if (wrapper.page && wrapper.page.set_title) {
                    wrapper.page.set_title("GREENFARMS");
                }

                var body = wrapper.page && wrapper.page.main ? wrapper.page.main[0] : wrapper;
                body.classList.add("gf-home-wrapper");
                renderHome(body);
            },
            refresh: function (wrapper) {
                var body = wrapper && wrapper.page && wrapper.page.main ? wrapper.page.main[0] : null;
                if (body && !body.querySelector(".gf-home-page")) renderHome(body);
            }
        };
    }

    function boot() {
        if (!isDeskContext()) return;
        registerPage();
        setTimeout(redirectToHome, 80);
        setTimeout(redirectToHome, 500);
        setTimeout(redirectToHome, 1200);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    window.addEventListener("load", boot);

    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) setTimeout(redirectToHome, 150);
    });

    if (window.frappe && frappe.router && frappe.router.on) {
        frappe.router.on("change", function () {
            if (isHomeRoute()) {
                document.body.classList.add("gf-home-active");
            } else {
                document.body.classList.remove("gf-home-active");
            }
            setTimeout(redirectToHome, 120);
        });
    } else {
        setTimeout(function () {
            if (window.frappe && frappe.router && frappe.router.on) {
                frappe.router.on("change", function () {
                    if (isHomeRoute()) document.body.classList.add("gf-home-active");
                    else document.body.classList.remove("gf-home-active");
                    setTimeout(redirectToHome, 120);
                });
            }
        }, 1000);
    }
})();
