const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Initialize Express server
const app = express();
const PORT = 8081; // Unified port for both WebSocket and Express

app.use(express.static(path.join(__dirname), {
    etag: false, // Disable ETag headers
    lastModified: false, // Disable Last-Modified headers
    cacheControl: false // Disable Cache-Control headers
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files (optional, for HTML/JS/CSS)
app.use(express.static(path.join(__dirname)));

// GET endpoint to serve JSON data
app.get('/data.json', (req, res) => {
    const jsonPath = path.join(__dirname, 'data.json');
    fs.readFile(jsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON:', err);
            res.status(500).send('Erreur lors de la lecture du fichier JSON');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// POST endpoint to update JSON data
app.post('/data.json', (req, res) => {
    const newData = req.body; // JSON body sent by the client
    const jsonPath = path.join(__dirname, 'data.json');

    fs.writeFile(jsonPath, JSON.stringify(newData, null, 2), (err) => {
        if (err) {
            console.error('Erreur lors de la mise à jour du fichier JSON:', err);
            res.status(500).send('Erreur lors de la mise à jour du fichier JSON');
        } else {
            console.log('Fichier JSON mis à jour avec succès');
            res.send('Fichier JSON mis à jour avec succès');
        }
    });
});

// Start Express server and integrate WebSocket server
const server = app.listen(PORT, () => {
    console.log(`Serveur Express et WebSocket démarré sur http://localhost:${PORT}`);
});

// Initialize WebSocket server
const wss = new WebSocket.Server({ server }); // Attach WebSocket to Express server

wss.on('connection', (ws) => {
    console.log('Client connecté');

    ws.on('message', (message) => {
        console.log(`Message reçu : ${message}`);
        let value = `${message}`;
        if (value.startsWith('update-json|')) {
            const payload = value.replace('update-json|', '');
            try {
                const newData = JSON.parse(payload);
                const jsonPath = path.join(__dirname, 'data.json');

                fs.writeFile(jsonPath, JSON.stringify(newData, null, 2), (err) => {
                    if (err) {
                        console.error('Erreur lors de la mise à jour du fichier JSON:', err);
                        ws.send('error|Failed to update JSON');
                    } else {
                        console.log('Fichier JSON mis à jour avec succès');
                        // Notify all clients to reload data
                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send('reload-data');
                            }
                        });
                    }
                });
            } catch (error) {
                console.error('Erreur de parsing JSON:', error);
                ws.send('error|Invalid JSON format');
            }
        }

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client déconnecté');
    });
});