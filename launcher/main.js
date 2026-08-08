const { app, Tray, Menu, shell, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let tray = null;
let serverProcess = null;
let serverRunning = false;

const BACKEND_PATH = path.join(__dirname, "..", "backend");
const SERVER_URL = "http://localhost:8000";

function startServer() {
  if (serverRunning) return;

  serverProcess = spawn("npm", ["run", "dev"], {
    cwd: BACKEND_PATH,
    shell: true,
  });

  serverProcess.stdout.on("data", (data) => console.log(`[Loklang] ${data}`));
  serverProcess.stderr.on("data", (data) => console.error(`[Loklang] ${data}`));

  serverProcess.on("exit", () => {
    serverRunning = false;
    updateTrayMenu();
  });

  serverRunning = true;
  updateTrayMenu();
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  serverRunning = false;
  updateTrayMenu();
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: serverRunning ? "● Running" : "○ Stopped",
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Start Server",
      enabled: !serverRunning,
      click: startServer,
    },
    {
      label: "Stop Server",
      enabled: serverRunning,
      click: stopServer,
    },
    { type: "separator" },
    {
      label: "Open in Browser",
      enabled: serverRunning,
      click: () => shell.openExternal(SERVER_URL),
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        stopServer();
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip(serverRunning ? "Loklang — Running" : "Loklang — Stopped");
}

app.whenReady().then(() => {
  tray = new Tray(path.join(__dirname, "icon.png"));
  updateTrayMenu();

  dialog.showMessageBox({
    type: "info",
    title: "Loklang",
    message: "Loklang launcher is ready. Click the tray icon to start the server.",
  });
});

app.on("window-all-closed", (e) => e.preventDefault());