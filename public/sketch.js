var balls = [[200,0,0,0,10]];//X,Y,VELX,VELY,r
function renderballs() {
  for(let i = 0; i < balls.length;i++) {
    fill(255,0,0)
    ellipse(balls[i][0],balls[i][1],balls[i][4])
    
  }
}
function updateballs() {
  for(let i = 0; i < balls.length;i++) {
    balls[i][0] += balls[i][2];
    balls[i][1] += balls[i][3]
    balls[i][2] = balls[i][2]*0.99
    balls[i][3] = balls[i][3]*0.99
  }
}
function addBall(x,y,velx,vely,r) {
  
}
function getBall(n) {
  return balls[n]
}
function setup() {
  let cnv = createCanvas(400, 400);
  cnv.parent('canvasdiv');
}

function draw() {
  handleKeys()
  background(255)
  //for(let i = 0; i<6;i+=0.1)
  //line(mouseX+cos(i)*10,mouseY+sin(i)*10,mouseX+cos(i-0.1)*10,mouseY+sin(i-0.1)*10)
  renderballs();
  updateballs()
  //fill(0,120,255)
  //rect(0,200,400,200)
  
  
}
function handleKeys() {
  if (keyIsDown(LEFT_ARROW)) {
   balls[0][2]-=0.01; 
  }
  if (keyIsDown(RIGHT_ARROW)) {
   balls[0][2]+=0.01; 
  }
  if (keyIsDown(DOWN_ARROW)) {
   balls[0][3]+=0.01; 
  }
  if (keyIsDown(UP_ARROW)) {
   balls[0][3]-=0.01; 
  }
  // Move diagonally.
}
function SpawnBall() {
  
}