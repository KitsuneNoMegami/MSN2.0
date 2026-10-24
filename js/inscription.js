const MIN_LENGTH = 8;
const SPECIAL = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

//? Renvoie un message d'erreur, ou "" si le mot de passe est valide
function getPasswordError(mdp) {
  if (mdp.length < MIN_LENGTH)
    return `Il faut au minimum ${MIN_LENGTH} caractères`;
  if (!/\p{Lu}/u.test(mdp)) return "Il faut au minimum 1 majuscule";
  if (!/\p{Ll}/u.test(mdp)) return "Il faut au minimum 1 minuscule";
  if (!/\d/.test(mdp)) return "Il faut au minimum 1 chiffre";
  if (!SPECIAL.test(mdp)) return "Il faut au minimum 1 caractère spécial";
  return "";
}

//? Règles du mot de passe + correspondance avec la confirmation
function getFormError(mdp, confirmation) {
  const erreur = getPasswordError(mdp);
  if (erreur) return erreur;
  if (mdp !== confirmation) return "Les mots de passe ne correspondent pas";
  return "";
}

//? Confirmation en direct visuel uniquement
function updateAlert() {
  const mdp = document.getElementById("mdp").value;
  const confirmation = document.getElementById("confirmmdp").value;
  const alertBox = document.getElementById("alert_box");

  // On n'affiche l'écart de confirmation que si ce champ a été commencé
  alertBox.textContent =
    confirmation === ""
      ? getPasswordError(mdp)
      : getFormError(mdp, confirmation);
}

document.getElementById("mdp").addEventListener("input", updateAlert);
document.getElementById("confirmmdp").addEventListener("input", updateAlert);

document
  .getElementById("signup-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    document.getElementById("button-inscription").disabled = false;
    const alertBox = document.getElementById("alert_box");
    const email = document.getElementById("email").value.trim();
    const mdp = document.getElementById("mdp").value;
    const confirmation = document.getElementById("confirmmdp").value;

    // Validation refaite à partir des champs, pas depuis #alert_box
    const erreur = getFormError(mdp, confirmation);
    if (erreur) {
      alertBox.textContent = erreur;
      return;
    }

    const { error } = await client.auth.signUp({ email, password: mdp });

    if (error) {
      alertBox.textContent = error.message;
      return;
    }
    alertBox.textContent = "";
    document.getElementById(created_message).textContent =
      "Compte créé. Vérifie ta boîte mail si la confirmation est activée.";
    document.getElementById("button-inscription").disabled = true;
  });
