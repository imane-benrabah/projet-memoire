// Récupérer l'ID du groupe sélectionné depuis le localStorage
const selectedGroupe = localStorage.getItem('selectedGroupe');
const groupeNom = localStorage.getItem('selectedGroupeName');


console.log("Valeur stockée dans localStorage:", selectedGroupe);

// Nettoyer l'ID du groupe (trim + toLowerCase)
const cleanedGroupe = selectedGroupe ? selectedGroupe.trim().toLowerCase() : null;

if (cleanedGroupe) {
    console.log("Groupe sélectionné après nettoyage:", cleanedGroupe);
    fetchGroupInfo(cleanedGroupe);
} else {
    alert("Aucun groupe sélectionné dans le localStorage.");
}

// Fonction pour obtenir la date du jour au format YYYY-MM-DD
function formatDateToday() {
    return new Date().toISOString().split('T')[0];
}

// Fonction pour récupérer les informations d'un groupe
function fetchGroupInfo(groupId) {
    const apiUrl = `http://localhost:3000/api/groupes/${groupId}/etudiants`;
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

            const binomesMap = new Map();

            // Regrouper les étudiants par binôme
            data.forEach(etudiant => {
                const binomeId = etudiant.numero_binome;
                if (!binomesMap.has(binomeId)) {
                    binomesMap.set(binomeId, []);
                }
                binomesMap.get(binomeId).push(etudiant);
            });

            const studentsList = document.getElementById("binome-list");
            studentsList.innerHTML = "";

            if (binomesMap.size === 0) {
                alert("Aucun binôme ajouté dans ce groupe.");
                return;
            }

            document.getElementById("groupe-name").innerText = `groupe : ${groupeNom}`;
            document.getElementById("etudiant-section").style.display = "block";

            // Affichage des binômes
            binomesMap.forEach((etudiants, binomeId) => {
                const row1 = document.createElement("tr");

                const e1 = etudiants[0];
                const hasSecond = etudiants.length === 2;

                // Première ligne du binôme
                row1.innerHTML = hasSecond 
                    ? `<td rowspan="2">${binomeId}</td>` 
                    : `<td>${binomeId}</td>`;

                row1.innerHTML += `
                    <td>${e1.matricule}</td>
                    <td>${e1.nom}</td>
                    <td>${e1.prenom}</td>
                    <td><input type="date" class="form-control date-input" value="${formatDateToday()}"></td>
                    <td>
                        <select class="form-select presence-select">
                            <option value="present">Présent</option>
                            <option value="absent">Absent</option>
                        </select>
                    </td>
                `;
                studentsList.appendChild(row1);

                // Deuxième ligne du binôme s'il y a un second étudiant
                if (hasSecond) {
                    const e2 = etudiants[1];
                    const row2 = document.createElement("tr");
                    row2.innerHTML = `
                        <td>${e2.matricule}</td>
                        <td>${e2.nom}</td>
                        <td>${e2.prenom}</td>
                        <td><input type="date" class="form-control date-input" value="${formatDateToday()}"></td>
                        <td>
                            <select class="form-select presence-select">
                                <option value="present">Présent</option>
                                <option value="absent">Absent</option>
                            </select>
                        </td>
                    `;
                    studentsList.appendChild(row2);
                }
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données:', error);
            alert("Une erreur s'est produite lors du chargement des étudiants. Veuillez réessayer.");
        });
}



// Fonction pour enregistrer les présences
// Fonction pour enregistrer les présences
// Fonction pour enregistrer les présences
document.getElementById("save-attendance").addEventListener("click", async function() {
    const rows = document.querySelectorAll("#binome-list tr");
    const presences = [];
    const groupeId = localStorage.getItem('selectedGroupe');

    if (!groupeId) {
        alert("Aucun groupe sélectionné");
        return;
    }

    // Nouvelle approche plus robuste pour traiter les binômes
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.cells;
        
        // Détection du type de ligne (binôme simple ou partie de binôme)
        if (cells.length === 6) {
            // Ligne complète (binôme seul ou première ligne de binôme à 2)
            const isBinomeWithTwo = cells[0].hasAttribute('rowspan') && 
                                  parseInt(cells[0].getAttribute('rowspan')) === 2;
            
            // Premier étudiant
            const etudiant1 = {
                matricule: cells[1].textContent.trim(),
                nom: cells[2].textContent.trim(),
                prenom: cells[3].textContent.trim(),
                date: row.querySelector(".date-input").value || formatDateToday(),
                presence: row.querySelector(".presence-select").value || 'present'
            };
            
            presences.push({
                matricule: etudiant1.matricule,
                date: etudiant1.date,
                presence: etudiant1.presence
            });

            // Si binôme à 2, traiter la ligne suivante
            if (isBinomeWithTwo && rows[i+1]) {
                const nextRow = rows[i+1];
                const nextCells = nextRow.cells;
                
                if (nextCells.length === 5) { // Ligne du deuxième étudiant
                    const etudiant2 = {
                        matricule: nextCells[0].textContent.trim(),
                        nom: nextCells[1].textContent.trim(),
                        prenom: nextCells[2].textContent.trim(),
                        date: nextRow.querySelector(".date-input").value || formatDateToday(),
                        presence: nextRow.querySelector(".presence-select").value || 'present'
                    };
                    
                    presences.push({
                        matricule: etudiant2.matricule,
                        date: etudiant2.date,
                        presence: etudiant2.presence
                    });
                    
                    i++; // Passer à la ligne suivante
                }
            }
        } else if (cells.length === 5) {
            // Cas particulier (deuxième étudiant seul)
            const etudiant = {
                matricule: cells[0].textContent.trim(),
                nom: cells[1].textContent.trim(),
                prenom: cells[2].textContent.trim(),
                date: row.querySelector(".date-input").value || formatDateToday(),
                presence: row.querySelector(".presence-select").value || 'present'
            };
            
            presences.push({
                matricule: etudiant.matricule,
                date: etudiant.date,
                presence: etudiant.presence
            });
        }
    }

    try {
        const btn = this;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

        const response = await fetch('http://localhost:3000/api/presences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                groupeId: groupeId,
                presences: presences 
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de l\'enregistrement');
        }
        
        alert(data.message || `${presences.length} présences enregistrées avec succès`);
    } catch (error) {
        console.error('Erreur:', error);
        alert(`Erreur: ${error.message}`);
    } finally {
        const btn = document.getElementById("save-attendance");
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
        }
    }

// Modifiez la partie gestion du clic et de la sélection :

// Modifiez la partie gestion du clic et de la sélection :
// Fonction pour gérer la sélection des binômes
function setupBinomeSelection() {
    // Écouteur de clic sur les cellules de binôme
    document.getElementById('binome-list').addEventListener('click', function(e) {
        const clickedCell = e.target.closest('.binome-cell');
        if (!clickedCell) return;

        const selectedNum = clickedCell.textContent.trim();
        console.log("Binôme sélectionné:", selectedNum);
        
        // Mise à jour du localStorage
        localStorage.setItem('selectedBinomeNum', selectedNum);
        localStorage.setItem('lastSelectedBinome', selectedNum);
        
        updateSelectionVisual(clickedCell);
    });

    // Écouteur pour le bouton Affecter Responsabilité
    document.querySelector('.dropdown-item[href*="affecter_responsab_r"]').addEventListener('click', function(e) {
        const selectedNum = localStorage.getItem('selectedBinomeNum') || 
                          localStorage.getItem('lastSelectedBinome');
        
        if (!selectedNum) {
            e.preventDefault();
            alert('Veuillez sélectionner un binôme');
            return;
        }
        
        const groupeName = document.getElementById('groupe-name').textContent.replace('groupe : ', '');
        localStorage.setItem('selectedGroupeName', groupeName);
    });

    // Restaurer la sélection au chargement
    restoreSelection();
}

function updateSelectionVisual(clickedCell) {
    // Nettoyer ancienne sélection
    document.querySelectorAll('.selected-row').forEach(row => {
        row.classList.remove('selected-row');
    });

    // Appliquer nouvelle sélection
    const row = clickedCell.closest('tr');
    row.classList.add('selected-row');

    if (clickedCell.hasAttribute('rowspan')) {
        const rowspan = parseInt(clickedCell.getAttribute('rowspan'));
        let nextRow = row.nextElementSibling;
        
        for (let i = 1; i < rowspan; i++) {
            if (nextRow) {
                nextRow.classList.add('selected-row');
                nextRow = nextRow.nextElementSibling;
            }
        }
    }
}

function restoreSelection() {
    const selectedNum = localStorage.getItem('selectedBinomeNum');
    if (!selectedNum) return;

    const cells = document.querySelectorAll('.binome-cell');
    cells.forEach(cell => {
        if (cell.textContent.trim() === selectedNum) {
            updateSelectionVisual(cell);
        }
    });
}
});
