const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const os = require('os');

const og_data = path.join(__dirname, '../data/data-original.json')
const new_data = path.join(__dirname, '../data/data.json')

fs.copyFile(og_data, new_data, (err) => {
    if (err) {
        console.error('Error while duplicating the file.', err);
    } else {
        console.log('data.json successfully created.')
    }
})

// Function to detect the server's local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    console.log(interfaces)
    let ipAddress = 'localhost'
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ipAddress = iface.address; // Return the last IPv4 non-internal address
            }
        }
    }
    return ipAddress; // Fallback to localhost
}

// Write the IP address to config.js
const localIP = getLocalIP();
const configPath = path.join(__dirname, 'config.js');
fs.writeFileSync(configPath, `const config = { host: 'http://${localIP}:8080', wsHost: 'ws://${localIP}:8081' }; export default config;`);

console.log(`Local IP detected: ${localIP}`);
console.log(`Configuration file updated at ${configPath}`);

// Initialize Express server
const app = express();

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
app.get('../data/data.json', (req, res) => {
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
app.post('../data/data.json', (req, res) => {
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
const server = app.listen(8081, () => {
    console.log(`Serveur Express et WebSocket démarré sur http://${localIP}:8081`);
});

// Initialize WebSocket server
const wss = new WebSocket.Server({ server }); // Attach WebSocket to Express server

wss.on('connection', (ws) => {
    console.log('Client connecté');

    ws.on('message', (message) => {
        console.log(`Message reçu`);
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