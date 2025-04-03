document.getElementById("forgotPassForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Empêche le rechargement de la page

    const email = document.getElementById("email").value;

    const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    const data = await response.json();
    document.getElementById("message").textContent = data.message;
});
