document.addEventListener("DOMContentLoaded", () => {
    // Charger les binômes
    fetch("http://localhost:3000/binomes")
        .then(response => response.json())
        .then(data => {
            const binomeList = document.getElementById("binomeList");
            binomeList.innerHTML = "";
            data.forEach(binome => {
                const item = document.createElement("li");
                item.textContent = `${binome.etudiant1_nom} ${binome.etudiant1_prenom} et ${binome.etudiant2_nom} ${binome.etudiant2_prenom} - Groupe: ${binome.nom_groupe}`;
                binomeList.appendChild(item);
            });
        })
        .catch(error => console.error("Erreur lors de la récupération des binômes:", error));

    // Charger les groupes
    const selectGroupe = document.getElementById("groupe_nom");

    if (!selectGroupe) {
        console.error("❌ Élément introuvable !");
        return;
    }

    fetch("http://localhost:3000/groupes")
        .then(response => response.json())
        .then(groupes => {
            console.log(groupes);  // Vérifier ce que vous obtenez ici
            selectGroupe.innerHTML = '<option value="">Sélectionnez un groupe</option>';
            groupes.forEach(groupe => {
                const option = document.createElement("option");
                option.value = groupe.nom_groupe; // Assurez-vous que vous utilisez le bon nom de propriété
                option.textContent = groupe.nom_groupe; // Afficher le nom du groupe
                selectGroupe.appendChild(option);
            });
        })
        .catch(error => console.error("❌ Erreur lors du chargement des groupes:", error));
});

// Route pour associer un binôme à un groupe
app.post('/associerBinomeGroupe', (req, res) => {
    const { binome_id, groupe_nom } = req.body;

    if (!binome_id || !groupe_nom) {
        return res.status(400).json({ success: false, message: "Paramètres manquants !" });
    }

    // Rechercher l'ID du groupe dans la base de données
    connection.query("SELECT id FROM groupe WHERE nom_groupe = ?", [groupe_nom], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération du groupe :", err);
            return res.status(500).json({ success: false, message: "Erreur serveur" });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Groupe non trouvé" });
        }

        const groupeId = results[0].id;

        // Associer le binôme avec le groupe
        connection.query("UPDATE binomes SET groupe_id = ? WHERE id = ?", [groupeId, binome_id], (err, result) => {
            if (err) {
                console.error("Erreur lors de l'association du binôme :", err);
                return res.status(500).json({ success: false, message: "Erreur lors de l'association" });
            }

            // Si l'association a été effectuée avec succès
            res.json({ success: true, message: "Binôme associé au groupe avec succès" });
        });
    });
});

document.getElementById("btn-ajouter-binome-modal").addEventListener("click", function() {
    const matricule1 = document.getElementById("matricule1").value.trim();
    const matricule2 = document.getElementById("matricule2").value.trim() || null;

    if (!matricule1) {
        alert("Veuillez remplir le matricule de l'étudiant 1 !");
        return;
    }

    fetch('http://localhost:3000/ajouter-binome', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            matricule1: '12345',
            matricule2: '67890'
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Réponse du serveur:', data);
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
    });

// Fonction pour recharger la liste des binômes après ajout
function chargerBinomes() {
    const tableBody = document.getElementById("table-binomes");
    const selectBinome = document.getElementById("binome_id");

    if (!tableBody || !selectBinome) {
        console.error("❌ Élément introuvable !");
        return;
    }

    fetch("http://localhost:3000/binomes")
    .then(response => response.json())
    .then(binomes => {
        tableBody.innerHTML = "";
        selectBinome.innerHTML = "";

        binomes.forEach(binome => {
            // Création de la ligne pour l'étudiant 1
            const row1 = document.createElement("tr");
            row1.innerHTML = `
                <td rowspan="${binome.etudiant2_nom ? 2 : 1}">${binome.binome_id}</td>
                <td>${binome.etudiant1_matricule || "N/A"}</td>
                <td>${binome.etudiant1_nom || "Inconnu"}</td>
                <td>${binome.etudiant1_prenom || ""}</td>
            `;
            tableBody.appendChild(row1);

            // Ajout d'une deuxième ligne si le binôme a un deuxième étudiant
            if (binome.etudiant2_nom) {
                const row2 = document.createElement("tr");
                row2.innerHTML = `
                    <td>${binome.etudiant2_matricule || "N/A"}</td>
                    <td>${binome.etudiant2_nom || "Inconnu"}</td>
                    <td>${binome.etudiant2_prenom || ""}</td>
                `;
                tableBody.appendChild(row2);
            }

            // Ajouter le binôme à la liste déroulante
            const option = document.createElement("option");
            option.value = binome.binome_id;
            option.textContent = `Binôme ${binome.binome_id}`;
            selectBinome.appendChild(option);
        });
    })
    .catch(error => console.error("❌ Erreur lors du chargement des binômes:", error));
}


