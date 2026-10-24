const {
  data: { session },
} = await client.auth.getSession();
if (!session) window.location.replace("./pages/connexion.html");

document
  .getElementById("logout-button")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    await client.auth.signOut();
    window.location.replace("./pages/connexion.html");
  });

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