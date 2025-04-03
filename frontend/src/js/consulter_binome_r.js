document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 DOM chargé, exécution du script...");

    const selectGroupe = document.getElementById("groupe-select");
    console.log("🎯 Élément récupéré :", selectGroupe);

    if (!selectGroupe) {
        console.error("❌ Élément #groupe-select introuvable !");
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

document.getElementById("suivant_1").addEventListener("click", function () {
    const selectedGroupe = document.getElementById("groupe-select").value;

    if (!selectedGroupe) {
        alert("Veuillez sélectionner un groupe !");
        return;
    }

    // 🔹 Corriger la clé utilisée pour correspondre à celle récupérée ailleurs
    localStorage.setItem("selectedGroupe", selectedGroupe);

    // Rediriger vers la page des binômes
    window.location.href = "affectation_r.html";
});

