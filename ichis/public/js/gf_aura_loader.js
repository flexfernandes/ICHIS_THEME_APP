(function () {
    window.gfVersion = "GF_ROUTE_FIX_R11";
    window.gfversion = "GF_ROUTE_FIX_R11";

    var CSS_FILES = [
        "/assets/ichis/css/gf_aura_tokens.css",
        "/assets/ichis/css/gf_aura_desk_safe.css"
    ];

    function markBody() {
        if (!document.body) return;
        document.body.classList.add("gf-aura-v16-safe");
        document.body.classList.add("gf-theme-active");

        try {
            var route = "";
            if (window.frappe && frappe.get_route) {
                route = frappe.get_route().join("/");
            } else {
                route = window.location.pathname || "";
            }
            document.body.setAttribute("data-gf-route", route);
        } catch (e) {}
    }

    function addLink(href, id) {
        if (document.getElementById(id)) return;
        var link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = href + "?v=0.0.2";
        document.head.appendChild(link);
    }

    function forceLoadCssOnce() {
        addLink(CSS_FILES[0], "gf-aura-v16-safe-tokens-link");
        addLink(CSS_FILES[1], "gf-aura-v16-safe-desk-link");

        var inlineId = "gf-aura-v16-safe-inline-css";
        if (document.getElementById(inlineId)) return;

        Promise.all(CSS_FILES.map(function (href) {
            return fetch(href + "?v=0.0.2", { cache: "no-store" }).then(function (r) { return r.text(); });
        })).then(function (cssParts) {
            var style = document.createElement("style");
            style.id = inlineId;
            style.type = "text/css";
            style.innerHTML = cssParts.join("\n\n");
            document.head.appendChild(style);
            markBody();
        }).catch(function () {
            markBody();
        });
    }

    function applyTheme() {
        markBody();
        forceLoadCssOnce();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyTheme);
    } else {
        applyTheme();
    }

    window.addEventListener("load", applyTheme);

    if (window.frappe && frappe.router && frappe.router.on) {
        frappe.router.on("change", function () {
            setTimeout(applyTheme, 80);
            setTimeout(applyTheme, 400);
        });
    }

    var observer = new MutationObserver(function () {
        markBody();
    });

    function startObserver() {
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startObserver);
    } else {
        startObserver();
    }
})();

/* ========================================================================== 
   GF HOME DESK OVERLAY - R4
   Objetivo: substituir visualmente somente a tela inicial/workspace do Desk.
   Estratégia: usa o mesmo arquivo JS do tema que já está funcionando no Desk,
   sem depender de novo hook, novo bundle ou novo arquivo CSS.
   ========================================================================== */
(function () {
    "use strict";

    var OVERLAY_ID = "gf-home-desk-overlay";
    var STYLE_ID = "gf-home-desk-overlay-style";
    var ACTIVE_CLASS = "gf-home-desk-active";

    function getRouteParts() {
        try {
            if (window.frappe && frappe.get_route) {
                return frappe.get_route() || [];
            }
        } catch (e) {}
        return [];
    }

    function normalizeRouteText(value) {
        return String(value || "")
            .replace(/%20/g, " ")
            .replace(/_/g, " ")
            .toLowerCase();
    }

    function isNativePageRoute(routeText) {
        return (
            routeText.indexOf("form/") === 0 ||
            routeText.indexOf("list/") === 0 ||
            routeText.indexOf("query-report/") === 0 ||
            routeText.indexOf("report/") === 0 ||
            routeText.indexOf("dashboard-view/") === 0 ||
            routeText.indexOf("print/") === 0 ||
            routeText.indexOf("file/") === 0
        );
    }

    function isDeskHomeRoute() {
        var path = normalizeRouteText(window.location.pathname || "");
        var hash = normalizeRouteText(window.location.hash || "");
        var route = getRouteParts();
        var routeText = normalizeRouteText(route.join("/"));
        var first = normalizeRouteText(route[0] || "");

        // Telas nativas do ERPNext devem continuar abrindo normalmente.
        if (isNativePageRoute(routeText)) return false;

        // Entrada principal do Desk.
        if (path === "/desk" || path === "/desk/" || path === "/app" || path === "/app/") return true;

        // Qualquer chamada antiga ou quebrada para Desk/Desc/Desktop deve voltar para a GF Home.
        if (path.indexOf("/desk") === 0) return true;
        if (hash.indexOf("desk") >= 0 || hash.indexOf("desc") >= 0 || hash.indexOf("desktop") >= 0) return true;
        if (routeText.indexOf("desk") >= 0 || routeText.indexOf("desc") >= 0 || routeText.indexOf("desktop") >= 0) return true;

        // Workspaces e módulos antigos, como Manufacturing, devem ser sobrepostos pela GF Home.
        if (first === "workspace" || first === "workspaces") return true;
        if (routeText.indexOf("workspace/") === 0) return true;
        if (routeText === "manufacturing" || routeText.indexOf("manufacturing") >= 0) return true;

        // Quando a rota vem vazia dentro de /app ou /desk, ainda é a tela inicial.
        if (!routeText && (path.indexOf("/app") === 0 || path.indexOf("/desk") === 0)) return true;

        return false;
    }

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement("style");
        style.id = STYLE_ID;
        style.type = "text/css";
        style.textContent = `
            body.${ACTIVE_CLASS} .layout-main-section,
            body.${ACTIVE_CLASS} .page-container,
            body.${ACTIVE_CLASS} .workspace,
            body.${ACTIVE_CLASS} .desk-page,
            body.${ACTIVE_CLASS} .page-content,
            body.${ACTIVE_CLASS} .frappe-card,
            body.${ACTIVE_CLASS} .codex-editor {
                visibility: hidden !important;
            }

            body.${ACTIVE_CLASS} #${OVERLAY_ID},
            body.${ACTIVE_CLASS} #${OVERLAY_ID} * {
                visibility: visible !important;
            }

            #${OVERLAY_ID} {
                position: fixed;
                inset: 56px 0 0 0;
                z-index: 30;
                overflow: auto;
                background:
                    radial-gradient(circle at top left, rgba(22, 163, 74, 0.14), transparent 32%),
                    radial-gradient(circle at top right, rgba(15, 118, 110, 0.10), transparent 35%),
                    linear-gradient(180deg, #f8fafc 0%, #eef7f1 100%);
                font-family: Inter, "Segoe UI", Arial, sans-serif;
                color: #111827;
                padding: 28px;
                box-sizing: border-box;
            }

            .gf-home-shell {
                max-width: 1380px;
                margin: 0 auto;
            }

            .gf-home-hero {
                background: rgba(255, 255, 255, 0.90);
                border: 1px solid rgba(148, 163, 184, 0.35);
                border-radius: 28px;
                padding: 28px;
                box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
                display: grid;
                grid-template-columns: 1.4fr 0.9fr;
                gap: 24px;
                align-items: stretch;
            }

            .gf-home-kicker {
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.14em;
                text-transform: uppercase;
                color: #166534;
                margin-bottom: 12px;
            }

            .gf-home-title {
                font-size: 34px;
                line-height: 1.12;
                font-weight: 800;
                color: #0f172a;
                margin: 0 0 12px 0;
            }

            .gf-home-subtitle {
                font-size: 14px;
                line-height: 1.7;
                color: #64748b;
                max-width: 780px;
                margin: 0;
            }

            .gf-home-status-card {
                border-radius: 24px;
                background: linear-gradient(135deg, #166534 0%, #16a34a 100%);
                color: #ffffff;
                padding: 24px;
                min-height: 190px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 20px 46px rgba(22, 101, 52, 0.22);
            }

            .gf-home-status-title {
                font-size: 13px;
                font-weight: 700;
                opacity: 0.92;
            }

            .gf-home-status-main {
                font-size: 28px;
                line-height: 1.15;
                font-weight: 800;
                margin-top: 12px;
            }

            .gf-home-status-sub {
                font-size: 12px;
                line-height: 1.5;
                opacity: 0.85;
                margin-top: 12px;
            }

            .gf-home-grid {
                margin-top: 24px;
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 16px;
            }

            .gf-home-card {
                border: 1px solid rgba(148, 163, 184, 0.30);
                background: rgba(255, 255, 255, 0.92);
                border-radius: 22px;
                padding: 20px;
                cursor: pointer;
                min-height: 150px;
                box-shadow: 0 16px 44px rgba(15, 23, 42, 0.06);
                transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
            }

            .gf-home-card:hover {
                transform: translateY(-3px);
                border-color: rgba(22, 163, 74, 0.45);
                box-shadow: 0 22px 56px rgba(15, 23, 42, 0.10);
            }

            .gf-home-icon {
                width: 42px;
                height: 42px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #dcfce7;
                color: #166534;
                font-size: 20px;
                margin-bottom: 16px;
            }

            .gf-home-card-title {
                font-size: 15px;
                font-weight: 800;
                color: #0f172a;
                margin-bottom: 8px;
            }

            .gf-home-card-text {
                font-size: 12px;
                line-height: 1.55;
                color: #64748b;
            }

            .gf-home-footer-row {
                margin-top: 18px;
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
            }

            .gf-home-pill {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                border-radius: 999px;
                padding: 8px 12px;
                background: rgba(255,255,255,0.82);
                border: 1px solid rgba(148, 163, 184, 0.32);
                color: #475569;
                font-size: 12px;
                font-weight: 600;
            }

            .gf-home-open-desk {
                border: 0;
                border-radius: 999px;
                padding: 10px 15px;
                background: #0f172a;
                color: #ffffff;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
            }

            body.gf-home-show-native #${OVERLAY_ID} {
                display: none !important;
            }

            body.gf-home-show-native .layout-main-section,
            body.gf-home-show-native .page-container,
            body.gf-home-show-native .workspace,
            body.gf-home-show-native .desk-page,
            body.gf-home-show-native .page-content,
            body.gf-home-show-native .frappe-card,
            body.gf-home-show-native .codex-editor {
                visibility: visible !important;
            }

            @media (max-width: 1100px) {
                .gf-home-hero { grid-template-columns: 1fr; }
                .gf-home-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }

            @media (max-width: 720px) {
                #${OVERLAY_ID} { padding: 18px; }
                .gf-home-title { font-size: 26px; }
                .gf-home-grid { grid-template-columns: 1fr; }
            }
        `;
        document.head.appendChild(style);
    }

    function goTo(route) {
        try {
            if (window.frappe && frappe.set_route) {
                frappe.set_route(route);
                return;
            }
        } catch (e) {}
        window.location.href = "/app/" + route;
    }

    function createOverlay() {
        if (document.getElementById(OVERLAY_ID)) return;

        var overlay = document.createElement("div");
        overlay.id = OVERLAY_ID;
        overlay.innerHTML = `
            <div class="gf-home-shell">
                <section class="gf-home-hero">
                    <div>
                        <div class="gf-home-kicker">GREENFARMS • ERPNext</div>
                        <h1 class="gf-home-title">Central operacional personalizada</h1>
                        <p class="gf-home-subtitle">
                            Esta é a nova tela inicial sobreposta ao Desk padrão do ERPNext. A estrutura foi preparada para crescer com cards, indicadores, atalhos e módulos operacionais sem alterar o tema base do sistema.
                        </p>
                        <div class="gf-home-footer-row">
                            <span class="gf-home-pill">Interface GF carregada sobre o workspace padrão</span>
                            <button class="gf-home-open-desk" type="button" data-gf-native-desk>Abrir Desk padrão</button>
                        </div>
                    </div>
                    <aside class="gf-home-status-card">
                        <div>
                            <div class="gf-home-status-title">Status da interface</div>
                            <div class="gf-home-status-main">GF HOME ativa</div>
                            <div class="gf-home-status-sub">Carregamento feito pelo arquivo do tema já ativo no Desk, reduzindo dependência de novos hooks.</div>
                        </div>
                        <div class="gf-home-status-sub">Versão de teste R4</div>
                    </aside>
                </section>

                <section class="gf-home-grid">
                    <article class="gf-home-card" data-gf-route="List/Sales Order/List">
                        <div class="gf-home-icon">📄</div>
                        <div class="gf-home-card-title">Pedidos</div>
                        <div class="gf-home-card-text">Acesso rápido aos pedidos e documentos comerciais.</div>
                    </article>
                    <article class="gf-home-card" data-gf-route="List/Item/List">
                        <div class="gf-home-icon">⚙️</div>
                        <div class="gf-home-card-title">Itens e serviços</div>
                        <div class="gf-home-card-text">Consulta e gestão dos itens cadastrados no ERP.</div>
                    </article>
                    <article class="gf-home-card" data-gf-route="List/Customer/List">
                        <div class="gf-home-icon">🤝</div>
                        <div class="gf-home-card-title">Clientes</div>
                        <div class="gf-home-card-text">Atalhos para cadastro e relacionamento com clientes.</div>
                    </article>
                    <article class="gf-home-card" data-gf-route="List/Project/List">
                        <div class="gf-home-icon">🏗️</div>
                        <div class="gf-home-card-title">Projetos</div>
                        <div class="gf-home-card-text">Entrada rápida para projetos e acompanhamentos internos.</div>
                    </article>
                </section>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener("click", function (event) {
            var nativeButton = event.target.closest("[data-gf-native-desk]");
            if (nativeButton) {
                document.body.classList.add("gf-home-show-native");
                document.body.classList.remove(ACTIVE_CLASS);
                return;
            }

            var card = event.target.closest("[data-gf-route]");
            if (card) {
                document.body.classList.remove(ACTIVE_CLASS);
                document.body.classList.add("gf-home-show-native");
                goTo(card.getAttribute("data-gf-route"));
            }
        });
    }

    function applyDeskHome() {
        if (!document.body) return;
        injectStyle();
        createOverlay();

        if (isDeskHomeRoute()) {
            document.body.classList.remove("gf-home-show-native");
            document.body.classList.add(ACTIVE_CLASS);
        } else {
            document.body.classList.remove(ACTIVE_CLASS);
        }
    }

    function scheduleApply() {
        applyDeskHome();
        setTimeout(applyDeskHome, 100);
        setTimeout(applyDeskHome, 500);
        setTimeout(applyDeskHome, 1200);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", scheduleApply);
    } else {
        scheduleApply();
    }

    window.addEventListener("load", scheduleApply);
    window.addEventListener("hashchange", scheduleApply);
    window.addEventListener("popstate", scheduleApply);

    if (window.frappe && frappe.router && frappe.router.on) {
        frappe.router.on("change", scheduleApply);
    }

    var originalPushState = history.pushState;
    history.pushState = function () {
        var result = originalPushState.apply(this, arguments);
        scheduleApply();
        return result;
    };

    var originalReplaceState = history.replaceState;
    history.replaceState = function () {
        var result = originalReplaceState.apply(this, arguments);
        scheduleApply();
        return result;
    };
})();
