const {
  data: { session },
} = await client.auth.getSession();
//if (!session) window.location.replace("./pages/connexion.html");

document
  .getElementById("logout-button")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    await client.auth.signOut();
    window.location.replace("./pages/connexion.html");
  });

  async function getUser() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data.session) {
      return { user: null, error: error ?? new Error("Aucune session") };
    }
    return { user: data.session.user, error: null };
  }