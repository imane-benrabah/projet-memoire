const db = require("../config/db");
const nodemailer = require("nodemailer");

exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    // Vérifier si l'email existe dans la base de données
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });
        if (results.length === 0) return res.status(404).json({ message: "Email non trouvé" });

        // Générer un token de réinitialisation (simple exemple)
        const resetToken = Math.random().toString(36).substr(2);

        // Envoyer l'e-mail
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "tonemail@gmail.com",
                pass: "tonmotdepasse"
            }
        });

        const mailOptions = {
            from: "",
            to: email,
            subject: "Réinitialisation de votre mot de passe",
            text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : http://localhost:5000/reset-password/${resetToken}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.status(500).json({ message: "Erreur d'envoi d'e-mail" });
            res.json({ message: "E-mail de réinitialisation envoyé !" });
        });
    });
};
