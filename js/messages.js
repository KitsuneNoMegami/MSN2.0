//? Recuperation des informations necessaires
//* Element html
const form = document.getElementById("chat-form");
const input = document.getElementById("text-box");
const messages = document.getElementById("messages");
const chatTitle = document.querySelector(".main-title");

//* Informations annexes pour l'envoie de messages
// * channel_id = channel actuellement ouvert ("" tant qu'aucun n'est choisi)
let channel_id = "";
let currentUserId;

// ? Envoi d'un message vers Supabase
form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const {
		data: { user },
	} = await client.auth.getUser();

	//? ignore les messages vides
	const text = input.value.trim();
	if (text === "") return;

	// ! channel_id vaut "" si aucun channel n'est choisi : l'insertion échouera
	const { error: insertError } = await client.from("messages").insert({
		channel_id: channel_id,
		user_id: user.id,
		username: user.email,
		content: text,
		// * Mieux : laisser la base remplir created_at avec now() (l'heure du navigateur est falsifiable)
		created_at: new Date().toISOString(),
	});

	input.value = "";
	await loadMessages(); //* Chargement des messages
	input.focus();
	// descend tout en bas
	messages.scrollTop = messages.scrollHeight;
});

// ? Charge les messages du channel ouvert depuis Supabase
async function loadMessages() {
	const {
		data: { user },
	} = await client.auth.getUser();

	if (!user) {
		return;
	}

	// * Sert à savoir quels messages sont les nôtres
	currentUserId = user.id;

	const { data, error } = await client
		.from("messages")
		.select("id, content, created_at, user_id, username")
		.eq("channel_id", channel_id)
		// * Du plus ancien au plus récent
		.order("created_at", { ascending: true });

	if (error) {
		setChannelsAlert("Impossible de charger les messages.", true);
		throw error;
	}

	renderMessages(data);
	return data;
}

// ? Affiche la liste des messages dans le HTML
function renderMessages(list) {
	messages.replaceChildren();

	if (list.length === 0) {
		const emptyItem = document.createElement("p");
		emptyItem.textContent = "Aucun message";
		emptyItem.className = "messages-empty";
		messages.appendChild(emptyItem);
		return;
	}

	list.forEach((message) => {
		const item = document.createElement("p");
		const sender = document.createElement("strong");
		const content = document.createElement("span");

		// * Classe "right" pour nos messages, "left" pour ceux des autres (à styliser en CSS)
		item.className = `message ${message.user_id === currentUserId ? "right" : "left"}`;
		// ! textContent (pas innerHTML) : empêche l'injection de HTML/JS (XSS) via un message
		sender.textContent = `${message.username}: `;
		content.textContent = message.content;
		item.append(sender, content);
		messages.appendChild(item);
	});

	// * Descend en bas pour voir le dernier message
	messages.scrollTop = messages.scrollHeight;
}

// ? met à jour le channel, le titre, vide la liste puis charge ses messages
window.addEventListener("channel-selected", async (event) => {
	const channel = event.detail;
	channel_id = channel.id;
	chatTitle.textContent = `# ${channel.name}`;
	messages.replaceChildren();
	await loadMessages();
});
