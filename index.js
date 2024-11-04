console.log('Hello World!');

let VienneSert = true

function changerScore(equipe, valeur = 1) {
    let scoreId = "score-" + equipe + "-num";
    let scoreEl = document.getElementById(scoreId);
    scoreEl.textContent = (valeur + Number(scoreEl.textContent)).toString();
}

function definirAdversaire(equipe) {
    let nomEl = document.getElementById("team-r-name");
    nomEl.textContent = equipe.toUpperCase();
}

function changerService() {
    let serviceEl = document.getElementById('service');
    if (VienneSert) {
        serviceEl.style.left = "718px";
    }
    else {
        serviceEl.style.left = "312px";
    }
    VienneSert = !VienneSert;
}