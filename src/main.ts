import path from 'path';
import { app, BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const devURL = 'http://localhost:5173'; // ✅ change to 3000 if using CRA
  const prodURL = path.join(__dirname, '../build/index.html');

  if (isDev) {
    console.log('🔧 Dev mode - loading from:', devURL);
    mainWindow.loadURL(devURL).catch((err) => {
      console.error('Failed to load dev server:', err);
    });
    mainWindow.webContents.openDevTools();
  } else {
    console.log('🚀 Prod mode - loading file:', prodURL);
    mainWindow.loadFile(prodURL);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
