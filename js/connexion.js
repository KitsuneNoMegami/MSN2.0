document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    let email = document.getElementById("email").value;
    let password = document.getElementById("mdp").value;
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      /* affiche une message dans alert_box  */
      document.getElementById("alert_box").textContent =
        "Email ou mot de passe incorrect.";
    } else window.location.replace("../index.html");
  });