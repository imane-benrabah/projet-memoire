document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 DOM chargé, exécution du script...");

    // 1. Récupération des éléments DOM
    const selectGroupe = document.getElementById("group-select");
    const btnSuivant = document.getElementById("suivant");
    
    console.log("🎯 Éléments récupérés :", {selectGroupe, btnSuivant});

    // 2. Validation des éléments
    if (!selectGroupe || !btnSuivant) {
        console.error("❌ Éléments introuvables !");
        return;
    }

    // 3. Chargement des groupes
    fetch("http://localhost:3000/api/groupes")  // Note: J'ai ajouté /api/ pour cohérence
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }
            return response.json();
        })
        .then(groupes => {
            console.log("✅ Groupes reçus :", groupes);

            // 4. Construction des options
            selectGroupe.innerHTML = '<option value="" disabled selected>Sélectionner un groupe</option>';
            
            groupes.forEach(groupe => {
                console.log("➕ Ajout du groupe :", groupe.nom_groupe);
                
                const option = new Option(groupe.nom_groupe, groupe.nom_groupe);
                selectGroupe.add(option);
            });

            console.log("📌 Options finales :", selectGroupe.options.length);
        })
        .catch(error => {
            console.error("❌ Erreur lors du chargement des groupes :", error);
            alert("Erreur lors du chargement des groupes. Veuillez réessayer.");
        });

    // 5. Gestion du clic sur le bouton "Suivant"
    btnSuivant.addEventListener("click", function () {
        const selectedGroup = selectGroupe.value;
        
        if (!selectedGroup) {
            alert("Veuillez sélectionner un groupe !");
            selectGroupe.focus();
            return;
        }

        console.log("🔵 Groupe sélectionné :", selectedGroup);
        
        // 6. Stockage et redirection
        try {
            localStorage.setItem("selectedGroup", selectedGroup);
            console.log("💾 Groupe enregistré dans localStorage");
            
            window.location.href = "modification_groupe.html";
        } catch (e) {
            console.error("❌ Erreur de stockage/redirection :", e);
            alert("Une erreur est survenue. Veuillez réessayer.");
        }
    });
});