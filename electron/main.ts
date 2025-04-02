import { app, BrowserWindow, session, ipcMain, protocol } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import * as fs from 'fs';

const DEV_SERVER_URL = 'http://localhost:5173';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
let squirrelStartup = false;
try {
  squirrelStartup = require('electron-squirrel-startup');
} catch (e) {
  console.log('electron-squirrel-startup not loaded:', e);
}

if (squirrelStartup) {
  app.quit();
}

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  try {
    console.log('Creating main window...');
    console.log('Current directory:', __dirname);
    
    // Create the browser window
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        preload: path.join(__dirname, 'preload.js')
      },
      show: false // Don't show the window until it's ready
    });

    // Prevent file drag and drop
    mainWindow.webContents.on('will-navigate', (e) => {
      e.preventDefault();
    });

    // Prevent drag and drop events from the window
    mainWindow.webContents.on('did-create-window', (childWindow) => {
      childWindow.webContents.on('will-navigate', (e) => {
        e.preventDefault();
      });
    });

    // Set up security headers
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${DEV_SERVER_URL}`,
            `style-src 'self' 'unsafe-inline' ${DEV_SERVER_URL}`,
            `img-src 'self' data: blob: ${DEV_SERVER_URL}`,
            "media-src 'self' data: blob:",
            `connect-src 'self' ws://localhost:5173 ${DEV_SERVER_URL}`,
            "font-src 'self' data:"
          ].join('; ')
        }
      });
    });

    // Handle loading the app
    if (isDev) {
      console.log('🔧 Development mode - loading from dev server...');
      mainWindow.loadURL(DEV_SERVER_URL).catch(err => {
        console.error('Failed to load dev server:', err);
        console.log('Falling back to production build...');
        loadProductionBuild();
      });
      mainWindow.webContents.openDevTools();
    } else {
      console.log('📦 Production mode - loading built files...');
      loadProductionBuild();
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
      console.log('Window ready to show');
      if (mainWindow) {
        mainWindow.show();
      }
    });

    // Log navigation events
    mainWindow.webContents.on('did-start-loading', () => {
      console.log('Page started loading');
    });

    mainWindow.webContents.on('did-finish-load', () => {
      console.log('Page finished loading');
      // Log the current URL after load
      mainWindow?.webContents.executeJavaScript('window.location.href').then(url => {
        console.log('Current URL after load:', url);
      });
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Page failed to load:', errorCode, errorDescription);
    });

    // Log console messages from renderer
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log('Renderer console:', message);
    });

    // Handle window open requests
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      return { action: 'deny' };
    });

    // Handle permission requests
    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowedPermissions = ['media'];
      if (allowedPermissions.includes(permission)) {
        callback(true);
      } else {
        callback(false);
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    return mainWindow;
  } catch (error) {
    console.error('Error creating window:', error);
    app.quit();
    return null;
  }
}

function loadProductionBuild() {
  if (!mainWindow) return;

  try {
    const indexPath = path.join(__dirname, '../build/index.html');
    console.log('Attempting to load production build from:', indexPath);
    
    // Verify the build exists
    if (!fs.existsSync(indexPath)) {
      console.error('Production build not found:', indexPath);
      console.error('Please run npm run build first');
      app.quit();
      return;
    }

    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
      console.log('Current directory:', __dirname);
      console.log('Attempted path:', indexPath);
      app.quit();
    });
  } catch (error) {
    console.error('Error loading production build:', error);
    app.quit();
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('🚀 Electron app is ready');
  const window = createWindow();
  if (!window) {
    console.error('Failed to create window');
    app.quit();
  }
}).catch(error => {
  console.error('Error during app initialization:', error);
  app.quit();
});

// Handle deep linking on Windows
app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    // Handle the deep link URL
    const url = commandLine.pop();
    if (url) handleDeepLink(url);
  }
});

// Handle deep linking on macOS
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

function handleDeepLink(url: string) {
  if (!mainWindow) return;

  const route = url.replace('screenrecorder://', '');
  if (isDev) {
    mainWindow.loadURL(`http://localhost:5173/${route}`);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'), {
      hash: route
    });
  }
}

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle IPC messages
ipcMain.on('start-recording', (event, options) => {
  // Handle recording start
});

ipcMain.on('stop-recording', (event) => {
  // Handle recording stop
});

ipcMain.handle('export-to-mp4', async (event, filePath) => {
  console.log('Export to MP4:', filePath);
});

ipcMain.handle('export-to-gif', async (event, filePath) => {
  console.log('Export to GIF:', filePath);
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 