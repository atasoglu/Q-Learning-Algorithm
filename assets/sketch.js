var scl = 40;
var box1;
var box2;
var traps;
var cols, rows;
var tableSize;
var rTable;
var qTable;
var currentState = 0;
var nextState;
const reward = 100;
const noReward = 0;
const gamma = 0.8;
var start = false;
var genBoard = document.getElementById("gen-board");
var gen = 1;

function setup() {
  var myCanvas = createCanvas(400, 400);
  myCanvas.parent("container");
  frameRate(30);
  box1 = new Box1();
  box2 = new Box2();
  traps = new Array();
  setTables();
}

function mousePressed() {
  if (!start) {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height ) {
      var tX = mouseX - mouseX%scl;
      var tY = mouseY - mouseY%scl;
      if ((tX == box1.x && tY == box1.y) || (tX == box2.x && tY == box2.y)) {
        console.log("lütfen başka bir yer seçin!");
      }
      else traps.push(new Trap(tX, tY));
    }
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
    start = true;
    document.getElementById("info").innerHTML = "<b>BACKSPACE</b> to start from origin.";
    genBoard.innerHTML = "<b>Generation: " + gen + "</b>";
  }
  else if (keyCode === BACKSPACE) {
    currentState = 0;
    box1.x = 0;
    box1.y = 0;
  }
}

function draw() {
  background(220);
  box2.show();
  box1.show();
  for (var i=0;i<traps.length;i++) { // showing traps
    traps[i].show();
  }
  if (box1.x == box2.x && box1.y == box2.y) {
    box1.x = round(random(0, cols))*scl;
    box1.y = round(random(0, rows))*scl;
    gen++;
    genBoard.innerHTML = "<b>Generation: " + gen + "</b>";
  }
  if (start) {
    var dir = scanPaths(box1.x, box1.y);
    // Calculating...
    // qTable[currentState][nextState] 
    var maxQ = 0;
    for (var i=0;i<dir.length;i++) {
      var tempQ = rTable[currentState][dir[i]] + 
      round(gamma * Math.max.apply(null, qTable[dir[i]]));
      qTable[currentState][dir[i]] = tempQ;
      if (tempQ > maxQ) {
        maxQ = tempQ;
        nextState = dir[i];
      }
    }
    if (maxQ == 0) nextState = random(dir);
    var colNum = nextState % cols;
    var rowNum = (nextState-colNum) / rows;
    // End Calculating!
    box1.move(colNum*scl, rowNum*scl);
    currentState = nextState;
  }
}

// onchange function
function setDifficulty(dif) {
  if (dif == 0) scl = 50;
  else if (dif == 1) scl = 40;
  else if (dif == 2) scl = 20;
  box1 = new Box1();
  box2 = new Box2();
  box1.x = 0;
  box1.y = 0;
  currentState = 0;
  nextState = null;
  traps = new Array();
  setTables();
  start = false;
  genBoard.innerHTML = "<b>Generation: 0</b>";
  gen = 1;
  document.getElementById("info").innerHTML = "<b>ENTER</b> to start.";
}  
// onchange function

function setTables() {
  qTable = new Array();
  rTable = new Array();
  var paths = new Array();
  var state = 0; // current state
  cols = width/scl;
  rows = height/scl;
  tableSize = cols*rows;
  for (var i=0;i<tableSize;i++) {
    rTable.push(new Array(tableSize));
    qTable.push(new Array(tableSize));
  }
  for (var j=0;j<tableSize;j++) {
    for (var k=0;k<tableSize;k++) {
      rTable[j][k] = -1;
      qTable[j][k] = noReward;
    }
  }
  for (var i=0;i<rows;i++) {
    for (var j=0;j<cols;j++) {
      paths = scanPaths(i*scl, j*scl);
      for (var k=0;k<paths.length;k++) {
        action = paths[k];
        if (action == tableSize-1) rTable[state][action] = reward;
        else rTable[state][action] = noReward;
      }
      state++;
    }
  }
}

function scanPaths(x, y) {
  var pathsWithCoord = new Array();
  var pathsWithState = new Array();
  for (var i=-1;i<2;i++) {
    var colSpan = scl * i;
    for (var j=-1;j<2;j++) {
      var rowSpan = scl * j;
      if (colSpan == 0 && rowSpan == 0) continue;
      pathsWithCoord.push([colSpan+x, rowSpan+y]);
    }
  }
  // cleaning paths with traps...
   for (var i=0;i<traps.length;i++) {
      for (var j=0;j<pathsWithCoord.length;j++) {
        if (pathsWithCoord[j][0] == traps[i].x && pathsWithCoord[j][1] == traps[i].y) {
          pathsWithCoord.splice(j, 1);
          break;
        }
      }
    }

  // cleaning end!
  // coordinates to state
  for (var i=0;i<pathsWithCoord.length;i++) {
    var colOrder = pathsWithCoord[i][0] / scl;
    var rowOrder = pathsWithCoord[i][1] / scl;
    if (rowOrder<0 || colOrder<0 || rowOrder > rows-1 || colOrder > cols-1) continue;
    pathsWithState.push(cols*rowOrder+colOrder);
  }
  return pathsWithState;
}

function Box1() {
  this.x = 0;
  this.y = 0;
  this.move = function(X, Y) {
    this.x = X;
    this.y = Y;
  }
  this.show = function() {
    fill(255,0,0);
    rect(this.x, this.y, scl, scl);
  }
}

function Box2() {
  this.x = width-scl;
  this.y = height-scl;
  this.show = function() {
    fill(0,0,255);
    rect(this.x, this.y, scl, scl);
  }
}

function Trap(_x, _y) {
  this.x = _x;
  this.y = _y;
  this.show = function() {
    fill(255,255,0);
    rect(this.x, this.y, scl, scl);
  }
}