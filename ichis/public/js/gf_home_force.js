(function () {
    "use strict";

    var GF_HOME_VERSION = "260429_R3";
    var OVERLAY_ID = "gf-home-force-overlay";
    var DEBUG_ID = "gf-home-force-debug";

    function log() {
        try {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("[GF HOME " + GF_HOME_VERSION + "]");
            console.log.apply(console, args);
        } catch (e) {}
    }

    function getRouteText() {
        try {
            if (window.frappe && frappe.get_route) return frappe.get_route().join("/");
        } catch (e) {}
        return (window.location.pathname || "") + (window.location.hash || "");
    }

    function isDeskHomeCandidate() {
        var path = window.location.pathname || "";
        var hash = window.location.hash || "";
        var route = getRouteText().toLowerCase();

        if (path === "/app" || path === "/app/" || path === "/desk" || path === "/desk/") {
            if (!hash || hash === "#" || hash === "#/" || hash.indexOf("#workspace") === 0) return true;
        }

        if (route === "" || route === "workspace" || route.indexOf("workspace/") === 0) return true;
        if (route.indexOf("workspaces") >= 0) return true;

        return false;
    }

    function showDebug(text) {
        var el = document.getElementById(DEBUG_ID);
        if (!el) {
            el = document.createElement("div");
            el.id = DEBUG_ID;
            document.body.appendChild(el);
        }
        el.textContent = text;
    }

    function removeOverlay() {
        var old = document.getElementById(OVERLAY_ID);
        if (old) old.remove();
    }

    function go(route) {
        try {
            if (window.frappe && frappe.set_route) {
                frappe.set_route(route);
                return;
            }
        } catch (e) {}
        window.location.href = "/app/" + route;
    }

    function renderOverlay() {
        if (!document.body) return;

        showDebug("GF HOME JS carregado " + GF_HOME_VERSION);

        if (!isDeskHomeCandidate()) {
            removeOverlay();
            return;
        }

        if (document.getElementById(OVERLAY_ID)) return;

        var overlay = document.createElement("div");
        overlay.id = OVERLAY_ID;
        overlay.innerHTML = '' +
            '<div class="gf-home-force-shell">' +
                '<section class="gf-home-force-hero">' +
                    '<div class="gf-home-force-kicker">GREENFARMS ERP</div>' +
                    '<h1 class="gf-home-force-title">Bem-vindo ao novo desktop operacional</h1>' +
                    '<p class="gf-home-force-subtitle">Esta é uma camada adicionada pelo app ICHIS, carregada sobre a tela padrão do ERPNext após o login. A partir daqui podemos evoluir para um menu profissional com módulos, indicadores, atalhos e visão operacional.</p>' +
                '</section>' +
                '<section class="gf-home-force-grid">' +
                    card('📊', 'Painel Comercial', 'Propostas, clientes, vendas e acompanhamento comercial.', 'Selling') +
                    card('🏭', 'Produção', 'Ordens, processos, fabricação e rotina operacional.', 'Manufacturing') +
                    card('📦', 'Estoque', 'Itens, movimentações, compras e materiais.', 'Stock') +
                    card('💰', 'Financeiro', 'Contas, recebimentos, pagamentos e relatórios.', 'Accounting') +
                    card('🧾', 'Relatórios', 'Área futura para relatórios personalizados GREENFARMS.', 'query-report') +
                    card('⚙️', 'Configurações', 'Acesso administrativo e ajustes do sistema.', 'setup-wizard') +
                    card('👥', 'Clientes', 'Cadastro e acompanhamento de relacionamentos.', 'Customer') +
                    card('📁', 'Projetos', 'Projetos, etapas e acompanhamento técnico.', 'Projects') +
                '</section>' +
            '</div>';

        document.body.appendChild(overlay);
        log("overlay aplicado", getRouteText());
    }

    function card(icon, title, text, route) {
        return '<article class="gf-home-force-card" data-gf-route="' + route + '">' +
            '<div class="gf-home-force-icon">' + icon + '</div>' +
            '<div class="gf-home-force-card-title">' + title + '</div>' +
            '<div class="gf-home-force-card-text">' + text + '</div>' +
        '</article>';
    }

    function bindClicks() {
        document.addEventListener("click", function (ev) {
            var card = ev.target.closest && ev.target.closest(".gf-home-force-card");
            if (!card) return;
            var route = card.getAttribute("data-gf-route");
            if (route) go(route);
        });
    }

    function scheduleRender() {
        renderOverlay();
        setTimeout(renderOverlay, 100);
        setTimeout(renderOverlay, 400);
        setTimeout(renderOverlay, 1000);
        setTimeout(renderOverlay, 2200);
    }

    function init() {
        log("arquivo carregado");
        bindClicks();
        scheduleRender();

        window.addEventListener("load", scheduleRender);
        window.addEventListener("hashchange", scheduleRender);
        window.addEventListener("popstate", scheduleRender);

        var last = getRouteText();
        setInterval(function () {
            var now = getRouteText();
            if (now !== last) {
                last = now;
                scheduleRender();
            }
        }, 700);

        try {
            if (window.frappe && frappe.router && frappe.router.on) {
                frappe.router.on("change", scheduleRender);
            }
        } catch (e) {}

        try {
            var mo = new MutationObserver(function () {
                if (isDeskHomeCandidate() && !document.getElementById(OVERLAY_ID)) {
                    renderOverlay();
                }
            });
            mo.observe(document.documentElement, { childList: true, subtree: true });
        } catch (e) {}
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
