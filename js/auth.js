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