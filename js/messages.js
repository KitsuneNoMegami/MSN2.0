const form = document.getElementById("chat-form");
const input = document.getElementById("text-box");
const messages = document.getElementById("messages");
const chatTitle = document.querySelector(".main-title");

window.addEventListener("channel-selected", (event) => {
    const channel = event.detail;
    chatTitle.textContent = `# ${channel.name}`;
    messages.replaceChildren();
});

form.addEventListener("submit", (event) => {
    event.preventDefault();               // empêche le rechargement de la page

    const text = input.value.trim();
    if (text === "") return;              // ignore les messages vides

    const message = document.createElement("div");
    message.className = "message";
    message.textContent = text;           // textContent, pas innerHTML (voir audit)
    messages.appendChild(message);

    input.value = "";
    input.focus();
    messages.scrollTop = messages.scrollHeight;  // descend tout en bas
});