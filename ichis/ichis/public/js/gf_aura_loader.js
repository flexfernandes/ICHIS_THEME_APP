(function () {
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
