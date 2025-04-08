// Récupérer l'ID du groupe sélectionné depuis le localStorage
const selectedGroupe = localStorage.getItem('selectedGroupe');

// Normalisation du groupe (enlever les espaces et convertir en minuscules)
const cleanedGroupe = selectedGroupe ? selectedGroupe.trim().toLowerCase() : null;

if (cleanedGroupe) {
    console.log("Groupe sélectionné après nettoyage:", cleanedGroupe);
    fetchGroupInfo(cleanedGroupe);
} else {
    alert("Aucun groupe sélectionné.");
}

function fetchGroupInfo(groupId) {
    const apiUrl = `http://localhost:3000/api/binomes?group=${encodeURIComponent(groupId)}`;
    console.log("Requête envoyée à l'API:", apiUrl);

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur serveur: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Données récupérées:", data);
            displayGroupData(groupId, data);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données:', error);
            alert("Une erreur s'est produite lors du chargement des étudiants du groupe");
        });
}

function displayGroupData(groupId, data) {
    if (data.length > 0) {
        document.getElementById("group-name").textContent = groupId;
        const studentsList = document.getElementById("etudiants-list");
        studentsList.innerHTML = "";

        data.forEach(binome => {
            addBinomeToTable(binome, studentsList);
        });

        document.getElementById("etudiants-section").style.display = "block";
    } else {
        alert("Aucun binôme ajouté dans ce groupe.");
    }
}

function addBinomeToTable(binome, container) {
    console.log("Binôme récupéré:", binome);
    
    const row1 = document.createElement("tr");
    row1.dataset.binomeId = binome.binome_id;

    if (binome.etudiant2_matricule) {
        row1.innerHTML = `
            <td rowspan="2">${binome.binome_id || "Non défini"}</td>
            <td>${binome.etudiant1_matricule || "N/A"}</td>
            <td>${binome.etudiant1_nom || "Inconnu"}</td>
            <td>${binome.etudiant1_prenom || ""}</td>
            <td class="btn-cell">
                <div class="btn-group" role="group">
<button class="btn btn-warning btn-modifier" 
        data-matricule="${binome.etudiant1_matricule}" 
        data-nom="${binome.etudiant1_nom}" 
        data-prenom="${binome.etudiant1_prenom}">
    Modifier
</button>
                    <button class="btn btn-danger btn-supprimer" data-matricule="${binome.etudiant1_matricule}" data-binome-id="${binome.binome_id}">Supprimer</button>
                </div>
            </td>
        `;
        container.appendChild(row1);

        const row2 = document.createElement("tr");
        row2.dataset.binomeId = binome.binome_id;
        row2.innerHTML = `
            <td>${binome.etudiant2_matricule || "N/A"}</td>
            <td>${binome.etudiant2_nom || "Inconnu"}</td>
            <td>${binome.etudiant2_prenom || ""}</td>
            <td class="btn-cell">
                <div class="btn-group" role="group">
<button class="btn btn-warning btn-modifier" 
        data-matricule="${binome.etudiant2_matricule}" 
        data-nom="${binome.etudiant2_nom}" 
        data-prenom="${binome.etudiant2_prenom}">
    Modifier
</button>
                    <button class="btn btn-danger btn-supprimer" data-matricule="${binome.etudiant2_matricule}" data-binome-id="${binome.binome_id}">Supprimer</button>
                </div>
            </td>
        `;
        container.appendChild(row2);
    } else {
        row1.innerHTML = `
            <td>${binome.binome_id || "Non défini"}</td>
            <td>${binome.etudiant1_matricule || "N/A"}</td>
            <td>${binome.etudiant1_nom || "Inconnu"}</td>
            <td>${binome.etudiant1_prenom || ""}</td>
            <td class="btn-cell">
                <div class="btn-group" role="group">
<button class="btn btn-warning btn-modifier" 
        data-matricule="${binome.etudiant1_matricule}" 
        data-nom="${binome.etudiant1_nom}" 
        data-prenom="${binome.etudiant1_prenom}">
    Modifier
</button>
                    <button class="btn btn-danger btn-supprimer" data-matricule="${binome.etudiant1_matricule}" data-binome-id="${binome.binome_id}">Supprimer</button>
                </div>
            </td>
        `;
        container.appendChild(row1);
    }
}

// Écouteurs pour boutons "Modifier"
document.addEventListener("click", function(e) {
    // Modification
    if (e.target.classList.contains("btn-modifier")) {
        handleModifyClick(e.target);
    }

    // Suppression
    if (e.target.classList.contains("btn-supprimer")) {
        handleDeleteClick(e.target);
    }

    // Confirmation de modification
    if (e.target.id === "btnConfirmerModifier") {
        handleConfirmModify();
    }
});

// Modifier un étudiant
document.getElementById("btnConfirmerModifier")?.addEventListener("click", () => {
    const matricule = document.getElementById("matriculeInput").value.trim();
    const nom = document.getElementById("nomInput").value.trim();
    const prenom = document.getElementById("prenomInput").value.trim();

    if (!nom || !prenom) {
        alert("Veuillez remplir le nom et le prénom !");
        return;
    }

    fetch(`http://localhost:3000/api/etudiants/${matricule}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nom: nom,
            prenom: prenom
        })
    })
        .then(response => {
            if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'étudiant');
            return response.json();
        })
        .then(data => {
            alert("Étudiant modifié avec succès !");
            const modal = bootstrap.Modal.getInstance(document.getElementById("modalModifier"));
            modal.hide();
            refreshTable(); // recharge les données
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert("Erreur lors de la modification de l'étudiant: " + error.message);
        });
});

// Fonction de suppression
async function handleDeleteClick(button) {
    const matricule = button.dataset.matricule;
    const studentName = button.dataset.studentName || matricule;
    const binomeId = button.dataset.binomeId;

    if (!matricule) {
        alert("Erreur: Matricule manquant");
        return;
    }

    if (!confirm(`Confirmez la suppression de ${studentName} ?`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/etudiants/${matricule}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(text || "Réponse invalide du serveur");
        }

        if (!response.ok) {
            throw new Error(data.message || `Erreur ${response.status}`);
        }

        updateBinomesInLocalStorage(binomeId);
        removeStudentRow(button, binomeId);
        alert("Étudiant supprimé avec succès");

    } catch (error) {
        console.error("Erreur complète:", {
            error: error.message,
            matricule,
            timestamp: new Date().toISOString()
        });
        alert(`Échec de la suppression: ${error.message}`);
    }
}

function updateBinomesInLocalStorage(binomeId) {
    let binomes = JSON.parse(localStorage.getItem('binomes')) || [];
    binomes = binomes.filter(binome => binome.binome_id !== binomeId);
    localStorage.setItem('binomes', JSON.stringify(binomes));
}

function removeStudentRow(button, binomeId) {
    const row = button.closest("tr");
    const binomeRows = document.querySelectorAll(`tr[data-binome-id="${binomeId}"]`);

    if (binomeRows.length === 2) {
        const firstRow = binomeRows[0];
        const secondRow = binomeRows[1];

        if (row === firstRow) {
            firstRow.querySelector("td[rowspan]").removeAttribute("rowspan");
            secondRow.remove();
        } else {
            firstRow.innerHTML = firstRow.innerHTML.replace('rowspan="2"', '');
            row.remove();
        }
    } else {
        row.remove();
    }
}


// Fonction pour gérer le clic sur le bouton de modification
function handleModifyClick(button) {
    const matricule = button.dataset.matricule;
    const nom = button.dataset.nom;
    const prenom = button.dataset.prenom;

    // Afficher le modal avec les informations de l'étudiant
    document.getElementById("matriculeInput").value = matricule;
    document.getElementById("nomInput").value = nom;
    document.getElementById("prenomInput").value = prenom;

    // Ouvrir le modal
    const modal = new bootstrap.Modal(document.getElementById("modalModifier"));
    modal.show();
}


function refreshTable() {
    const selectedGroupe = localStorage.getItem('selectedGroupe');
    if (selectedGroupe) {
        fetchGroupInfo(selectedGroupe.trim().toLowerCase());
    }
}
