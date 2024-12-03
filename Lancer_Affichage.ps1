# Définir les chemins d’accès à NodeJS et au projet
$nodePath = "C:\Program Files\nodejs\node.exe" # Path to Node.js executable
$projectPath = "C:\Users\<YourUsername>\Desktop\volleyball" # Path to your project folder

# Se place dans le répertoire du projet
Set-Location -Path $projectPath

# Lance server.js (WebSocket server) dans une nouvelle fenêtre Powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$nodePath server.js" -WorkingDirectory $projectPath

# Lance http-server dans une nouvelle fenêtre Powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "http-server" -WorkingDirectory $projectPath