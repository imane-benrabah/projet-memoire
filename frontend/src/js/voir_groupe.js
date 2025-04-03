document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 DOM chargé, exécution du script...");

    const selectGroupe = document.getElementById("group-select");
    console.log("🎯 Élément récupéré :", selectGroupe);

    if (!selectGroupe) {
        console.error("❌ Élément #group-select introuvable !");
        return;
    }

    // Charger les groupes depuis l'API
    fetch("http://localhost:3000/groupes")
        .then(response => response.json())
        .then(groupes => {
            console.log("✅ Groupes reçus :", groupes);

            // Ajouter une option par défaut
            selectGroupe.innerHTML = '<option value="">Sélectionner un groupe</option>';

            groupes.forEach(groupe => {
                console.log("➕ Ajout du groupe :", groupe);

                const option = document.createElement("option");
                option.value = groupe.nom_groupe;
                option.textContent = groupe.nom_groupe;
                selectGroupe.appendChild(option);
            });

            console.log("📌 Options finales :", selectGroupe.innerHTML);
        })
        .catch(error => console.error("❌ Erreur lors du chargement des groupes :", error));
});

document.getElementById("suivant").addEventListener("click", function () {
    const selectedGroup = document.getElementById("group-select").value;

    if (!selectedGroup) {
        alert("Veuillez sélectionner un groupe !");
        return;
    }

    // Stocker l'ID du groupe sélectionné dans localStorage
    localStorage.setItem("selectedGroup", selectedGroup);

    // Rediriger vers la page de modification
    window.location.href = "modification_groupe.html";
});

