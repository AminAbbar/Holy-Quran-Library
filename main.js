const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const path = require('path')
const ipc = ipcMain
const isDev = require('electron-is-dev');
const log = require('electron-log');
const fs = require('fs')
let logPath
if (isDev) {

    logPath = path.join(__dirname, '../../../.holyQuranData/log/')
} else {
    logPath = path.join(__dirname, '../../../../../../../../.holyQuranData/log/')
}

if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
}

log.transports.file.resolvePath = () => `${logPath}logs.log`;
log.log(`app ver : ${app.getVersion()}`)
const { autoUpdater } = require('electron-updater')
autoUpdater.logger = log


let MainWindow
let updateWindow
console.log(logPath)
const callMainWindow = async() => {
    MainWindow = new BrowserWindow({
        Width: 1000,
        Height: 650,
        minWidth: 1000,
        minHeight: 650,
        frame: false,
        show: false,
        webPreferences: {
            devTools: false,
            preload: path.join(__dirname, './src/js/MainWindow.js'),
            sandbox: false
        }
    })

    if (!isDev) {
        globalShortcut.register('CommandOrControl+R', () => {

        })
        globalShortcut.register('CommandOrControl+Shift+R', () => {

        })
        globalShortcut.register('CommandOrControl+Shift+I', () => {

        })
        globalShortcut.register('F11', () => {

        })
    }

    MainWindow.loadFile('./src/main.html')
    MainWindow.once('ready-to-show', MainWindow.show)

    /////Events/////////
    MainWindow.on('closed', () => {
        MainWindow = null
    })
    ipc.on('minimizeApp', () => {
        MainWindow.minimize()

    })
    ipc.on('maximizeApp', () => {
        if (MainWindow.isMaximized()) {
            MainWindow.restore();

        } else {
            MainWindow.maximize()
        }
    })
    ipc.on('closeApp', () => {
        MainWindow.close()
    })
}

function createUpdateWindow() {
    updateWindow = new BrowserWindow({
        width: 500,
        height: 300,
        webPreferences: {
            preload: path.join(__dirname, './src/js/update.js'),
            devTools: false,
            sandbox: false
        },
        show: false,
        resizable: false,
        frame: false
    })
    updateWindow.loadFile('./src/update.html')
    updateWindow.once('ready-to-show', updateWindow.show)

    if (!isDev) {
        globalShortcut.register('CommandOrControl+R', () => {

        })
        globalShortcut.register('CommandOrControl+Shift+R', () => {

        })
        globalShortcut.register('CommandOrControl+Shift+I', () => {

        })
        globalShortcut.register('F11', () => {

        })
    }
    updateWindow.on('closed', () => {
        updateWindow = null
    })



}

app.whenReady().then(() => {
    if (isDev) {
        callMainWindow()
    } else {
        createUpdateWindow()
        autoUpdater.checkForUpdatesAndNotify()
    }



    app.on('activate', function() {

        if (BrowserWindow.getAllWindows().length === 0) createUpdateWindow()

    })
})

autoUpdater.on('checking-for-update', () => {
    updateWindow.webContents.send('checkForUpdate')

})
autoUpdater.on('update-not-available', () => {


    updateWindow.webContents.send('noUpdates')

})
ipc.on('updatedBack', () => {


    updateWindow.close()
    createWindow()
})
autoUpdater.on('update-available', () => {
    log.info('update aviliable')
    autoUpdater.autoDownload = false;
    updateWindow.webContents.send('updateAviliable')
})

ipc.on('startDownload', () => {
    autoUpdater.downloadUpdate()
})
autoUpdater.on('download-progress', (progressTrack) => {
    log.info('download progress')
    updateWindow.webContents.send('downloadProgress', progressTrack)
    log.info(progressTrack.percent)
})
autoUpdater.on('error', (err) => {
    log.info(err)
    log.info('erorr')
})

autoUpdater.on('update-cancelled', () => {
    log.info('cancled')
})
autoUpdater.on('update-downloaded', () => {
    log.info('downloaded')
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})