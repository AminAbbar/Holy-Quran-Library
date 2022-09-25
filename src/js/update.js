const log = require('electron-log');
const path = require('path')
const { ipcRenderer } = require('electron');

log.transports.file.resolvePath = () => path.join('C:/Users/Aness/Desktop/Golden Fish Tool', '/log.log');


window.addEventListener('DOMContentLoaded', () => {
    let quite = false
    ipcRenderer.on('checkForUpdate', () => {
        document.getElementById('status').textContent = 'Checking For Update ...'

    })
    ipcRenderer.on('noUpdates', () => {
        document.getElementById('status').textContent = 'You have the latest update'
        document.getElementById('status').classList.add('success')
        quite = true
    })
    ipcRenderer.on('updateAviliable', () => {
        document.getElementById('status').textContent = 'Update Aviliable !' //'Downloading The Update ...'
        document.getElementById('status').style.color = '#ff7782';
        document.getElementById('progressContiner').innerHTML = `<button id="downloadBtn">Download The Update <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 19h18v2H3v-2zM13 9h7l-8 8-8-8h7V1h2v8z" fill="rgba(255,255,255,1)"/></svg></button>`
        document.getElementById('downloadBtn').addEventListener('click', () => {
            ipcRenderer.send('startDownload')
        })
    })
    ipcRenderer.on(`downloadProgress`, (evt, content) => {
        console.log(content)
        document.getElementById('progressContiner').innerHTML = ` <div class="warp">
        <h3 class="primary">${getvalue(+content.bytesPerSecond)} / s</h3>
        <div class="downloadProgress">
         <div style="width: ${+content.percent.toFixed(2)}%"> 1</div>
    
        </div>
        <h3 class="warning">%${+content.percent.toFixed(2)}</h3>
    </div>
    <div>
        <h3 class="primary" style="font-weight: bold"><span class="success">${getvalue(+content.transferred)}</span> / <span class="warning">${getvalue(+content.total)}</span></h3>
    </div>
    `
    })

    let checker = setInterval(() => {
        if (quite == true) {
            setTimeout(() => {
                clearInterval(checker)
                ipcRenderer.send('updatedBack')

            }, 2000)
        }

    }, 100)


    log.log('open successful')


    function getvalue(value) {
        if (value > 1000000000) {
            return `${(value / 1000000000).toFixed(2)} Gb`
        } else if (value > 1000000) {
            return `${(value / 1000000).toFixed(2)} Mb`
        } else if (value > 1000) {
            return `${(value / 1000).toFixed(2)} Kb`
        } else {
            return `${value} byte`
        }
    }


})