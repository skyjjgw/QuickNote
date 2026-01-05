const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray = null;
let isExpanded = true;

// 窗口尺寸配置
const EXPANDED_SIZE = { width: 800, height: 600 };
const COMPACT_SIZE = { width: 300, height: 200 };

// 笔记存储目录
// 生产环境使用 userData 目录，开发环境使用 D:\note\all
const NOTES_DIR = app.isPackaged 
    ? path.join(app.getPath('userData'), 'notes') 
    : 'D:\\note\\all';
const RECYCLE_BIN_DIR = path.join(NOTES_DIR, 'recycle_bin');
const LOGS_DIR = path.join(NOTES_DIR, 'logs');

// 确保目录存在
[NOTES_DIR, RECYCLE_BIN_DIR, LOGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (error) {
      console.error(`Failed to create directory ${dir}:`, error);
    }
  }
});

function logOperation(operation, details) {
    const logFile = path.join(LOGS_DIR, 'operations.log');
    const timestamp = new Date().toISOString();
    const user = process.env.USERNAME || process.env.USER || 'Unknown';
    const logEntry = `[${timestamp}] User[${user}] ${operation} ${details}\n`;
    
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) console.error('Failed to write log:', err);
    });
}

function cleanRecycleBin() {
    // 30天清理机制
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    fs.readdir(RECYCLE_BIN_DIR, (err, files) => {
        if (err) return;
        files.forEach(file => {
            const filePath = path.join(RECYCLE_BIN_DIR, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;
                if (Date.now() - stats.mtimeMs > THIRTY_DAYS_MS) {
                    fs.unlink(filePath, () => {});
                }
            });
        });
    });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: EXPANDED_SIZE.width,
    height: EXPANDED_SIZE.height,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function toggleMode() {
  isExpanded = !isExpanded;
  if (isExpanded) {
    mainWindow.setSize(EXPANDED_SIZE.width, EXPANDED_SIZE.height);
    mainWindow.setAlwaysOnTop(false);
  } else {
    mainWindow.setSize(COMPACT_SIZE.width, COMPACT_SIZE.height);
    mainWindow.setAlwaysOnTop(true);
  }
  mainWindow.webContents.send('mode-changed', isExpanded ? 'expanded' : 'compact');
}

function createTray() {
  try {
      tray = new Tray(path.join(__dirname, '../assets/icon.png')); 
  } catch (e) {
      console.error('Tray icon not found');
      return; 
  }
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示/隐藏', click: () => mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show() },
    { label: '退出', click: () => {
        app.isQuitting = true;
        app.quit();
    }}
  ]);
  
  tray.setToolTip('QuickNote');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  cleanRecycleBin();

  // 注册全局快捷键
  globalShortcut.register('Ctrl+Alt+M', () => {
      if (mainWindow.isVisible()) {
          if (mainWindow.isMinimized()) {
              mainWindow.restore();
              mainWindow.focus();
          } else {
              mainWindow.minimize(); // 或者 mainWindow.hide()，根据需求
          }
      } else {
          mainWindow.show();
          mainWindow.focus();
      }
  });

  // 开机自启
  app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: false,
      path: process.execPath,
      args: [
          '--process-start-args', `"--hidden"`
      ]
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // 不退出，保持后台运行
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC 通信
ipcMain.handle('get-notes', async () => {
    if (!fs.existsSync(NOTES_DIR)) return [];
    const files = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
    return files.map(f => {
        const content = fs.readFileSync(path.join(NOTES_DIR, f), 'utf-8');
        return { name: f, content };
    });
});

ipcMain.handle('save-note', async (event, { name, content }) => {
    fs.writeFileSync(path.join(NOTES_DIR, name), content);
    return { success: true };
});

ipcMain.handle('delete-note', async (event, filename) => {
    const srcPath = path.join(NOTES_DIR, filename);
    const destPath = path.join(RECYCLE_BIN_DIR, filename);
    if (fs.existsSync(srcPath)) {
        fs.renameSync(srcPath, destPath);
        logOperation('DELETE', filename);
        return { success: true };
    }
    return { success: false };
});

ipcMain.handle('toggle-mode', () => {
    toggleMode();
});

ipcMain.handle('minimize-window', () => {
    mainWindow.minimize();
});

ipcMain.handle('close-window', () => {
    mainWindow.hide();
});

ipcMain.handle('save-file-dialog', async (event, { defaultName, content }) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: defaultName,
        filters: [{ name: 'Markdown', extensions: ['md'] }]
    });
    
    if (filePath) {
        fs.writeFileSync(filePath, content);
        return { success: true, filePath };
    }
    return { canceled: true };
});
