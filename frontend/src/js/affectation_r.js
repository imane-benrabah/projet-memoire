// Récupérer l'ID du groupe sélectionné depuis le localStorage
const selectedGroupe = localStorage.getItem('selectedGroupe');

console.log("Valeur stockée dans localStorage:", selectedGroupe);


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

        // Filtrer les binômes appartenant au groupe sélectionné
        const filteredData = data.filter(binome => {
            const normalizedGroupeName = (binome.nom_groupe || "").trim().toLowerCase();
const normalizedSelectedGroup = (groupId || "").trim().toLowerCase();
return normalizedGroupeName === normalizedSelectedGroup;

        });

        if (filteredData.length > 0) {
            document.getElementById("groupe-name").innerText = ` ${groupId}`;
            const studentsList = document.getElementById("binome-list");
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
    <td><input type="date" class="form-control date-input" value="${new Date().toISOString().split('T')[0]}"></td>
    <td>
        <select class="form-select presence-select">
            <option value="present">Présent</option>
            <option value="absent">Absent</option>
        </select>
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
        <td><input type="date" class="form-control date-input" value="${new Date().toISOString().split('T')[0]}"></td>
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
            

            document.getElementById("etudiant-section").style.display = "block";
        } else {
            alert("Aucun binôme ajouté dans ce groupe.");
        }
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des données:', error);
        alert("Une erreur s'est produite lors du chargement des étudiants.");
    });

}

