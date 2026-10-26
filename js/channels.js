const channelForm = document.getElementById("channel-form");
const channelNameInput = document.getElementById("channel-name");
const channelsAlert = document.getElementById("channels-alert");
const channelsList = document.getElementById("channels-list");

function setChannelsAlert(message, isError = false) {
    channelsAlert.textContent = message;
    channelsAlert.classList.toggle("channels-alert-error", isError);
}

let currentUserId;

function renderChannels(channels) {
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
        selectButton.dataset.channelId = channel.id;
        selectButton.dataset.channelName = channel.name;
        selectButton.textContent = `# ${channel.name}`;
        selectButton.setAttribute("aria-label", `Ouvrir le channel ${channel.name}`);

        if (index === 0) {
            selectButton.classList.add("channel-select-active");
            window.dispatchEvent(new CustomEvent("channel-selected", {
                detail: { id: channel.id, name: channel.name },
            }));
        }

        item.appendChild(selectButton);

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
        .order("created_at", { ascending: true });

    if (error) {
        setChannelsAlert("Impossible de charger les channels.", true);
        throw error;
    }

    renderChannels(data);
    return data;
}

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

    const { error: insertError } = await client
        .from("channels")
        .insert({
            name,
            created_by: user.id,
        });

    if (insertError) {
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

channelsList.addEventListener("click", async (event) => {
    const selectButton = event.target.closest(".channel-select");
    const removeButton = event.target.closest(".channel-remove");

    if (selectButton) {
        channelsList.querySelectorAll(".channel-select-active").forEach((button) => {
            button.classList.remove("channel-select-active");
        });
        selectButton.classList.add("channel-select-active");
        window.dispatchEvent(new CustomEvent("channel-selected", {
            detail: {
                id: selectButton.dataset.channelId,
                name: selectButton.dataset.channelName,
            },
        }));
        return;
    }

    if (!removeButton) return;

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
        .eq("created_by", user.id);

    if (error) {
        setChannelsAlert("Impossible de supprimer ce channel.", true);
        throw error;
    }

    setChannelsAlert("Channel supprimé.");
    await loadChannels();
});

loadChannels().catch((error) => {
    console.error("Erreur lors du chargement des channels :", error);
});
