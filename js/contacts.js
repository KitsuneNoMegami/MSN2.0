const contactForm = document.getElementById("contact-form");
const contactEmailInput = document.getElementById("contact-email");
const contactsAlert = document.getElementById("contacts-alert");
const contactsList = document.getElementById("contacts-list");

function setContactsAlert(message, isError = false) {
    contactsAlert.textContent = message;
    contactsAlert.classList.toggle("contacts-alert-error", isError);
}

let currentUserId;

function renderContacts(contacts) {
    contactsList.replaceChildren();

    if (contacts.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "Aucun contact";
        emptyItem.className = "contacts-empty";
        contactsList.appendChild(emptyItem);
        return;
    }

    contacts.forEach((contact) => {
        const item = document.createElement("li");
        const email = document.createElement("span");
        const removeButton = document.createElement("button");

        const isOwner = contact.owner_id === currentUserId;
        email.textContent = isOwner
            ? contact.contact_email
            : contact.owner_email;
        removeButton.type = "button";
        removeButton.className = "contact-remove";
        removeButton.dataset.ownerId = contact.owner_id;
        removeButton.dataset.contactId = contact.contact_id;
        removeButton.setAttribute("aria-label", `Retirer ${email.textContent}`);
        removeButton.textContent = "×";

        item.append(email, removeButton);
        contactsList.appendChild(item);
    });
}

async function loadContacts() {
    const {
        data: { user },
    } = await client.auth.getUser();

    if (!user) {
        setContactsAlert("Votre session a expiré.", true);
        return;
    }

    currentUserId = user.id;

    const { data, error } = await client
        .from("contacts")
        .select("owner_id, owner_email, contact_id, contact_email")
        .or(`owner_id.eq.${user.id},contact_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

    if (error) {
        setContactsAlert("Impossible de charger les contacts.", true);
        throw error;
    }

    renderContacts(data);
}

contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setContactsAlert("");

    const email = contactEmailInput.value.trim().toLowerCase();
    if (!email) return;

    const {
        data: { user },
    } = await client.auth.getUser();

    if (!user) {
        setContactsAlert("Votre session a expiré.", true);
        return;
    }

    if (user.email && email === user.email.toLowerCase()) {
        setContactsAlert("Vous ne pouvez pas vous ajouter vous-même.", true);
        return;
    }

    const { error: insertError } = await client
        .from("contacts")
        .insert({
            owner_id: user.id,
            owner_email: user.email.toLowerCase(),
            contact_email: email,
        });

    if (insertError) {
        if (insertError.code === "23505") {
            setContactsAlert("Ce contact est déjà dans votre liste.", true);
            return;
        }
        if (insertError.code === "P0001") {
            setContactsAlert("Aucun utilisateur ne possède cette adresse.", true);
            return;
        }
        setContactsAlert("Impossible d'ajouter ce contact.", true);
        throw insertError;
    }

    contactEmailInput.value = "";
    setContactsAlert("Contact ajouté.");
    await loadContacts();
});

contactsList.addEventListener("click", async (event) => {
    const removeButton = event.target.closest(".contact-remove");
    if (!removeButton) return;

    const {
        data: { user },
    } = await client.auth.getUser();

    if (!user) {
        setContactsAlert("Votre session a expiré.", true);
        return;
    }

    const { error } = await client
        .from("contacts")
        .delete()
        .eq("owner_id", removeButton.dataset.ownerId)
        .eq("contact_id", removeButton.dataset.contactId);

    if (error) {
        setContactsAlert("Impossible de retirer ce contact.", true);
        throw error;
    }

    setContactsAlert("Contact retiré.");
    await loadContacts();
});

loadContacts().catch((error) => {
    console.error("Erreur lors du chargement des contacts :", error);
});
