const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const ipc = ipcMain

let MainWindow
console.log(__dirname)
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