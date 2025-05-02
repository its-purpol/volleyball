import config from './config.js';

const ws = new WebSocket(`${config.wsHost}`);

let jsonData = {}

fetch(`${config.host}/data.json`)
    .then(response => response.json())
    .then(data => {
        jsonData = data;
    })
    .catch(error => console.error('Error loading JSON:', error));

/*
    Fonctions
*/

function changerScore(equipe, valeur) {
    if (equipe == "vienne") {
        jsonData.vienne.score += valeur;
    } else {
        jsonData.visiteurs.score += valeur;
    }
    sendUpdatedData()
}

function changerSet(equipe, valeur) {
    if (equipe === "vienne") {
        jsonData.vienne.set += valeur;
    } else {
        jsonData.visiteurs.set += valeur;
    }
    sendUpdatedData()
}

function definirScore(equipe, valeur = 0) {
    if (equipe === "vienne") {
        jsonData.vienne.score = valeur;
    } else {
        jsonData.visiteurs.score = valeur;
    }
    sendUpdatedData()
}

function definirSet(equipe, valeur = 0) {
    if (equipe === "vienne") {
        jsonData.vienne.set = valeur;
    } else {
        jsonData.visiteurs.set = valeur;
    }
    sendUpdatedData()
}

function definirAdversaire(equipe) {
    let elAdversaire = document.getElementById("adversaire");
    jsonData.visiteurs.nom = elAdversaire.value.toUpperCase();
    sendUpdatedData()
}

function definirEmbleme() {
    let emblemeEl = document.getElementById('embleme');

    const file = emblemeEl.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target.result;
            if (emblemeEl.value) {
                jsonData.visiteurs.embleme = `${base64String}`;
                sendUpdatedData()
                let advButtons = document.getElementsByClassName("visiteurs")
                for (let i = 0; i < advButtons.length; i++) {
                    advButtons[i].src = `${base64String}`
                }
            }
        }
        reader.readAsDataURL(file);
    }
}

function toggleBalle(type) {
    if (type == 'set') {
        if (jsonData.balle.set == "none") {
            jsonData.balle.set = "flex"
        } else {
            jsonData.balle.set = "none"
        }
        console.log('huh?')
    } else {
        if (jsonData.balle.match == "none") {
            jsonData.balle.match = "flex"
        } else {
            jsonData.balle.match = "none"
        }
    }
    sendUpdatedData()
}

function sendUpdatedData() {
    ws.send(`update-json|${JSON.stringify(jsonData)}`);
}

window.ws = ws;
window.changerScore = changerScore;
window.changerSet = changerSet;
window.definirScore = definirScore;
window.definirSet = definirSet;
window.definirAdversaire = definirAdversaire;
window.definirEmbleme = definirEmbleme;
window.toggleBalle = toggleBalle;