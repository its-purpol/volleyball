# Lance server.js (WebSocket server) dans une nouvelle fenêtre Powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js" -WorkingDirectory

# Lance http-server dans une nouvelle fenêtre Powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "http-server" -WorkingDirectory