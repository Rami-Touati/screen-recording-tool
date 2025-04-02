import { app, BrowserWindow, ipcMain, session } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // Set up Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: blob: file:;",
          "media-src 'self' data: blob: file:;",
        ].join(' ')
      }
    });
  });

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    },
  });

  // In development, use the host and port specified by create-react-app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html file
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // Handle security warnings
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return { action: 'deny' };
  });

  // Handle permission requests
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'display-capture', 'mediaKeySystem'];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Only create window after app is ready
app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('start-recording', async (event, options) => {
  // Implementation will be added later
  console.log('Start recording with options:', options);
});

ipcMain.handle('stop-recording', async () => {
  // Implementation will be added later
  console.log('Stop recording');
});

ipcMain.handle('export-to-mp4', async (event, filePath) => {
  // Implementation will be added later
  console.log('Export to MP4:', filePath);
});

ipcMain.handle('export-to-gif', async (event, filePath) => {
  // Implementation will be added later
  console.log('Export to GIF:', filePath);
}); 