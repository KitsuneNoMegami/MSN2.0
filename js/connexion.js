// ? Gère l'envoi du formulaire de connexion
document.getElementById("login-form").addEventListener("submit", async (event) => {
	// * Empêche le rechargement de la page par le formulaire
	event.preventDefault();
	let email = document.getElementById("email").value;
	let password = document.getElementById("mdp").value;
	// ? Demande à Supabase de vérifier email + mot de passe
	const { error } = await client.auth.signInWithPassword({ email, password });
	if (error) {
		/* affiche une message dans alert_box  */
		// ! Message volontairement générique : ne dit pas si c'est l'email ou le mot de passe qui est faux
		document.getElementById("alert_box").textContent = "Email ou mot de passe incorrect.";
	} else window.location.replace("../index.html");
});
