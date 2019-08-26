let forwardTimes = []
let hummanize = false

class Human extends EventTarget {
  happy() {
    this.dispatchEvent(new Event('happy'));
  }
}
const you = new Human();

function renderLine(id, text) { 
    if (id>1){
      prev = id-1
      let elem = document.getElementsByClassName(`line-${prev}`)[0]
      console.log("elem",elem)
      elem.parentNode.removeChild(elem);
    }
    var x = document.createElement("p");
    x.setAttribute("class", `line-${id} anim-typewriter`);
    var t = document.createTextNode(text); 
    x.appendChild(t); 
    document.getElementById("lines").appendChild(x); 
  }

function updateTimeStats(timeInMs) {
    forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
    const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
    // console.log(`time: ${Math.round(avgTimeInMs)} ms`)
    // console.log(`fps: ${faceapi.round(1000 / avgTimeInMs)}`)
  }
function takePicture(){
    const video = $('#inputVideo').get(0)
    video.paused?video.play():video.pause()
  }
async function onPlay() {
    const video = $('#inputVideo').get(0)
  if(video.paused || video.ended || !isFaceDetectionModelLoaded())
      return setTimeout(() => onPlay())
  if(hummanize){
      const options = getFaceDetectorOptions()
      const ts = Date.now()
      const result = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceExpressions()
      updateTimeStats(Date.now() - ts)
      if (result.length) {
        const canvas = $('#overlay').get(0)
        const dims = faceapi.matchDimensions(canvas, video, true)
        const resizedResult = faceapi.resizeResults(result, dims)
        
        faceapi.draw.drawDetections(canvas, resizedResult)
        faceapi.draw.drawFaceLandmarks(canvas, resizedResult)
        faceapi.draw.drawFaceExpressions(canvas, resizedResult)

        console.log("result",result)
        for (let i = 0; i < result.length; i++) {
          const face = result[i];
          if (face.expressions.happy > 0.99){
            console.log("happy 99")  
            you.happy()
          }
        }
      }
    }
    setTimeout(() => onPlay())
  }
async function run() {
    // load face detection and face landmark models
    await changeFaceDetector(TINY_FACE_DETECTOR)
    await faceapi.loadFaceLandmarkModel('/weights')
    await faceapi.loadFaceExpressionModel('/weights')
    
    changeInputSize(160)
  // try to access users webcam and stream the images
    // to the video element
    
    // const video = $('#inputVideo').get(0)
    
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }
  // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
      // First get ahold of the legacy getUserMedia, if present
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
      // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }
  navigator.mediaDevices.getUserMedia({video: true })
    .then(function(stream) {
      const video = $('#inputVideo').get(0)
      // Older browsers may not have srcObject
      if ("srcObject" in video) {
        video.srcObject = stream;
      } else {
        // Avoid using this in new browsers, as it is going away.
        video.src = window.URL.createObjectURL(stream);
      }
    const typewriter = new Typewriter('#lines', {
        loop: false,
        delay:42
      });
      
      typewriter.typeString('Hello Friend!')
      .pauseFor(2500)
      .deleteAll()
      .typeString('We need to test your humanness...')
      .pauseFor(2500)
      .typeString('Please be happy ')
      .pauseFor(1000)
      .typeString('99% :D')
      .callFunction(() => {
        hummanize=true
        you.addEventListener('happy', (e) => {
          takePicture()
        });
    })
      .start();
    // renderLine(1,"Hello friend...")
      // setTimeout(()=>{renderLine(2,"I need to test your humanness!")},3000)
      // setTimeout(()=>{
      //   hummanize=true
      //   renderLine(3,"Please be 99% happy :D")
      // },3000)
  })
    .catch(function(err) {
      if (window.confirm('Your browser sucks!!! Click OK to donwload Firefox beta')) {
        window.location.href="https://play.google.com/store/apps/details?id=org.mozilla.firefox_beta&hl=en"
      } else {
        window.location.href='https://luscofusco.site';
      }
      console.log(err.name + ": " + err.message);
    });
  }
function updateResults() {}
$(document).ready(function() {
    initFaceDetectionControls()
    run()
  })