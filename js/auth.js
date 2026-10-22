const { data: { session } } = await client.auth.getSession();
if (!session) window.location.replace("./pages/connexion.html");