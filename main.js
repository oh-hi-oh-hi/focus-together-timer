const { app, BrowserWindow } = require('electron');
const path = require('path');

// Start the Node.js server
require('./server/index.js');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 200,
        minHeight: 200,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        backgroundColor: '#000000',
        titleBarStyle: 'hiddenInset',
        // Optional: you can hide the frame completely 
        // frame: false,
    });

    // Wait for the local server to be ready before loading the URL
    // We give it a small timeout to ensure express starts.
    setTimeout(() => {
        mainWindow.loadURL('http://localhost:3001');
    }, 500);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
