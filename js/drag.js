// ? Rend l'élément #sticker déplaçable à la souris, au doigt ou au stylet (Pointer Events)
const sticker = document.getElementById("sticker");
// * Évite une erreur si la page n'a pas de #sticker
if (sticker) dragElement(sticker);

function dragElement(elmnt) {
  // * Position du pointeur et de l'élément au moment où le glissement commence
  let startX = 0, startY = 0, startTop = 0, startLeft = 0;

  // ! Défile la page au lieu de déplacer l'élément en mode tactile
  elmnt.style.touchAction = "none";
  // * Désactive le glisser-déposer natif de l'image, qui entrerait en conflit avec le nôtre
  elmnt.addEventListener("dragstart", (e) => e.preventDefault());

  // ? Début du glissement : mémorise les positions de départ et suit le pointeur
  elmnt.addEventListener("pointerdown", (e) => {
    // * Pour la souris : clic gauche uniquement (un doigt ou un stylet donnent aussi button = 0)
    if (e.button !== 0) return;
    e.preventDefault();

    startX = e.clientX;
    startY = e.clientY;
    // * La position actuelle est lue en pixels, quelle que soit la façon dont le CSS la définit (%, auto...)
    const style = getComputedStyle(elmnt);
    startTop = parseFloat(style.top) || 0;
    startLeft = parseFloat(style.left) || 0;

    // * setPointerCapture : l'élément continue de recevoir les mouvements même si le doigt sort de son cadre
    elmnt.setPointerCapture(e.pointerId);
    elmnt.addEventListener("pointermove", onMove);
    elmnt.addEventListener("pointerup", onEnd);
    // * pointercancel : le système interrompt le geste (appel entrant, etc.)
    elmnt.addEventListener("pointercancel", onEnd);
  });

  // ? Pendant le glissement : position de départ + distance parcourue par le pointeur
  function onMove(e) {
    elmnt.style.top = startTop + (e.clientY - startY) + "px";
    elmnt.style.left = startLeft + (e.clientX - startX) + "px";
  }

  // ? Fin du glissement : on arrête d'écouter les mouvements
  function onEnd() {
    elmnt.removeEventListener("pointermove", onMove);
    elmnt.removeEventListener("pointerup", onEnd);
    elmnt.removeEventListener("pointercancel", onEnd);
  }
}