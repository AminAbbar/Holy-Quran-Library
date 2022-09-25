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
            devTools: true,
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


app.whenReady().then(() => {
    callMainWindow()



    app.on('activate', function() {

        if (BrowserWindow.getAllWindows().length === 0) createUpdateWindow()

    })
})


app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})