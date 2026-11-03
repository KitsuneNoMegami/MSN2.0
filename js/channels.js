// ? Récupère les éléments HTML de la sidebar des channels
const channelForm = document.getElementById("channel-form");
const channelNameInput = document.getElementById("channel-name");
const channelsAlert = document.getElementById("channels-alert");
const channelsList = document.getElementById("channels-list");

// ? Affiche un message sous le formulaire (rouge si isError est vrai)
function setChannelsAlert(message, isError = false) {
	channelsAlert.textContent = message;
	// * toggle(classe, booléen) : ajoute la classe si vrai, la retire si faux
	channelsAlert.classList.toggle("channels-alert-error", isError);
}

// * Rempli par loadChannels() ; sert à savoir quels channels l'utilisateur peut supprimer
let currentUserId;

// ? Construit la liste des channels dans le HTML
function renderChannels(channels) {
	// * replaceChildren() vide la liste avant de la reconstruire
	channelsList.replaceChildren();

	if (channels.length === 0) {
		const emptyItem = document.createElement("li");
		emptyItem.textContent = "Aucun channel";
		emptyItem.className = "channels-empty";
		channelsList.appendChild(emptyItem);
		return;
	}

	channels.forEach((channel, index) => {
		const item = document.createElement("li");
		const selectButton = document.createElement("button");
		selectButton.type = "button";
		selectButton.className = "channel-select";
		// * stocke l'id et le nom dans le bouton
		selectButton.dataset.channelId = channel.id;
		selectButton.dataset.channelName = channel.name;
		selectButton.textContent = `# ${channel.name}`;
		selectButton.setAttribute("aria-label", `Ouvrir le channel ${channel.name}`);

		// ! Le premier channel est sélectionné à chaque affichage de la liste
		if (index === 0) {
			selectButton.classList.add("channel-select-active");
			// ? Prévient messages.js qu'un channel est choisi, via un événement personnalisé
			window.dispatchEvent(
				new CustomEvent("channel-selected", {
					detail: { id: channel.id, name: channel.name },
				}),
			);
		}

		item.appendChild(selectButton);

		// * Le bouton supprimer n'apparaît que pour le créateur du channel
		if (channel.created_by === currentUserId) {
			const removeButton = document.createElement("button");
			removeButton.type = "button";
			removeButton.className = "channel-remove";
			removeButton.dataset.channelId = channel.id;
			removeButton.setAttribute("aria-label", `Supprimer le channel ${channel.name}`);
			removeButton.textContent = "×";
			item.appendChild(removeButton);
		}

		channelsList.appendChild(item);
	});
}

// ? Charge les channels depuis Supabase puis les affiche
async function loadChannels() {
	const {
		data: { user },
	} = await client.auth.getUser();

	if (!user) {
		setChannelsAlert("Votre session a expiré.", true);
		return;
	}

	currentUserId = user.id;

	const { data, error } = await client
		.from("channels")
		.select("id, name, created_at, created_by")
		// * Les plus anciens channels d'abord
		.order("created_at", { ascending: true });

	if (error) {
		setChannelsAlert("Impossible de charger les channels.", true);
		throw error;
	}

	renderChannels(data);
	return data;
}

// ? Ajoute un channel quand on envoie le formulaire
channelForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	setChannelsAlert("");

	const name = channelNameInput.value.trim();
	if (!name) return;

	const {
		data: { user },
	} = await client.auth.getUser();

	if (!user) {
		setChannelsAlert("Votre session a expiré.", true);
		return;
	}

	const { error: insertError } = await client.from("channels").insert({
		name,
		created_by: user.id,
	});

	if (insertError) {
		// * 23505 = code PostgreSQL "violation d'unicité"
		if (insertError.code === "23505") {
			setChannelsAlert("Ce channel existe déjà.", true);
			return;
		}
		setChannelsAlert("Impossible d'ajouter ce channel.", true);
		throw insertError;
	}

	channelNameInput.value = "";
	setChannelsAlert("Channel ajouté.");
	await loadChannels();
});

// ? Un seul écouteur sur la liste gère tous les clics
// * Technique "délégation d'événements" : marche aussi pour les boutons créés plus tard
channelsList.addEventListener("click", async (event) => {
	// * closest() remonte depuis l'élément cliqué jusqu'au bouton concerné (ou null)
	const selectButton = event.target.closest(".channel-select");
	const removeButton = event.target.closest(".channel-remove");

	// ? Cas 1 : sélection d'un channel
	if (selectButton) {
		channelsList.querySelectorAll(".channel-select-active").forEach((button) => {
			button.classList.remove("channel-select-active");
		});
		selectButton.classList.add("channel-select-active");
		window.dispatchEvent(
			new CustomEvent("channel-selected", {
				detail: {
					id: selectButton.dataset.channelId,
					name: selectButton.dataset.channelName,
				},
			}),
		);
		return;
	}

	if (!removeButton) return;

	// ? Cas 2 : suppression d'un channel
	const {
		data: { user },
	} = await client.auth.getUser();

	if (!user) {
		setChannelsAlert("Votre session a expiré.", true);
		return;
	}

	const { error } = await client
		.from("channels")
		.delete()
		.eq("id", removeButton.dataset.channelId)
		// * Filtre en plus sur le créateur : sécurité supplémentaire côté client
		.eq("created_by", user.id);

	if (error) {
		setChannelsAlert("Impossible de supprimer ce channel.", true);
		throw error;
	}

	setChannelsAlert("Channel supprimé.");
	await loadChannels();
});

// ? Premier chargement au démarrage de la page
loadChannels().catch((error) => {
	console.error("Erreur lors du chargement des channels :", error);
});
