//? Recuperation des informations necessaires
//* Element html
const form = document.getElementById("chat-form");
const input = document.getElementById("text-box");
const messages = document.getElementById("messages");
const chatTitle = document.querySelector(".main-title");

//* Informations annexes pour l'envoie de messages
let channel_id = "";
let currentUserId;


window.addEventListener("channel-selected", (event) => {
	const channel = event.detail;
	channel_id = channel.id;
	chatTitle.textContent = `# ${channel.name}`;
	messages.replaceChildren();
});

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const {
		data: { user },
	} = await client.auth.getUser();

	if (!user) {
		setChannelsAlert("Votre session a expiré.", true);
		return;
	}

	//? ignore les messages vides
	const text = input.value.trim();
	if (text === "") return;

	const { error: insertError } = await client.from("messages").insert({
		channel_id: channel_id,
		user_id: user.id,
		username: user.email,
		content: text,
		created_at: new Date().toISOString(),
	});

	input.value = "";
	input.focus();
	// descend tout en bas
	messages.scrollTop = messages.scrollHeight;
});

async function loadMessages() {
    const {
        data: { user },
    } = await client.auth.getUser();

    if (!user) {
        setChannelsAlert("Votre session a expiré.", true);
        return;
    }

    currentUserId = user.id;

    const { data, error } = await client
        .from("messages")
        .select("id, content, created_at, user_id, username")
		.eq("channel_id", channel_id)
        .order("created_at", { ascending: true });

    if (error) {
        setChannelsAlert("Impossible de charger les messages.", true);
        throw error;
    }

    renderMessages(data);
    return data;
}

function renderMessages(list) {
	messages.replaceChildren();

	if (list.length === 0) {
		const emptyItem = document.createElement("li");
		emptyItem.textContent = "Aucun message";
		emptyItem.className = "messages-empty";
		messages.appendChild(emptyItem);
		return;
	}

	list.forEach((message) => {
		const item = document.createElement("li");
		const sender = document.createElement("strong");
		const content = document.createElement("span");

		item.className = `message ${
			message.user_id === currentUserId ? "right" : "left"
		}`;
		sender.textContent = `${message.username}: `;
		content.textContent = message.content;
		item.append(sender, content);
		messages.appendChild(item);
	});

	messages.scrollTop = messages.scrollHeight;
}

window.addEventListener("channel-selected", async (event) => {
	const channel = event.detail;
	channel_id = channel.id;
	chatTitle.textContent = `# ${channel.name}`;
	messages.replaceChildren();
	await loadMessages();
});
