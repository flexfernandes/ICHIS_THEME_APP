frappe.pages['gf-home'].on_page_load = function(wrapper) {
    if (window.ICHIS_GF_HOME && window.ICHIS_GF_HOME.renderPage) {
        window.ICHIS_GF_HOME.renderPage(wrapper);
        return;
    }

    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'GREENFARMS',
        single_column: true
    });

    page.main.html('<div style="padding:24px">GF Home carregada. Aguarde o bundle principal.</div>');
};
