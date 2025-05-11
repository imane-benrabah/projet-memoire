-- Création de la base de données
CREATE DATABASE projet;
USE projet;

-- Table Compte
CREATE TABLE Compte (
    idC INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Table Utilisateur
CREATE TABLE Utilisateur (
    idU INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    image VARCHAR(255),
    bio TEXT,
    sexe CHAR(1),
    dateNaissance DATE,
    idC INT NOT NULL,
    FOREIGN KEY (idC) REFERENCES Compte(idC)
);

-- Table Administrateur
CREATE TABLE Administrateur (
    idU INT PRIMARY KEY,
    FOREIGN KEY (idU) REFERENCES Utilisateur(idU)
);

-- Table Enseignant
CREATE TABLE Enseignant (
    idU INT PRIMARY KEY,
    FOREIGN KEY (idU) REFERENCES Utilisateur(idU)
);

-- Table EnseignantResponsable
CREATE TABLE EnseignantResponsable (
    idU INT PRIMARY KEY,
    FOREIGN KEY (idU) REFERENCES Enseignant(idU)
);

-- Table EnseignantPrincipal
CREATE TABLE EnseignantPrincipal (
    idU INT PRIMARY KEY,
    FOREIGN KEY (idU) REFERENCES Enseignant(idU)
);


-- Table Binome
CREATE TABLE Binome (
    idB INT PRIMARY KEY ,
    responsabilite VARCHAR(50),
    idG INT,
    FOREIGN KEY (idG) REFERENCES Groupe(idG)
);

-- Table Groupe (créée après Binome car il y a une référence circulaire)
CREATE TABLE Groupe (
    idG INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    idS INT,
    enseignantRId INT,
    FOREIGN KEY (idS) REFERENCES Sujet(idS),
    FOREIGN KEY (enseignantRId) REFERENCES EnseignantResponsable(idU)
);

-- Mise à jour de la contrainte étrangère dans Binome après création de Groupe
ALTER TABLE Binome
ADD CONSTRAINT fk_binome_groupe
FOREIGN KEY (idG) REFERENCES Groupe(idG);

-- Table Sujet
CREATE TABLE Sujet (
    idS INT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(100) NOT NULL,
    description TEXT,
    enseignantRId INT,
    FOREIGN KEY (enseignantRId) REFERENCES EnseignantResponsable(idU)
);

-- Table Annonce
CREATE TABLE Annonce (
    idA INT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME,
    idU INT NOT NULL,
    FOREIGN KEY (idU) REFERENCES Utilisateur(idU)
);

-- Table Etudiant
CREATE TABLE Etudiant (
    idU INT PRIMARY KEY,
    matricule VARCHAR(20) NOT NULL UNIQUE,
    noteFinal FLOAT,
    idB INT,
    FOREIGN KEY (idU) REFERENCES Utilisateur(idU),
    FOREIGN KEY (idB) REFERENCES Binome(idB)
);

-- Table Note
CREATE TABLE Note (
    idEtape INT,
    idB INT,
    note FLOAT NOT NULL,
    PRIMARY KEY (idEtape, idB),
    FOREIGN KEY (idEtape) REFERENCES Etape(idEtape),
    FOREIGN KEY (idB) REFERENCES Binome(idB)
);

-- Table RefrencesSujet
CREATE TABLE RefrencesSujet (
    idRef INT PRIMARY KEY AUTO_INCREMENT,
    reference TEXT NOT NULL,
    idS INT NOT NULL,
    FOREIGN KEY (idS) REFERENCES Sujet(idS)
);

-- Table PrerequisSujet
CREATE TABLE PrerequisSujet (
    idPre INT PRIMARY KEY AUTO_INCREMENT,
    prerequis TEXT NOT NULL,
    idS INT NOT NULL,
    FOREIGN KEY (idS) REFERENCES Sujet(idS)
);

CREATE TABLE Cas (
    idCas INT PRIMARY KEY AUTO_INCREMENT,
    acteur VARCHAR(100) NOT NULL,
    cas TEXT NOT NULL,
    statut VARCHAR(20) NOT NULL,
    idS INT NOT NULL,
    idB INT NOT NULL,
    FOREIGN KEY (idS) REFERENCES Sujet(idS),
    FOREIGN KEY (idB) REFERENCES Binome(idB)
);

CREATE TABLE Rapport (
    idR INT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(100) NOT NULL,
    createdAt DATETIME NOT NULL,
    idB INT NOT NULL,
    FOREIGN KEY (idB) REFERENCES Binome(idB)
);

-- Table RapportFinal
CREATE TABLE RapportFinal (
    idR INT PRIMARY KEY,
    FOREIGN KEY (idR) REFERENCES Rapport(idR)
);

-- Table RapportEtape
CREATE TABLE RapportEtape (
    idR INT PRIMARY KEY,
    FOREIGN KEY (idR) REFERENCES Rapport(idR)
);

-- Table RapportTâches
CREATE TABLE RapportTâches (
    idR INT PRIMARY KEY,
    FOREIGN KEY (idR) REFERENCES Rapport(idR)
);

CREATE TABLE Etape (
    idEtape INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255),
    dateDebut DATE,
    dateFin DATE,
    idR INT,
    idS INT,
    FOREIGN KEY (idR) REFERENCES Rapport(idR),
    FOREIGN KEY (idS) REFERENCES Sujet(idS)
);

CREATE TABLE Tache (
    idTache INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255),
    dateDebut DATE,
    dateFin DATE,
    idR INT,
    idEtape INT,
    FOREIGN KEY (idR) REFERENCES Rapport(idR),
    FOREIGN KEY (idEtape) REFERENCES Etape(idEtape)
);

-- Table VersionRapport
CREATE TABLE VersionRapport (
    idVR INT PRIMARY KEY AUTO_INCREMENT,
    description TEXT,
    lien VARCHAR(255) NOT NULL,
    updatedAt DATETIME NOT NULL,
    idR INT NOT NULL,
    FOREIGN KEY (idR) REFERENCES Rapport(idR)
);

-- Table EvaluationRapport
CREATE TABLE EvaluationRapport (
    idER INT PRIMARY KEY AUTO_INCREMENT,
    description TEXT,
    updatedAt DATETIME NOT NULL,
    idR INT NOT NULL,
    FOREIGN KEY (idR) REFERENCES Rapport(idR)
);

CREATE TABLE FeedBack (
    idF INT PRIMARY KEY AUTO_INCREMENT,
    description TEXT,
    idB INT NOT NULL,
    idR INT NOT NULL,
    FOREIGN KEY (idB) REFERENCES Binome(idB),
    FOREIGN KEY (idR) REFERENCES Rapport(idR)
);

-- Table DatePresence
CREATE TABLE DatePresence (
    idDP INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL
);

-- Table Presence
CREATE TABLE Presence (
    idDP INT,
    etudiantId INT,
    etat VARCHAR(20) NOT NULL,
    PRIMARY KEY (idDP, etudiantId),
    FOREIGN KEY (idDP) REFERENCES DatePresence(idDP),
    FOREIGN KEY (etudiantId) REFERENCES Etudiant(idU)
);

-- Table Question
CREATE TABLE Question (
    idQ INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    reponse TEXT,
    etat VARCHAR(20) NOT NULL,
    enseignantRId INT,
    etudiantId INT,
    FOREIGN KEY (enseignantRId) REFERENCES EnseignantResponsable(idU),
    FOREIGN KEY (etudiantId) REFERENCES Etudiant(idU)
);

-- Table Reunion
CREATE TABLE Reunion (
    idRN INT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(100) NOT NULL,
    remarque TEXT,
    lien VARCHAR(255),
    dateDebut DATETIME NOT NULL,
    idG INT NOT NULL,
    enseignantRId INT NOT NULL,
    FOREIGN KEY (idG) REFERENCES Groupe(idG),
    FOREIGN KEY (enseignantRId) REFERENCES EnseignantResponsable(idU)
);

-- Table Participation
CREATE TABLE Participation (
    etudiantId INT,
    idRN INT,
    etat VARCHAR(20) NOT NULL,
    PRIMARY KEY (etudiantId, idRN),
    FOREIGN KEY (etudiantId) REFERENCES Etudiant(idU),
    FOREIGN KEY (idRN) REFERENCES Reunion(idRN)
);

--base externe--

CREATE DATABASE  consultation;

-- Utilisation de la base
USE consultation;   

--la table enseignants--
CREATE TABLE Enseignants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  role VARCHAR(50) NOT NULL
);

--la table binomes--
CREATE TABLE BinomeExterne (
    idBinome INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Étudiant 1
    matricule1 VARCHAR(20) NOT NULL,
    nom1 VARCHAR(50) NOT NULL,
    prenom1 VARCHAR(50) NOT NULL,
    
    -- Étudiant 2 (peut être NULL si binôme incomplet)
    matricule2 VARCHAR(20),
    nom2 VARCHAR(50),
    prenom2 VARCHAR(50),
    email1 VARCHAR(255),
    email2 VARCHAR(255);
    
    -- Contraintes d'unicité
    UNIQUE (matricule1),
    UNIQUE (matricule2),
    

);


--remplir la base extere--

INSERT INTO BinomeExterne (matricule1, nom1, prenom1, matricule2, nom2, prenom2) VALUES
-- Binômes complets (2 étudiants algériens)
('20240001', 'Boukhari', 'Mohamed', '20240002', 'Benali', 'Amina'),
('20240003', 'Kadri', 'Karim', '20240004', 'Saadi', 'Leila'),
('20240005', 'Mansouri', 'Yacine', '20240006', 'Bouziane', 'Fatima'),
('20240007', 'Taleb', 'Nassim', '20240008', 'Cherif', 'Djamila'),

-- Binômes incomplets (1 étudiant algérien)
('20240009', 'Belkacem', 'Farid', NULL, NULL, NULL),
('20240010', 'Zitouni', 'Samir', NULL, NULL, NULL),
('20240011', 'Guerroudj', 'Hakim', NULL, NULL, NULL),

-- Autres binômes complets
('20240012', 'Dahmani', 'Adel', '20240013', 'Ouali', 'Yasmina'),
('20240014', 'Boukella', 'Rachid', '20240015', 'Hamidou', 'Soraya'),
('20240016', 'Lounes', 'Tarek', '20240017', 'Mammeri', 'Nadia'),

-- Derniers binômes
('20240018', 'Chaoui', 'Bilal', '20240019', 'Benyahia', 'Salima'),
('20240020', 'Ait', 'Said', NULL, NULL, NULL);

INSERT INTO Enseignants (nom, prenom, role)
VALUES 
  ('Benali', 'Salah', 'responsable'),
  ('Mebarki', 'Nadia', 'principal'),
  ('Zerari', 'Karim', 'responsable'),
  ('Chikhi', 'Lamia', 'principal'),
  ('Kaci', 'Yacine', 'principal'),
  ('Belkacem', 'Amina', 'responsable');