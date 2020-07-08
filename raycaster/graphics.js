var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var canvas1 = document.getElementById("canvas1");
var ctx1 = canvas1.getContext("2d");
var px, py, pdx, pdy, pa;
var degree = 0.0174533;
var speed;
var keys = {};
window.onkeyup = function(e) { keys[e.keyCode] = false; };
window.onkeydown = function(e) { keys[e.keyCode] = true; };
var mapX = 8;
var mapY = 8;
var mapS = 64;
var wallSize = 100;
var mouseX;
var mouseY
var world = [
  1,1,1,1,1,1,1,1,
  1,0,1,1,0,0,0,1,
  1,0,0,1,0,0,0,1,
  1,0,0,1,0,0,0,1,
  1,0,0,0,0,0,0,1,
  1,0,0,0,0,0,0,1,
  1,0,0,0,0,1,0,1,
  1,1,1,1,1,1,1,1
];
var mouseDown = 0;
document.body.onmousedown = function() {
  ++mouseDown;
}
document.body.onmouseup = function() {
  --mouseDown;
  mouseDown = Math.max(mouseDown, 0);
}
canvas.addEventListener("mousemove", function(event){
  var rect = canvas.getBoundingClientRect();
  pmouseX=mouseX;
  pmouseY=mouseY;
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
});
function angleDifference(angle1, angle2 )
{
    diff = (angle2 - angle1 + 180 ) % 360 - 180;
    return diff < -180 ? diff + 360 : diff;
}
function init(){
  py = 250
  px = 200
  speed = 2
  pa = 1;
  pdx = Math.cos(pa) * speed;
  pdy = Math.sin(pa) * speed;
}
function drawPlayer(){
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(px, py, 10, 10);

  ctx.beginPath();
  ctx.moveTo(px + 5, py + 5);
  ctx.lineTo(px + pdx * 20 + 5, py + pdy * 20 + 5);
  ctx.stroke();
}
function drawWalls(){
  for (var y = 0; y < mapY; y++){
    for (var x = 0; x < mapX; x++){
      if (world[y * 8 + x] == 1){
        ctx.fillStyle = "white";
        ctx.fillRect(x * wallSize + 1, y * wallSize + 1, wallSize - 2, wallSize - 2);
      }
    }
  }
}
function dist(ax, ay, bx, by){
  return Math.hypot(Math.abs(ax - bx), Math.abs(ay - by))
}
function limit(d){
  if (d < 0){
    return d + 2 * Math.PI;
  }
  if (d > 2 * Math.PI){
    return d - 2 * Math.PI
  }
  return d
}
function drawRays(){
  var mx, my, mp, dof, rx, ry, ra, xo, yo, fdist;
  var hx, hy, vx, vy, bx, by;

  ra = limit(pa - 30 * degree);
  for (x = 0; x < 60; x++){
    hx = 0;
    hy = 100000000;
    vx = 0;
    vy = 10000000;
    bx = 0;
    by = 100000000;
    ra += degree;
    ra = limit(ra);
    //Horizontal Lines
    dof = 0;
    var aTan = -1/Math.tan(ra);
    if (ra > Math.PI){
      //Man is looking up
      ry = Math.floor(py/100) * 100 - 0.0001;
      rx = (py - ry + 5) * aTan + px + 5;
      yo = -100;
      xo = -yo * aTan;

    }
   else if (ra < Math.PI){
     //Man is looking down
     ry = Math.floor(py/100) * 100 + 100;
     rx = (py - ry + 5) * aTan + px + 5;
     yo = 100;
     xo = -yo * aTan;
   }
   else if (ra == 0 || ra == Math.PI){
     rx = px;
     ry = py;
     dof = 8;
   }
   while(dof < 8){
     mx = Math.floor(rx/100);
     my = Math.floor(ry/100);
     mp = my * mapY + mx;
     if (mp < mapX * mapY && world[mp] == 1){
       dof = 8;
       hx = rx;
       hy = ry;
     }
     else{
       rx += xo;
       ry += yo;
       dof += 1;
     }
   }
   //Vertical Lines
   dof = 0;
   var nTan = -Math.tan(ra);
   if (ra > Math.PI/2 && ra < 3 * Math.PI/2){
     //Man is looking left
     rx = Math.floor(px/100) * 100 - 0.0001;
     ry = (px - rx + 5) * nTan + py + 5;
     xo = -100;
     yo = -xo * nTan;

   }
    else if (ra > 3 * Math.PI/2 || ra < Math.PI/2){
      //Man is looking right
      rx = Math.floor(px/100) * 100 + 100;
      ry = (px - rx + 5) * nTan + py + 5;
      xo = 100;
      yo = -xo * nTan;
    }
    else if (ra == 0 || ra == Math.PI){
      rx = px;
      ry = py;
      dof = 8;
    }
    while(dof < 8){
      mx = Math.floor(rx/100);
      my = Math.floor(ry/100);
      mp = my * mapY + mx;
      if (mp < mapX * mapY && world[mp] == 1){
        dof = 8;
        vx = rx;
        vy = ry;
      }
      else{
        rx += xo;
        ry += yo;
        dof += 1;
      }
    }
    if (dist(vx, vy, px + 5, py + 5) < dist(hx, hy, px + 5, py + 5)){
      bx = vx;
      by = vy;
      fdist = dist(vx, vy, px + 5, py + 5);
      ctx1.fillStyle = "#fc0b03";
    }
    else {
      bx = hx;
      by = hy;
      fdist = dist(hx, hy, px + 5, py + 5);
      ctx1.fillStyle = "#780a00";
    }
    //crappy fix to glitches, if angle of ray is off dont use it
    var angle = limit(-Math.atan2(bx - px, by - py) + Math.PI/2);

    if (Math.abs(angleDifference(angle * 180/Math.PI, pa * 180/Math.PI)) < 60){
      ctx.beginPath();
      ctx.moveTo(px + 5, py + 5);
      ctx.lineTo(bx, by);
      ctx.stroke();
      //Draw the walls for 3d
      var ca = limit(pa - ra);
      fdist = fdist * Math.cos(ca);
      var lineH = (mapS * 800)/fdist;
      lineH = Math.min(lineH, 800);
      ctx1.fillRect(x * 800/60, 400 - lineH/2, 800/60 + 0.5, lineH);
    }
 }
}
init();
function render()
{
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx1.fillStyle = "blue";
    ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
    ctx1.fillStyle = "#3b7bb8";
    ctx1.fillRect(0, canvas1.width/2, canvas1.width, canvas1.height);
    drawPlayer();
    drawWalls();
    drawRays();
    if (keys[87]){
      px += pdx;
      py += pdy;
    }
    if (keys[83]){
      px -= pdx;
      py -= pdy;
    }
    if (keys[65]){
      pa -= 0.05;
      if (pa < 0){
        pa = 2 * Math.PI
      }
      pdx = Math.cos(pa) * speed;
      pdy = Math.sin(pa) * speed;
    }
    if (keys[68]){
      pa += 0.05;
      if (pa >  2 * Math.PI){
        pa = 0
      }
      pdx = Math.cos(pa) * speed;
      pdy = Math.sin(pa) * speed;
    }
    if (world[Math.floor(mouseY/100) * mapX + Math.floor(mouseX/100)] == 1){
      ctx.fillStyle = "red";
    }
    else{
      ctx.fillStyle = "green";
    }
    if (mouseDown == 1){
      mouseDown = 0;
      world[Math.floor(mouseY/100) * mapX + Math.floor(mouseX/100)] += 1;
      if (world[Math.floor(mouseY/100) * mapX + Math.floor(mouseX/100)] === 2){
        world[Math.floor(mouseY/100) * mapX + Math.floor(mouseX/100)] = 0;
      }
    }
    ctx.fillRect(Math.floor(mouseX/100) * 100, Math.floor(mouseY/100) * 100, 100, 100);
    setTimeout(render, 10);
}


render();

;
