import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import * as Store from 'electron-store';
import { DataSource, Repository } from 'typeorm';
import { Bill, Category, Product, Purchase, User } from '../src/assets/';
const store = new Store();
let win: BrowserWindow = null;
const args = process.argv.slice(1);
const serve = args.some((val) => val === '--serve');

//database Items
const dbPath = path.join(
  app.getPath('appData'),
  app.getName(),
  'databases',
);
const filePath = path.join(dbPath,"Database.sqlite")
const entities = [Category, Product, User, Bill, Purchase];
const repositories = new Map<string, Repository<any>>();
const db: DataSource = db_init(dbPath);

function db_init(dbPath): DataSource {
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath);
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath,"")
  }
  const db = new DataSource({
    type: 'sqlite',
    synchronize: true,
    logging: true,
    logger: 'simple-console',
    database: filePath,
    entities: entities,
  });

  // init repositories :
  for (let entity of entities) {
    console.log('creating repositories');
    repositories.set(entity.name, db.getRepository(entity));
  }
  db.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('Error during Data Source initialization', err);
    });
  console.log('database Initialization finished');
  return db;
}

function createWindow(): BrowserWindow {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      allowRunningInsecureContent: serve ? true : false,
      nodeIntegration: false,
      // protect against prototype pollution
      contextIsolation: true,
      // Preload script
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    win.loadURL(
      url.format({
        pathname: path.join(__dirname, pathIndex),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    setTimeout(createWindow, 400);
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}

ipcMain.handle('save', async (event, name, object, params) => {
  return await repositories.get(name).save(object);
});

ipcMain.handle('create', async (event, name, object, params) => {
  return await repositories.get(name).create(object);
});

ipcMain.handle('find:one:by', async (event, name, object, params) => {
  return await repositories.get(name).findOneBy(object);
});

ipcMain.handle('find', async (event, name, params) => {
  return await repositories.get(name).find(params);
});

ipcMain.handle('update', async (event, name, id, object, params) => {
  return await repositories.get(name).update(id, object);
});

ipcMain.handle('remove', async (event, name, object, params) => {
  return await repositories.get(name).softRemove(object);
});

ipcMain.handle('stats', async (event, name, startDate, finishDate) => {
  return await repositories
    .get(name)
    .createQueryBuilder()
    .select('product,SUM(quantity)', 'quantity')
    .groupBy('productId');
});

ipcMain.handle('get', async (event, key) => {
  return await store.get(key);
});

ipcMain.on('set', async (event, key, value) => {
  store.set(key, value);
});

ipcMain.on('clear', async (event) => {
  store.clear();
});

ipcMain.on('delete', async (event, key) => {
  store.delete(key);
});

ipcMain.handle('has', (event, key) => {
  return store.has(key);
});

ipcMain.handle(
  'copyFile',
  (event, fileName: string, src: string, relativeDestination: string) => {
    const randomName =
      String(Math.floor(Math.random() * 100000)) + '_' + fileName;
    const destination: string = path.join(
      app.getAppPath(),
      'src',
      'assets',
      relativeDestination,
      randomName
    );
    fs.copyFile(src, destination, (e) => e);
    return path.join(
      '..',
      '..',
      '..',
      '..',
      'assets',
      relativeDestination,
      randomName
    );
  }
);
