frappe.ready(function () {
    console.log("ICHIS Theme carregado com sucesso");

    if (!window.location.hash.includes("workspace")) return;

    setTimeout(() => {
        document.body.style.backgroundColor = "#f4f7fb";
    }, 500);
});
