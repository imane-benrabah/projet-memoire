document.addEventListener("DOMContentLoaded", () => {
    const menuCreerGroupes = document.getElementById("menu-creer-groupes");

    if (menuCreerGroupes) {
        menuCreerGroupes.addEventListener("click", () => {
            window.location.href = "creer_groupe.html"; // Redirection vers la page
        });
    }
});
