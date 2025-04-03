import { app, BrowserWindow, session, ipcMain, protocol, desktopCapturer } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import * as fs from 'fs';

// Define the development server URL with port 3001
const DEV_SERVER_URL = 'http://localhost:3001';

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

// Add this interface to match the preload.ts
interface RecordingOptions {
  videoSource?: string;
  audioSource?: string;
  cameraEnabled?: boolean;
  resolution?: { width: number; height: number };
  fps?: number;
  mode?: 'fullscreen' | 'custom' | 'window';
  includeAudio?: boolean;
}

function createWindow(): BrowserWindow {
  console.log('Creating main window...');

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    }
  });

  // Handle media access requests
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'display-capture', 'screen-capture'];
    if (allowedPermissions.includes(permission)) {
      console.log(`[Permission Request Handler] Allowing permission: ${permission}`);
      callback(true);
    } else {
      console.log(`[Permission Request Handler] Denying permission: ${permission}`);
      callback(false);
    }
  });

  // Enable screen capture
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    console.log('[Display Media Request Handler] Granting screen capture permission');
    callback({ video: undefined, audio: undefined });
  });

  // Register protocol handler
  if (!protocol.isProtocolRegistered('screen-capture')) {
    protocol.registerFileProtocol('screen-capture', (request, callback) => {
      const url = request.url.replace('screen-capture://', '');
      try {
        return callback(decodeURIComponent(url));
      } catch (error) {
        console.error(error);
      }
    });
  }

  // Handle IPC messages for screen capture
  ipcMain.handle('get-sources', async () => {
    try {
      return await desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: { width: 0, height: 0 }
      });
    } catch (error) {
      console.error('Error getting sources:', error);
      return [];
    }
  });

  // Load the url using the correct format and port
  const startUrl = isDev 
    ? DEV_SERVER_URL
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);

  // Open the DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function handleDeepLink(url: string) {
  if (!mainWindow) return;

  const route = url.replace('screenrecorder://', '');
  if (isDev) {
    mainWindow.loadURL(`${DEV_SERVER_URL}/${route}`);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'), {
      hash: route
    });
  }
}

// Handle deep linking on Windows
app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Check if mainWindow exists before using it
  if (!mainWindow) {
    console.log('No main window found, creating new one');
    mainWindow = createWindow();
  }

  // Now we know mainWindow exists
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.focus();

  // Handle the deep link URL
  const url = commandLine.pop();
  if (url) handleDeepLink(url);
});

// Handle deep linking on macOS
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// Handle IPC messages for recording
ipcMain.on('start-recording', async (event) => {
  console.log('Received start-recording request');
  try {
    const sources = await desktopCapturer.getSources({ 
      types: ['window', 'screen'],
      thumbnailSize: { width: 0, height: 0 }
    });
    
    event.reply('recording-status', `Found ${sources.length} sources for recording`);
    console.log('Available sources:', sources.map(s => s.name).join(', '));
    
    event.reply('recording-status', 'Recording started');
  } catch (error) {
    console.error('Error starting recording:', error);
    event.reply('recording-error', `Failed to start recording: ${error}`);
  }
});

ipcMain.on('stop-recording', (event) => {
  console.log('Received stop-recording request');
  try {
    event.reply('recording-status', 'Recording stopped');
  } catch (error) {
    console.error('Error stopping recording:', error);
    event.reply('recording-error', `Failed to stop recording: ${error}`);
  }
});

ipcMain.handle('export-to-mp4', async (event, filePath) => {
  console.log('Received export-to-mp4 request for:', filePath);
  // Export logic would go here
  return { success: true, path: filePath };
});

ipcMain.handle('export-to-gif', async (event, filePath) => {
  console.log('Export to GIF:', filePath);
}); 