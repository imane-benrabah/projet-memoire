document.addEventListener("DOMContentLoaded", () => {
    // Charger initialement les données
    chargerBinomes();
    chargerGroupes();
});

// Fonction pour charger les binômes
function chargerBinomes() {
    const tableBody = document.getElementById("table-binomes");
    const selectBinome = document.getElementById("binome_id");
    const binomeList = document.getElementById("binomeList");

    fetch("http://localhost:3000/api/binomes")
        .then(response => {
            if (!response.ok) throw new Error('Erreur réseau');
            return response.json();
        })
        .then(binomes => {
            // Vider les contenus existants
            if (tableBody) tableBody.innerHTML = "";
            if (selectBinome) selectBinome.innerHTML = "";
            if (binomeList) binomeList.innerHTML = "";

            // Pour chaque binôme
            binomes.forEach(binome => {
                // Ajout à la liste
                if (binomeList) {
                    const item = document.createElement("li");
                    item.textContent = `${binome.etudiant1_nom} ${binome.etudiant1_prenom} et ${binome.etudiant2_nom || ''} ${binome.etudiant2_prenom || ''} - Groupe: ${binome.nom_groupe || 'Aucun'}`;
                    binomeList.appendChild(item);
                }

                // Ajout au tableau
                if (tableBody) {
                    const row1 = document.createElement("tr");
                    row1.innerHTML = `
                        <td rowspan="${binome.etudiant2_nom ? 2 : 1}">${binome.binome_id}</td>
                        <td>${binome.etudiant1_matricule || "N/A"}</td>
                        <td>${binome.etudiant1_nom || "Inconnu"}</td>
                        <td>${binome.etudiant1_prenom || ""}</td>
                    `;
                    tableBody.appendChild(row1);

                    if (binome.etudiant2_nom) {
                        const row2 = document.createElement("tr");
                        row2.innerHTML = `
                            <td>${binome.etudiant2_matricule || "N/A"}</td>
                            <td>${binome.etudiant2_nom || "Inconnu"}</td>
                            <td>${binome.etudiant2_prenom || ""}</td>
                        `;
                        tableBody.appendChild(row2);
                    }
                }

                // Ajout au select
                if (selectBinome) {
                    const option = document.createElement("option");
                    option.value = binome.binome_id;
                    option.textContent = `Binôme ${binome.binome_id}`;
                    selectBinome.appendChild(option);
                }
            });
        })
        .catch(error => {
            console.error("Erreur lors du chargement des binômes:", error);
            alert("Erreur lors du chargement des binômes");
        });
}

// Fonction pour charger les groupes
function chargerGroupes() {
    const selectGroupe = document.getElementById("groupe_nom");

    if (!selectGroupe) {
        console.error("Élément groupe_nom introuvable !");
        return;
    }

    fetch("http://localhost:3000/api/groupes")
        .then(response => {
            if (!response.ok) throw new Error('Erreur réseau');
            return response.json();
        })
        .then(groupes => {
            selectGroupe.innerHTML = '<option value="">Sélectionnez un groupe</option>';
            groupes.forEach(groupe => {
                const option = document.createElement("option");
                option.value = groupe.nom_groupe;
                option.textContent = groupe.nom_groupe;
                selectGroupe.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Erreur lors du chargement des groupes:", error);
            alert("Erreur lors du chargement des groupes");
        });
}

// Fonction pour associer un binôme à un groupe
function associerBinomeGroupe() {
    const selectedBinomeId = document.getElementById("binome_id").value;
    const selectedGroupName = document.getElementById("groupe_nom").value;

    if (!selectedBinomeId || !selectedGroupName) {
        alert("Veuillez sélectionner un binôme ET un groupe !");
        return;
    }

    fetch('http://localhost:3000/api/binomes/associer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            binome_id: selectedBinomeId,
            groupe_nom: selectedGroupName
        })
    })
    .then(response => {
        if (!response.ok) throw new Error(`Erreur HTTP! statut: ${response.status}`);
        return response.json();
    })
    .then(data => {
        alert("Binôme associé au groupe avec succès !");
        chargerBinomes(); // Recharger les données
    })
    .catch(error => {
        console.error("Erreur:", error);
        alert("Erreur lors de l'association: " + error.message);
    });
}

// Fonction pour ajouter un nouveau binôme
function ajouterBinome() {
    const matricule1 = document.getElementById("matricule1").value.trim();
    const matricule2 = document.getElementById("matricule2").value.trim();

    if (!matricule1) {
        alert("Veuillez remplir le matricule de l'étudiant 1 !");
        return;
    }

    fetch('http://localhost:3000/api/binomes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            matricule1: matricule1,
            matricule2: matricule2 || null
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la création du binôme');
        return response.json();
    })
    .then(data => {
        alert("Binôme créé avec succès !");
        chargerBinomes(); // Recharger les données
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert("Erreur lors de la création du binôme: " + error.message);
    });
}

// Écouteurs d'événements
document.getElementById("btn-associer")?.addEventListener("click", associerBinomeGroupe);
document.getElementById("btn-ajouter-binome-modal")?.addEventListener("click", ajouterBinome);