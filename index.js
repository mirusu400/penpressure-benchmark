
const pressure_list = new Set();
var prevX = 0;
var prevY = 0;
var currX = 0;
var currY = 0;
var mouseDown = 0;
var brushSize = 1;


function drawDot(ctx, pressure) {
    // Let's use black by setting RGB values to 0, and 255 alpha (completely opaque)
    // parse rgba value from picker
    const colorsOnly = pickerColor.substring(
      pickerColor.indexOf('(') + 1,pickerColor.lastIndexOf(')')
    ).split(/,\s*/)
    const red = colorsOnly[0]
    const green = colorsOnly[1]
    const blue = colorsOnly[2]
    const alpha = colorsOnly.length === 4 ? colorsOnly[3] : 1
    ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${(alpha * (pressure * 3) > 1 ? 1 : alpha * (pressure * 3))})`;
    ctx.lineWidth = brushSize * (pressure * 3);
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);

    ctx.stroke();
    ctx.closePath();
    
}

function sketchpad_mouseDown(ctx, mouseX, mouseY) {
  mouseDown = 1;
  drawDot(ctx, mouseX, mouseY);
}

function sketchpad_mouseUp() {
  currX = 0;
  currY = 0;
  mouseDown = 0;
}

function sketchpad_mouseMove(ctx, mouseX, mouseY, pressure) { 
    // Draw a pixel if the mouse button is currently being pressed 
    if (mouseDown === 1) { 
      prevX = currX;
      prevY = currY;
      currX = mouseX;
      currY = mouseY;
      if (prevX === 0 && prevY === 0) {
        prevX = currX;
        prevY = currY;
        return;
      }
      drawDot(ctx, pressure); 
    }
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
  scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  };
}

window.addEventListener("load", () => {
  const canvas = document.getElementById('canvas')
  // Set full width
  canvas.width= window.innerWidth;
  canvas.height=window.innerHeight;
  canvas.style.touchAction = 'none';

  const canvasCtx = canvas.getContext('2d');
  canvasCtx.imageSmoothingEnabled = true;
  // Set background to black
  canvasCtx.fillStyle = 'white';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  canvas.addEventListener('pointerdown', (event) => {
    mouseDown = 1;
  })
  canvas.addEventListener('pointerup', (event) => {
    sketchpad_mouseUp();
  })


  canvas.addEventListener('pointermove', (event) => {
    const xy = getMousePos(canvas, event);
    const x = xy.x;
    const y = xy.y;
    
    const pressure = event.pressure;
    if (pressure === 0) {
      sketchpad_mouseUp();
      return;
    }
    pressure_list.add(event.pressure);
    const count = pressure_list.size;
    console.log(pressure_list)
    document.getElementById('pressure').innerText = count;
    document.getElementById('pressure-min').innerText = Math.min(...pressure_list).toFixed(5);
    document.getElementById('pressure-max').innerText = Math.max(...pressure_list).toFixed(5);
    document.getElementById('pressure-recent').innerText = pressure;
    // Draw by pressure
    sketchpad_mouseMove(canvasCtx, x, y, pressure);

    const barCtx = bar.getContext('2d');
    const barWidth = bar.width;
    const drawXPos = pressure * barWidth;
    // Set color to red
    barCtx.strokeStyle = 'red';
    // Draw a line into bar   
    barCtx.beginPath();
    barCtx.moveTo(drawXPos, 0);
    barCtx.lineTo(drawXPos, bar.height);
    barCtx.stroke();
  }, false);

  const bar = document.getElementById('bar')
  // Set canvas background to black
  const ctx = bar.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, bar.width, bar.height);



  const clearButton = document.getElementById('clear')
  clearButton.addEventListener('click', () => {
    canvasCtx.fillStyle = 'white';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    barCtx.fillStyle = 'black';
    barCtx.fillRect(0, 0, bar.width, bar.height);
    pressure_list.clear();
  });

  const brushRange = document.getElementById('brush-range')
  const brushSizeSpan = document.getElementById('brush-size')
  brushRange.addEventListener('input', (event) => {
    brushSize = event.target.value;
    brushSizeSpan.innerText = brushSize;
  });
  brushSizeSpan.innerText = brushSize;

  
})
