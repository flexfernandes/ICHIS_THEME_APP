frappe.ready(function () {

    function render_home() {

        const route = frappe.get_route();

        if (!route || route[0] !== "workspace") {
            document.body.classList.remove("gf-home-active");
            const old = document.getElementById("gf-modern-home");
            if (old) old.remove();
            return;
        }

        const container = document.querySelector(".layout-main-section");
        if (!container) return;

        if (document.getElementById("gf-modern-home")) return;

        document.body.classList.add("gf-home-active");

        container.innerHTML = `
            <div id="gf-modern-home" style="padding:30px;">

                <h1 style="font-size:32px; font-weight:700; color:#166534;">
                    GREENFARMS ERP
                </h1>

                <p style="color:#6b7280; margin-bottom:20px;">
                    Gestão industrial, processos, engenharia e produção
                </p>

                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:15px;">

                    ${card("Vendas", "Selling")}
                    ${card("Compras", "Buying")}
                    ${card("Estoque", "Stock")}
                    ${card("Produção", "Manufacturing")}
                    ${card("Projetos", "Projects")}
                    ${card("Financeiro", "Accounting")}

                </div>

            </div>
        `;
    }

    function card(title, route) {
        return `
            <div onclick="frappe.set_route('workspace','${route}')"
                 style="
                    padding:20px;
                    background:#ffffff;
                    border:1px solid #e5e7eb;
                    border-radius:12px;
                    cursor:pointer;
                    font-weight:600;
                    color:#111827;
                 ">
                ${title}
            </div>
        `;
    }

    setTimeout(render_home, 800);

    frappe.router.on('change', function () {
        setTimeout(render_home, 500);
    });

});