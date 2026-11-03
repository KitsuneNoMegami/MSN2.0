// ? Protège la page : tant qu'on n'est pas connecté, le contenu reste caché puis on redirige vers la connexion
// * Le top-level await fonctionne ici car le fichier est chargé avec type="module"
const {
  data: { session },
} = await client.auth.getSession();

if (!session) {
  // * replace() : la page protégée n'est pas gardée dans l'historique du bouton "retour"
  window.location.replace("./pages/connexion.html");
} else {
  // ? Connecté : on révèle la page (cachée par le <style> dans le <head> de index.html)
  document.body.style.visibility = "visible";
}

// ? Bouton de déconnexion : ferme la session Supabase puis retourne à la connexion
document
  .getElementById("logout-button")
  .addEventListener("click", async (event) => {
    // * Bloque la navigation du lien pour fermer la session AVANT de changer de page
    event.preventDefault();
    await client.auth.signOut();
    window.location.replace("./pages/connexion.html");
  });