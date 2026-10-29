//? Recuperation des informations necessaires
//* Element html
const form = document.getElementById("chat-form");
const input = document.getElementById("text-box");
const messages = document.getElementById("messages");
const chatTitle = document.querySelector(".main-title");

//* Informations annexes pour l'envoie de messages
let channel_id = "";

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
