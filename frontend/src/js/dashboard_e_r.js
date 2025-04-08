document.addEventListener("DOMContentLoaded", function () {
  const consulterTacheButton = document.getElementById("consulterTache");
  const profilButton = document.getElementById("profil");

  // التأكد من وجود العناصر قبل إضافة المستمعات
  if (consulterTacheButton) {
    consulterTacheButton.addEventListener("click", function () {
      console.log("Accès à la page des rapports des tâches");
      // لا حاجة لإعادة التوجيه لأن الرابط موجود
    });
  }

  if (profilButton) {
    profilButton.addEventListener("click", function () {
      console.log("Accès à la page de profil");
      // لا حاجة لإعادة التوجيه لأن الرابط موجود
    });
  }
});
