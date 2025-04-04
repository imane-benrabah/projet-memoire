document.addEventListener("DOMContentLoaded", function() {
    const menuItems = document.querySelectorAll(".sidebar nav ul li a");
    
    menuItems.forEach(item => {
        item.addEventListener("click", function() {
            // Retirer la classe active de tous les éléments
            menuItems.forEach(i => i.parentElement.classList.remove("active"));
            
            // Ajouter la classe active à l'élément cliqué
            this.parentElement.classList.add("active");
        });
    });
});
