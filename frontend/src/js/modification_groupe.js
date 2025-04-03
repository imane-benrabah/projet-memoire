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
    const apiUrl = `http://localhost:3000/binomes?group=${encodeURIComponent(groupId)}`;

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

        // Filtrer les binômes appartenant au groupe sélectionné
        const filteredData = data.filter(binome => {
            const normalizedGroupeName = binome.nom_groupe ? binome.nom_groupe.trim().toLowerCase() : '';
            return normalizedGroupeName === groupId;
        });

        if (filteredData.length > 0) {
            document.getElementById("group-name").innerText = ` ${groupId}`;
            const studentsList = document.getElementById("etudiants-list");
            studentsList.innerHTML = ""; // Réinitialiser la liste

            filteredData.forEach(binome => {
                console.log("Binôme récupéré :", binome); // Vérifier les données complètes du binôme
    console.log("ID du binôme:", binome.binome_id); // Vérifier si binome_id est bien défini
            
    const row1 = document.createElement("tr");

    // Si l'étudiant est seul, on ne met pas de rowspan
    if (binome.etudiant2_matricule) {
        row1.innerHTML = `
            <td rowspan="2">${binome.binome_id !== null && binome.binome_id !== undefined ? binome.binome_id : "Non défini"}</td>
        `;
    } else {
        row1.innerHTML = `
            <td>${binome.binome_id !== null && binome.binome_id !== undefined ? binome.binome_id : "Non défini"}</td>
        `;
    }
    
    row1.innerHTML += `
        <td>${binome.etudiant1_matricule || "N/A"}</td>
        <td>${binome.etudiant1_nom || "Inconnu"}</td>
        <td>${binome.etudiant1_prenom || ""}</td>
        <td class="btn-cell">
            <div class="btn-group" role="group">
                <button class="btn btn-warning btn-modifier" data-matricule="${binome.etudiant1_matricule}">Modifier</button>
                <button class="btn btn-danger btn-supprimer" data-matricule="${binome.etudiant1_matricule}" data-binomeId="${binome.binome_id}">Supprimer</button>
            </div>
        </td>
    `;
    
    studentsList.appendChild(row1);
    
    // Ajout du deuxième étudiant s'il existe
    if (binome.etudiant2_matricule) {
        const row2 = document.createElement("tr");
        row2.innerHTML = `
            <td>${binome.etudiant2_matricule || "N/A"}</td>
            <td>${binome.etudiant2_nom || "Inconnu"}</td>
            <td>${binome.etudiant2_prenom || ""}</td>
            <td class="btn-cell">
                <div class="btn-group" role="group">
                    <button class="btn btn-warning btn-modifier" data-matricule="${binome.etudiant2_matricule}">Modifier</button>
                    <button class="btn btn-danger btn-supprimer" data-matricule="${binome.etudiant2_matricule}" data-binomeId="${binome.binome_id}">Supprimer</button>
                </div>
            </td>
        `;
        studentsList.appendChild(row2);
    }
    
            });
            

            document.getElementById("etudiants-section").style.display = "block";
        } else {
            alert("Aucun binôme ajouté dans ce groupe.");
        }
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des données:', error);
        alert("Une erreur s'est produite lors du chargement des étudiants.");
    });

}

document.addEventListener("click", (e) => {
    // Vérifie si l'utilisateur clique sur un bouton Modifier
    if (e.target.classList.contains("btn-modifier")) {
        const button = e.target.closest("button");
        const matricule = button.dataset.matricule; // Récupérer le matricule

        if (!matricule) {
            console.error("Erreur : matricule non défini !");
            return;
        }

        console.log("Matricule récupéré pour modification:", matricule);

        // Récupérer les informations de l'étudiant via l'API
        fetch(`http://localhost:3000/api/etudiants/${matricule}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    // Remplir les champs de la modale avec les informations de l'étudiant
                    document.getElementById('matriculeInput').value = data.matricule;
                    document.getElementById('nomInput').value = data.nom;
                    document.getElementById('prenomInput').value = data.prenom;

                    // Ouvrir la modale
                    const modal = new bootstrap.Modal(document.getElementById('modalModifier'));
                    modal.show();
                }
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des données :", error);
            });
    }

    // Lorsque le bouton de confirmation est cliqué dans la modale
    if (e.target.id === "btnConfirmerModifier") {
        const matricule = document.getElementById('matriculeInput').value;
        const nom = document.getElementById('nomInput').value;
        const prenom = document.getElementById('prenomInput').value;

        // Envoie des données modifiées à l'API
        fetch(`http://localhost:3000/api/etudiants/${matricule}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nom: nom,
                prenom: prenom
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Étudiant modifié avec succès');
                // Fermer la modale
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalModifier'));
                modal.hide();

                // Rafraîchir les données de la table
                refreshTable();
            } else {
                alert('Erreur lors de la modification: ' + data.message);
            }
        })
        .catch(error => {
            console.error("Erreur lors de la modification :", error);
            alert('Une erreur s\'est produite.');
        });
    }

// Gestion de la suppression
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-supprimer")) {
        const button = e.target.closest("button");
        const binomeId = button.dataset.binomeid;
        const matricule = button.dataset.matricule;

        console.log("Matricule récupéré :", matricule);
        console.log("Binôme ID récupéré :", binomeId);

        if (!binomeId || binomeId === "Non défini") {
            console.error("Erreur : ID du binôme non défini !");
            alert("Impossible de supprimer : l'ID du binôme est manquant.");
            return;
        }

        fetch(`http://localhost:3000/api/etudiants/${matricule}/${binomeId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('L\'étudiant a été supprimé du binôme avec succès');

                // ✅ Suppression immédiate de la ligne du tableau
                const row = button.closest("tr");
                if (row) {
                    row.remove(); // Supprime la ligne de la table immédiatement
                }

                // Vérifie si l'étudiant supprimé était le dernier du binôme
const remainingRow = document.querySelector(`tr td:first-child[rowspan="2"][data-binome-id="${binomeId}"]`);

if (remainingRow) {
    const siblingRow = remainingRow.parentElement.nextElementSibling;
    
    if (siblingRow) {
        siblingRow.remove(); // Supprime la ligne de l'autre étudiant
    }

    // Met à jour la première ligne pour qu'elle ne s'affiche plus sur deux lignes
    remainingRow.removeAttribute("rowspan");

    // Vérifie s'il reste un étudiant
    const matriculeCell = remainingRow.parentElement.querySelector("td:nth-child(2)");
    if (!matriculeCell || matriculeCell.innerText.trim() === "N/A") {
        remainingRow.parentElement.remove(); // Supprime aussi la première ligne si plus d'étudiant
    }
}


                // Rafraîchir la table après suppression
                refreshTable();
            } else {
                alert('Erreur lors de la suppression de l\'étudiant du binôme');
            }
        })
        .catch(error => {
            console.error("Erreur lors de la suppression :", error);
            alert('Une erreur s\'est produite lors de la suppression');
        });
    }
});

// Fonction pour recharger la table avec les nouvelles données
function refreshTable() {
    // Récupérer les données actualisées de l'API
    fetch('http://localhost:3000/api/etudiants')
        .then(response => response.json())
        .then(data => {
            console.log('Données récupérées:', data); // Vérification des données récupérées
            updateTable(data);  // Mettre à jour la table avec les nouvelles données
        })
        .catch(error => {
            console.error('Erreur lors du rafraîchissement des données:', error);
        });
}

function updateTable(data) {
    const studentsList = document.getElementById("etudiants-list");
    studentsList.innerHTML = ""; // Réinitialiser la liste

    data.forEach(etudiant => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${etudiant.matricule}</td>
            <td>${etudiant.nom || "Inconnu"}</td>
            <td>${etudiant.prenom || ""}</td>
            <td class="btn-cell">
                <div class="btn-group" role="group">
                    <button class="btn btn-warning btn-modifier" data-matricule="${etudiant.matricule}">Modifier</button>
                    <button class="btn btn-danger btn-supprimer" data-matricule="${etudiant.matricule}">Supprimer</button>
                </div>
            </td>
        `;
        studentsList.appendChild(row);
    });
}
});