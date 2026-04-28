(function () {
    function markBody() {
        if (document.body && !document.body.classList.contains("gf-aura-v16-safe")) {
            document.body.classList.add("gf-aura-v16-safe");
        }
    }

    function forceLoadCssOnce() {
        var id = "gf-aura-v16-safe-forced-css";
        if (document.getElementById(id)) return;

        var link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = "/assets/ichis/css/gf_aura_desk_safe.css";
        document.head.appendChild(link);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            markBody();
            forceLoadCssOnce();
        });
    } else {
        markBody();
        forceLoadCssOnce();
    }
})();
