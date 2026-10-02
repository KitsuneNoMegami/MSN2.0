const isAnyUpper = string => /\p{Lu}/u.test(string)
const hasNumbers = string => /\d/.test(string)
const isAnyLower = string => /\p{Ll}/u.test(string)
var format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

document.getElementById("mdp")
.addEventListener("input", () => {
    let mdp=document.getElementById("mdp").value;
    console.log(mdp);

    if (!isAnyUpper(mdp)){
        document.getElementById("alert_box")
        .textContent = "Au minimum 1 majuscule";
    }
    else if(!hasNumbers(mdp)){
        document.getElementById("alert_box")
        .textContent = "Au minimum 1 chiffre";
    }
    else if(!isAnyLower(mdp)){
        document.getElementById("alert_box")
        .textContent = "Au minimum 1 minuscule";
    }
    else if(!format.test(mdp)){
        document.getElementById("alert_box")
        .textContent = "Au minimum 1 charactère spécial";
    }
    else {
        document.getElementById("alert_box")
        .textContent = "";
    }
});
document.getElementById("confirmmdp")
.addEventListener("input", () => {
    if (document.getElementById("confirmmdp").value != document.getElementById("mdp").value){
        document.getElementById("alert_box")
        .textContent = "Les mots de passe ne correspondent pas";
    }
    else {
        document.getElementById("alert_box")
        .textContent = "";
    }
});