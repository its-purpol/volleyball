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
    Functions
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

function changerService() {
    let VienneSert = jsonData.service
    if (VienneSert) {
        jsonData.service = false;
    } else {
        jsonData.service = true;
    }
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
            }
        }
        reader.readAsDataURL(file);
    }
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
window.changerService = changerService;
window.definirEmbleme = definirEmbleme;