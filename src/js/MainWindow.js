const { ipcRenderer } = require('electron');
const ipc = ipcRenderer
const path = require('path')
const fs = require('fs')
const getMP3Duration = require('get-mp3-duration')
const ufs = require("url-file-size");
const axios = require('axios')
const request = require('request')
let filesDir
filesDir = path.join(__dirname, '../../../../../../../../.holyQuranData/')
    //////filesDir = path.join(__dirname, '../../../../../.holyQuranData/')



if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
}




window.addEventListener('DOMContentLoaded', () => {



            const navCloseBtn = document.getElementById('closebtn')
            const navMinimizeBtn = document.getElementById('minimize')
            const navMaximizeBtn = document.getElementById('maximize')
            navMaximizeBtn.addEventListener('click', () => { ipc.send('maximizeApp') })
            navCloseBtn.addEventListener('click', () => { ipc.send('closeApp') })
            navMinimizeBtn.addEventListener('click', () => { ipc.send('minimizeApp') })
            const quranTable = document.getElementById('tbody')
            const downloadAllBtnSize = document.getElementById('downloadAllSize')
            const SearchInput = document.getElementById('SearchInput')
            const downloadAllBtn = document.getElementById('downloadAll')
            const VolumeController = document.getElementById('volume')
            const MaxLength = document.getElementById('maxLength')
            const CurrentLength = document.getElementById('currentLength')
            const playpause = document.querySelector('.playpauseToggle')
            const CurretnTitle = document.getElementById('currentTitle')
            const CurretnReaderTitle = document.getElementById('currentReaderTitle')
            const NextButton = document.getElementById('nextBtn')
            const PrevButton = document.getElementById('prevBtn')
            const repeatToggle = document.querySelector('.repeatToggle')
            const repeatMode = 0
            const SelectorContinerToggle = document.querySelector('.selectedBox')
            const selectorBox = document.querySelector('.optionsBox')
            const ReadersContiner = document.querySelector('.readerOptions')
            const currentReaderInput = document.getElementById('currentReaderInput')
            const currentReaderOption = document.getElementById('currentReaderOption')
            let deleteBtns = document.querySelectorAll('.deleteitem')
            let audio = document.createElement('audio')
            let CurrentPlay = false
            let curretnPlayUpdater
            let suwra = require(`../suwar.json`)[0]
            currentReaderInput.addEventListener('input', () => {
                ReadersContiner.innerHTML = ``

                require(`../suwar.json`).forEach((r) => {
                    if (r[0].reader.replace('إ', 'ا').replace('أ', 'ا').replace('آ', 'ا').replace('ؤ', 'و').includes(currentReaderInput.value.replace('إ', 'ا').replace('أ', 'ا').replace('آ', 'ا').replace('ؤ', 'و'))) {
                        ReadersContiner.innerHTML += `<div  class="option">${r[0].reader}</div>`
                    }
                })
                ReadersContiner.querySelectorAll('.option').forEach((option, i) => {
                    option.addEventListener('click', () => {
                        SelectorContinerToggle.children[1].classList.toggle('active-selector')
                        selectorBox.classList.toggle('active-selector')
                        currentReaderOption.textContent = option.textContent
                        suwra = require(`../suwar.json`)[i]
                        loadSuwra()

                    })
                })
            })
            ReadersContiner.innerHTML = ``
            require(`../suwar.json`).forEach((r) => {
                ReadersContiner.innerHTML += `<div  class="option">${r[0].reader}</div>`

            })
            ReadersContiner.querySelectorAll('.option').forEach((option, i) => {
                option.addEventListener('click', () => {
                    SelectorContinerToggle.children[1].classList.toggle('active-selector')
                    selectorBox.classList.toggle('active-selector')
                    currentReaderOption.textContent = option.textContent
                    suwra = require(`../suwar.json`)[i]
                    loadSuwra()

                })
            })


            repeatToggle.style.color = '#fff'
            repeatToggle.style.opacity = '0.5'
            SelectorContinerToggle.addEventListener('click', () => {
                SelectorContinerToggle.children[1].classList.toggle('active-selector')
                selectorBox.classList.toggle('active-selector')
            })
            const progressBar = document.getElementById('progressbar')
            progressBar.addEventListener('input', () => {
                audio.currentTime = (audio.duration * progressBar.value) / 100
            })


            playpause.addEventListener('click', () => {
                if (CurrentPlay.state) {
                    pause(CurrentPlay.index)
                } else {
                    resume(CurrentPlay.index)
                }
            })
            document.addEventListener('keydown', (e) => {
                if (CurrentPlay.index >= 0) {
                    if (e.code == 'Space') {
                        if (CurrentPlay.state) {
                            pause(CurrentPlay.index)
                        } else {
                            resume(CurrentPlay.index)
                        }
                    }
                }

            })
            NextButton.addEventListener('click', () => {
                CurrentPlay.index = CurrentPlay.index + 1
                play(CurrentPlay.index)
            })
            PrevButton.addEventListener('click', () => {
                CurrentPlay.index = CurrentPlay.index - 1
                play(CurrentPlay.index)
            })

            function selectHandler(b, i) {

                b.addEventListener('click', () => {
                    if (CurrentPlay.index != i) {
                        play(i)
                    } else if (CurrentPlay.index == i && CurrentPlay.state == true) {
                        pause(i)
                    } else if (CurrentPlay.index == i && CurrentPlay.state == false) {
                        resume(i)
                    }



                })
            }
            VolumeController.addEventListener('input', () => {
                audio.volume = VolumeController.value / 100
            })
            SearchInput.addEventListener('input', () => {

                        quranTable.innerHTML = ``
                        suwra.forEach(async(s, i) => {

                                    let state
                                    if (fs.existsSync(`${filesDir}${s.reader}/${s.name}.mp3`)) {
                                        state = 2
                                    } else {
                                        state = 0
                                    }
                                    if (s.name.replace('إ', 'ا').replace('أ', 'ا').replace('آ', 'ا').replace('ؤ', 'و').includes(SearchInput.value.replace('إ', 'ا').replace('أ', 'ا').replace('آ', 'ا').replace('ؤ', 'و'))) {
                                        quranTable.innerHTML +=
                                            `<tr id="${i}">
    <td>${i + 1}</td>
    <td>${s.name}</td>
    <td>${s.reader}</td>
    <td id="len${i}">${s.duration ? s.duration:`03:00`}</td>
    ${state == 2 ? `<td state="${state}" class="success" id="state${i}">محمّل</td>` : `<td state="${state}" id="state${i}"><div class="downloadInfo"><span  target="${i}" class="downloadBtn material-icons-sharp">cloud_download</span><h3 class="warning">${byteHandler(s.size , 2)}</h3></div></td>`}
    <td class="options"><span target="${i}" class="selectPlay primary material-icons-sharp">play_circle</span>${state == 2? `<span class="deleteitem danger material-icons-sharp">remove_circle_outline</span>`: ``}</td>
    </tr>`
                    }
                    
})
getDeleteBtns()
let SelectBtn = document.querySelectorAll('.selectPlay')
SelectBtn.forEach((btn, i)=>{
    selectHandler(btn , i)
})
            })
    
            


           
    loadSuwra()



  
 

    //////////////////////////////////////////////////////////////////////Functions/////////////////////////////////////////
    function play(i){
        let SelectBtn = document.querySelectorAll('.selectPlay')
        if (!audio.src) {
            CallPlayerConitner()
        }
        CheckFileState(audio, `${filesDir}${suwra[i].reader}/${suwra[i].name}.mp3`, `${suwra[i].url}`)
        formatPreviousAudio()
        CurrentPlay = { 'state': true, 'index': i }
        document.getElementById(i).classList.add('active')
        CurretnTitle.textContent = suwra[i].name
        CurretnReaderTitle.textContent = suwra[i].reader
        playpause.textContent = `pause_circle`
        SelectBtn[i].textContent = `pause_circle`
        audio.play()
        curretnPlayUpdater = setInterval(updateTimerFunction, 500)
        if(i != suwra.length - 1){
            audio.addEventListener('ended',function d(){
                audio.removeEventListener('ended' ,d )
                if(repeatMode == 1){
                    play(i)
                }else if(repeatMode == 0){
                    play(i + 1)
                }
                
            })
        }

    }
    function pause(i){
        let SelectBtn = document.querySelectorAll('.selectPlay')
        clearInterval(curretnPlayUpdater)
        playpause.textContent = `play_circle`
        SelectBtn[i].textContent = `play_circle`
        CurrentPlay.state = false
        audio.pause()
    }
    function resume(i){
        let SelectBtn = document.querySelectorAll('.selectPlay')
        playpause.textContent = `pause_circle`
        SelectBtn[i].textContent = `pause_circle`
        CurrentPlay.state = true
        audio.play()
        curretnPlayUpdater = setInterval(updateTimerFunction, 500)

    }
    function getDeleteBtns(){
        deleteBtns = document.querySelectorAll('.deleteitem')
        Array.from(deleteBtns).forEach((btn, i) => {
            btn.addEventListener('click', () => {
            
                DeleteDownload(btn.parentElement.parentElement.getAttribute('id'))
                loadSuwra()
              
            })
        })
    }
    function DeleteDownload(i){
        fs.unlink(`${filesDir}${suwra[i].reader}/${suwra[i].name}.mp3`,err=>{
            if(err)console.log(err.message);
            
        })
    }
    function loadSuwra(){
        quranTable.innerHTML = ``
        let sizeTotal = 0 
        suwra.forEach(async(s, i) => {
            let state
            if (fs.existsSync(`${filesDir}${s.reader}/${s.name}.mp3`)) {
                state = 2
            } else {
                state = 0
                sizeTotal += +s.size
            }

            quranTable.innerHTML +=
                `<tr id="${i}">
    <td>${i + 1}</td>
    <td>${s.name}</td>
    <td>${s.reader}</td>
    <td id="len${i}">${s.duration ? msHandler(s.duration * 1000) :`03:00`}</td>
    ${state == 2 ? `<td state="${state}" class="success" id="state${i}">محمّل</td>` : `<td state="${state}" id="state${i}"><div class="downloadInfo"><span  target="${i}" class="downloadBtn material-icons-sharp">cloud_download</span><h3 class="warning">${byteHandler(+s.size)}</h3></div></td>`}
    <td class="options"><span target="${i}" class="selectPlay primary material-icons-sharp">play_circle</span>${state == 2? `<span class="deleteitem danger material-icons-sharp">remove_circle_outline</span>`: ``}</td>
    </tr>`
                 


                })
                let SelectBtn = document.querySelectorAll('.selectPlay')
                SelectBtn.forEach((btn , i)=>{
                    selectHandler(btn , i)
                })
                if(sizeTotal){
                    if(downloadAllBtnSize)downloadAllBtnSize.textContent = byteHandler(sizeTotal , 2) ;
                   
                }else{
                    if(downloadAllBtn)downloadAllBtn.style.display = 'none' ;
           
                }
                const downloadBtn = document.querySelectorAll('.downloadBtn')
                if (downloadBtn) {
                    Array.from(downloadBtn).forEach((btn) => {
                        btn.addEventListener('click', () => {
                            download(suwra[+btn.getAttribute('target')].url, `${filesDir}${suwra[+btn.getAttribute('target')].reader}/${suwra[+btn.getAttribute('target')].name + `.temp`}`, btn ,+btn.getAttribute('target'))
                        })
                    })
                }
                getDeleteBtns()
    
    }
    function formatPreviousAudio(){
        let SelectBtn = document.querySelectorAll('.selectPlay')
             Array.from(SelectBtn).forEach((btn,index) => {
                btn.textContent = 'play_circle'
                document.getElementById(index).classList.remove('active')
    
            })
      
        
    }
    function updateTimerFunction() {
        CurrentLength.textContent = msHandler(audio.currentTime * 1000)
        progressBar.value = (((audio.currentTime * 1000) / 10) / audio.duration).toFixed(2)
        MaxLength.textContent = msHandler(audio.duration * 1000)
    }
    function download(installerfileURL, installerfilename, btn, i, ) {
        let received_bytes = 0;
        let total_bytes = 0;
       const readerDir = installerfilename.slice(0,-installerfilename.split('/')[1].length)
    
        if (!fs.existsSync(readerDir)){
            fs.mkdirSync(readerDir);
        }
        const outStream = fs.createWriteStream(`${installerfilename}`);
        
        request
            .get(installerfileURL)
            .on('error', function(err) {
                console.log(err);
            })
            .on('response', function(data) {
                total_bytes = parseInt(data.headers['content-length']);
            })
            .on('data', function(chunk) {
                received_bytes += chunk.length;
                showDownloadingProgress(received_bytes, total_bytes, btn);
            })
            .pipe(outStream);
            outStream.on("finish", () => {
            outStream.close();
            document.getElementById(`state${i}`).innerHTML = `محمّل`
            document.getElementById(`state${i}`).classList.add('success')
            let nName = installerfilename.replace('.temp', '.mp3')
            fs.rename(installerfilename, nName, () => {
                //const buffer = fs.readFileSync(`${nName}`)
                                                                          // document.getElementById(`len${i}`).textContent = msHandler(getMP3Duration(buffer))
               // updateJson(msHandler(getMP3Duration(buffer)), nName.slice(0,-4))
                loadSuwra()
            })
    
    
    
        });
    }; 
    function showDownloadingProgress(received, total, btn) {
        let percentage = ((received * 100) / total).toFixed(2);
        btn.classList.remove('material-icons-sharp')
    
    
        btn.classList.add('success')
        btn.textContent = `${percentage}%`
        btn.style.paddingRight = 0
    
        // console.log(percentage + "% | " + received + " bytes downloaded out of " + total + " bytes.");
    }
    downloadAllBtn.addEventListener('click',()=>{
        downloadAllBtn.disabled = true;
        downloadAllBtn.style.opacity = '0.3'
        
        
        let btns = []
        for (let i = 0 ; i < suwra.length ; i++){
            if(document.getElementById(`state${i}`).getAttribute('state') == 0){
                btns.push(document.getElementById(`state${i}`))
            }
            
        }
        btns.forEach((b)=>{
            b.children[0].children[0].click()
        })
    
    })
    function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }
    
    function msHandler(milliseconds) {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
    
        seconds = seconds % 60;
        minutes = minutes % 60;
    
        hours = hours % 24;
    
        return `${hours != 0 ? padTo2Digits(hours) + `:` : ``}${padTo2Digits(minutes)}:${padTo2Digits(
          seconds,
        )}`;
    }
    
    function byteHandler(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes'
    
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    
        const i = Math.floor(Math.log(bytes) / Math.log(k))
    
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    //async function updateJson(duration, NAME) {
    //    if (duration) {
    //        let based = suwra
    //        Array.from(based).forEach((s, i) => {
    //
    //            let arry = suwra
    //
    //            if (s.name == NAME) {
    //
    //                arry[i] = {
    //                    'name': s.name,
    //                    'reader': s.reader,
    //                    'url': s.url,
    //                    'size': s.size,
    //                    'duration': duration
    //                }
    //                fs.writeFileSync(`./src/suwar.json`, JSON.stringify(arry).replaceAll(',', ', \n'));
    //                suwra = require(`../suwar.json`)
    //            }
    //        })
    //
    //    }
    //
    //
    //}
    function CallPlayerConitner(){
        document.querySelector('.PlayerContainer').querySelectorAll('input').forEach((input)=>{
        input.style.display = 'inline-block'})
        document.querySelector('.warp').style.transition = `height 500ms`
        document.querySelector('.warp').style.height = `calc(100vh - 200px)`
        document.querySelector('.PlayerContainer').style.transform = "translateY(0)"
    }
    function CheckFileState(audio, path , url){
        if (fs.existsSync(path)) {
         
            audio.src = path 
            
        }else{
            audio.src = url
           
        }
    }
    async function GetSizes(i){
        let arry = suwra
        const size = ufs(url).then(d => { return d;}).catch(err => {console.log(err.message)})
        arry[i].size = await size
        fs.writeFileSync('ahmad_huth', JSON.stringify(arry).replaceAll(',' , ', \n'));
        suwra = require(`../suwar.json`)[0]
    }

    
        //////////////////////////////////////////////////////////////////////Functions/////////////////////////////////////////

})