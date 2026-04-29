(function () {
    "use strict";
    const MOUNT_ID = "gf-home-overlay-root";
    const ACTIVE_CLASS = "gf-home-active";
    const DISABLE_KEY = "gf_home_disabled";

    function isDisabled() {
        try { return localStorage.getItem(DISABLE_KEY) === "1"; } catch(e) { return false; }
    }
    function route() {
        return (window.frappe && frappe.get_route) ? (frappe.get_route() || []) : [];
    }
    function isDeskHome() {
        const r = route().map(x => String(x || "").toLowerCase());
        const p = String(location.pathname || "").toLowerCase();
        const h = String(location.hash || "").toLowerCase();
        if (r[0] === "gf-home") return true;
        if ((p.endsWith("/desk") || p.endsWith("/app")) && (!r[0] || r[0] === "workspace" || r[0] === "workspaces" || r[0] === "desktop")) return true;
        if (r[0] === "workspace" && (!r[1] || r[1] === "home")) return true;
        if (r[0] === "workspaces") return true;
        if (!h && (p.endsWith("/desk") || p.endsWith("/app"))) return true;
        return false;
    }
    function go(target) {
        if (!target) return;
        if (window.frappe && frappe.set_route) frappe.set_route(target);
    }
    function card(title, text, target, icon) {
        return `<button class="gf-home-card" data-gf-route="${target}"><span class="gf-home-icon">${icon}</span><span><strong>${title}</strong><small>${text}</small></span></button>`;
    }
    function html() {
        return `<section class="gf-home-shell"><div class="gf-home-bg"></div><header class="gf-home-hero"><div><p>GREENFARMS</p><h1>Centro operacional</h1><span>Acesso rápido aos principais módulos do ERPNext com uma tela própria carregada após o login.</span></div><aside><small>Sistema ativo</small><strong>GF HOME</strong></aside></header><main class="gf-home-grid">${card("Vendas","Clientes, propostas e pedidos","List/Sales Order","▣")}${card("Compras","Fornecedores e pedidos","List/Purchase Order","◇")}${card("Estoque","Itens e movimentações","List/Item","▤")}${card("Produção","Ordens de fabricação","List/Work Order","◈")}${card("Projetos","Acompanhamento técnico","List/Project","▥")}${card("Financeiro","Faturas e contas","List/Sales Invoice","◍")}${card("Qualidade","Inspeções e registros","List/Quality Inspection","◎")}${card("Configurações","Ajustes do ERPNext","workspace/ERPNext Settings","⚙")}</main><footer class="gf-home-footer"><span>Camada adicionada via app, sem alteração do tema base.</span><button class="gf-home-native">Ver desktop padrão</button></footer></section>`;
    }
    function mount(wrapper) {
        if (isDisabled()) return;
        let root;
        if (wrapper) {
            wrapper.innerHTML = `<div id="${MOUNT_ID}"></div>`;
            root = wrapper.querySelector(`#${MOUNT_ID}`);
        } else {
            root = document.getElementById(MOUNT_ID);
            if (!root) { root = document.createElement("div"); root.id = MOUNT_ID; document.body.appendChild(root); }
        }
        root.innerHTML = html();
        document.body.classList.add(ACTIVE_CLASS);
        root.querySelectorAll("[data-gf-route]").forEach(btn => btn.onclick = function(){ unmount(); go(this.getAttribute("data-gf-route")); });
        const native = root.querySelector(".gf-home-native");
        if (native) native.onclick = function(){ try { localStorage.setItem(DISABLE_KEY,"1"); } catch(e){} unmount(); go("workspace"); };
    }
    function unmount(){ const root = document.getElementById(MOUNT_ID); if(root) root.remove(); document.body.classList.remove(ACTIVE_CLASS); }
    function guard(){ isDisabled() ? unmount() : (isDeskHome() ? mount() : unmount()); }
    function register(){ if(!window.frappe) return; frappe.provide("frappe.pages"); frappe.pages["gf-home"] = { on_page_load: mount, refresh: mount }; window.gf_home_mount = mount; }
    function start(){ if(!window.frappe || !frappe.ready){ setTimeout(start,100); return; } register(); frappe.ready(function(){ register(); if(frappe.router && frappe.router.on) frappe.router.on("change", () => setTimeout(guard,100)); window.addEventListener("hashchange", () => setTimeout(guard,100)); [100,700,1600,3000].forEach(t => setTimeout(guard,t)); }); }
    start();
})();
