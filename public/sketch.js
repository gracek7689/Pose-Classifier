/* globals createCanvas textSize colorMode HSB noStroke color background 
mouseX mouseY width loadImage time height fill ellipse randomStart ballxVelocity ballyVelocity
text stroke select loadSound keyCode correctText ENTER line noStroke increment rect keyIsDown UP_ARROW DOWN_ARROW
second flippedVideo random, CENTER tmPose classifier ml5 vertex noFill mic triangle beginShape endShape point map LEFT_ARROW RIGHT_ARROW, backgroundColor 
collideCircleCircle textAlign image _collideDebug int score1, Clickable deltaTime score2 time p5 collideRectCircle io */
const modelURL = "https://teachablemachine.withgoogle.com/models/b0MKtGUkl/";
const checkpointURL = modelURL + "model.json"; // has a reference to the bin file (model weights)
const metadataURL = modelURL + "metadata.json"; // contains the text labels of your model and additional information
let socket = io.connect("https://pose-classifier.glitch.me/");

const flip = true; // whether to flip the webcam
let webcam, model, totalClasses, myCanvas, ctx;
let img_o, img_l, img_y, img_m, img_i, img_c, img_s, img_p;
let poseImg, poseImage;
let resetTime,
  myLevel,
  friendLevel,
  time,
  myScore,
  friendScore,
  gameIsOver,
  SP,
    seconds,
  levelChanged, myClick, myButtonRestart;
let poseClassifier, currentName, newPoses, newPosesDisplay, song, correctText;
var myButtonEasy;
var myButtonMedium;
var myButtonHard;
//let socket = io.connect("https://poses-classifier.glitch.me/");

// A function that loads the model from the checkpoint
async function load() {
  model = await tmPose.load(checkpointURL, metadataURL);
  totalClasses = model.getTotalClasses();
}

async function loadWebcam() {
  webcam = new tmPose.Webcam(450, 450, flip); // can change width and height
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loopWebcam);
}

async function setup() {
  myClick = false;
  levelChanged = false;
  gameIsOver = false;
  seconds = 30;
  myLevel = 1;
  friendLevel = 1;
  poseClassifier = new PoseClassifier(myLevel);
  resetTime = 0;
  time = seconds;
  // Scores
  myScore = 0;
  friendScore = 0;
  newPoses = false;
  newPosesDisplay = false;
  song = new Audio(
    "https://cdn.glitch.com/547b1685-0398-461b-85ba-6364c64e66cd%2FSuper%20Mario%20Bros.%20-%20Coin%20Sound%20Effect.mp3?v=1628173875338"
  );
  myButtonEasy = document.createElement("button");
  myButtonEasy.innerHTML = "easy";
  myButtonEasy.style.margin = "10px";
  myButtonEasy.onclick = function() {
    myLevel = 1;
    levelChanged = true;
    myClick = true;
    // checkLevel();
  };
  document.getElementById("levelButtons").appendChild(myButtonEasy);

  myButtonMedium = document.createElement("button");
  myButtonMedium.innerHTML = "medium";
  myButtonMedium.style.margin = "10px";
  myButtonMedium.onclick = function() {
    myLevel = 2;
    levelChanged = true;
    myClick = true;
    // checkLevel();
  };
  document.getElementById("levelButtons").appendChild(myButtonMedium);

  myButtonHard = document.createElement("button");
  myButtonHard.innerHTML = "hard";
  myButtonHard.style.margin = "10px";
  myButtonHard.onclick = function() {
    myLevel = 3;
    levelChanged = true;
    myClick = true;
    // checkLevel();
  };
  document.getElementById("levelButtons").appendChild(myButtonHard);
  
  myButtonRestart = document.createElement("button");
  myButtonRestart.innerHTML = "Restart";
  myButtonRestart.style.margin = "10px";
  myButtonRestart.onclick = async function() {
      myClick = false;
      levelChanged = false;
      gameIsOver = false;
      seconds = 10;
      myLevel = 1;
      friendLevel = 1;
      poseClassifier = new PoseClassifier(myLevel);
      resetTime = 0;
      time = seconds;
      // Scores
      myScore = 0;
      friendScore = 0;
      newPoses = false;
      newPosesDisplay = false;
      song = new Audio(
        "https://cdn.glitch.com/547b1685-0398-461b-85ba-6364c64e66cd%2FSuper%20Mario%20Bros.%20-%20Coin%20Sound%20Effect.mp3?v=1628173875338"
      );
  };
  document.getElementById("levelButtons").appendChild(myButtonRestart);

  img_o = loadImage(
    "https://cdn.glitch.com/304c2d72-d87c-4099-a04e-71f39914ea8f%2FScreenshot%202021-08-03%20at%208.20.35%20AM.png?v=1628004164900"
  );
  img_i = loadImage(
    "https://cdn.glitch.com/304c2d72-d87c-4099-a04e-71f39914ea8f%2FScreenshot%202021-08-03%20at%208.20.58%20AM.png?v=1628004170665"
  );
  img_y = loadImage(
    "https://cdn.glitch.com/304c2d72-d87c-4099-a04e-71f39914ea8f%2FScreenshot%202021-08-03%20at%208.20.07%20AM.png?v=1628004083198"
  );
  img_m = loadImage(
    "https://cdn.glitch.com/304c2d72-d87c-4099-a04e-71f39914ea8f%2FScreenshot%202021-08-04%20at%201.01.37%20AM.png?v=1628064132155"
  );
  img_p = loadImage(
    "https://cdn.glitch.com/304c2d72-d87c-4099-a04e-71f39914ea8f%2FScreenshot%202021-08-04%20at%201.01.24%20AM.png?v=1628064129862"
  );
  img_l = loadImage(
    "https://cdn.glitch.com/304c2d72-d87c-4099-a04e-71f39914ea8f%2FScreenshot%202021-08-04%20at%201.05.11%20AM.png?v=1628064328268"
  );
  img_c = loadImage(
    "https://cdn.glitch.com/304c2d72-d87c-4099-a04e-71f39914ea8f%2FScreenshot%202021-08-03%20at%208.20.22%20AM.png?v=1628004136254"
  );
  img_s = loadImage(
    "https://cdn.glitch.com/304c2d72-d87c-4099-a04e-71f39914ea8f%2FScreenshot%202021-08-04%20at%201.01.46%20AM.png?v=1628064135921"
  );

  myCanvas = createCanvas(600, 450);
  ctx = myCanvas.elt.getContext("2d");
  colorMode(HSB, 360, 100, 100);
  // Call the load function, wait until it finishes loading
  await load();
  await loadWebcam();

  socket.on("score", ({ score }) => {
    friendScore = score;
  });

  socket.on("level", ({ level }) => {
    if (!myClick) {
      if (myLevel !== level) {
        myLevel = level;
        levelChanged = true;
      }  
      myClick = false;
    }
  });
}

async function loopWebcam(timestamp) {
  webcam.update(); // update the webcam frame
  await predict(); //it waits for predict function to run before continuing
  window.requestAnimationFrame(loopWebcam);
}

async function predict() {
  // Prediction #1: run input through posenet
  // predict can take in an image, video or canvas html element
  const flipHorizontal = false;
  const { pose, posenetOutput } = await model.estimatePose(
    webcam.canvas,
    flipHorizontal
  );
  // Prediction 2: run input through teachable machine assification model
  const prediction = await model.predict(
    posenetOutput,
    flipHorizontal,
    totalClasses
  );

  // Sort prediction array by probability
  // So the first classname will have the highest probability
  const sortedPrediction = prediction.sort(
    (a, b) => -a.probability + b.probability
  );

  // Show the result
  const res = select("#res"); // select <span id="res">
  res.html(sortedPrediction[0].className);
  // Show the probability
  const prob = select("#prob"); // select <span id="prob">
  prob.html(sortedPrediction[0].probability.toFixed(2));
  SP = sortedPrediction[0].probability.toFixed(2);
  const scoreSpan = select("#myScore");
  scoreSpan.html(myScore);

  const friendScoreSpan = select("#friendScore");
  friendScoreSpan.html(friendScore);

  const timer = select("#timer");
  timer.html(time);

  let arr = poseClassifier.getCurrentPoseArray();
  const recreateSpan = select("#recreate1");
  const recreateSpan2 = select("#recreate2");
  const recreateSpan3 = select("#recreate3");

  if (arr.length == 1) {
    let posee = arr[0];

    //const recreateSpan = select("#recreate1");
    recreateSpan.html(posee[1]);
    recreateSpan2.html("");
    recreateSpan3.html("");
  } else if (arr.length == 2) {
    let posee = arr[0];
    //const recreateSpan = select("#recreate1");
    recreateSpan.html(posee[1] + ", ");
    posee = arr[1];
    recreateSpan2.html(posee[1]);
    recreateSpan3.html("");
  } else if (arr.length == 3) {
    let posee = arr[0];
    //const recreateSpan = select("#recreate1");
    recreateSpan.html(posee[1] + ", ");
    posee = arr[1];
    recreateSpan2.html(posee[1] + ", ");
    posee = arr[2];
    recreateSpan3.html(posee[1]);
  } else if (arr.length == 0) {
    recreateSpan.html("");
    recreateSpan2.html("");
    recreateSpan3.html("");
  }

  //poseClassifier.getCurrentPoseArray().forEach(pose => recreate.html(pose[1]));

  // const timer = select("#timer");
  //  timer.html(time);
  checkPose(sortedPrediction[0].className);
  draw();
}

function draw() {
  socket.emit("score", { score: myScore }); //emit is sending
  socket.emit("level", { level: myLevel });
  if (levelChanged) {
    checkLevel();
  }

  const timer = select("#timer");
  timer.html(time);

  // time -= deltaTime / 1000;
  background("lightgrey");
  // myButtonEasy.draw();
  // myButtonMedium.draw();
  //myButtonHard.draw();

  // if (friendLevel !== myLevel) {
  //   myLevel = friendLevel;
  //   checkLevel();
  // }
  if (time <= 0) {
    gameIsOver = true;
  }
  // console.log(time);
  if (!gameIsOver) {
    // time -= deltaTime / 1000;

    textSize(50);
    setTimeout(function() {
      poseClassifier.getNewPoses();
    }, 5000);
    //poseClassifier.checkPose(currentName);
    // complete = poseClassifier.getCurrentPoseArray().length;

    if (webcam.canvas) {
      ctx.drawImage(webcam.canvas, 0, 0);
      // draw the keypoints and skeleton

      // TODO: FIX DOTS
      // if (pose) {
      //   const minPartConfidence = 0.5;
      //   tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      //   tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
      // }
    } // end of if
    if (newPosesDisplay) {
      let mainarr = poseClassifier.getCurrentPoseArray();
      for (let i = 0; i < mainarr.length; i++) {
        let arr = mainarr[i];
        image(arr[0], width - 150, 0 + i * 150, 150, 150);
      } // end of for
      setTimeout(function() {
        hideImage();
      }, 5000);
    }

    if (correctText) {
      textSize(50);
      textAlign(CENTER);
      text("Good Job! Next set!", width / 2, height - 30);
      setTimeout(function() {
        correctText = false;
      }, 1000);
    }
  } else {
    textSize(35);
    textAlign(CENTER);
    background("#ffffbf");
    if (myScore > friendScore) {
      text(`You win with a score of ${myScore}`, width / 2, height / 2);
    } else if (friendScore > myScore) {
      text(
        `Your friend wins with a score of ${friendScore}`,
        width / 2,
        height / 2
      );
    } else {
      text(`IT'S A TIE`, width / 2, height / 2);
    }
  }
} //end of draw function

function getTimer() {
  if (time > 0) {
    time--;
  }
}

function checkLevel() {
  myScore = 0;
  friendScore = 0;
  time = seconds;
  newPoses = true;
  setInterval(getTimer, 1000);
  myButtonEasy.className = "not-clicked";
  myButtonMedium.className = "not-clicked";
  myButtonHard.className = "not-clicked";
  if (myLevel === 1) {
    myButtonEasy.className = "clicked";
    select("#currentLevel").html("Easy");
    // alert("Easy Level!");
  } else if (myLevel === 2) {
    myButtonMedium.className = "clicked";
    select("#currentLevel").html("Medium");
    // alert("Medium Level!");
  } else if (myLevel === 3) {
    myButtonHard.className = "clicked";
    select("#currentLevel").html("Hard");
    // alert("Hard Level!");
  }

  levelChanged = false;
}
function getPose() {
  poseImg = [
    [img_o, "opose"],
    [img_l, "L pose"],
    [img_y, "y pose"],
    [img_m, "m pose"],
    [img_p, "p pose"],
    [img_i, "l pose"],
    [img_c, "c pose"],
    [img_s, "s pose"]
  ];
  return random(poseImg);
}

function hideImage() {
  newPosesDisplay = false;
}

class PoseClassifier {
  constructor(level) {
    this.level = level;
    this.currentPose = [];
    this.showPoseImage = false;
    for (let i = 0; i < level; i++) {
      this.currentPose.push(getPose());
    }
    //console.log(this.currentPose);
  }
  timetoSplice(index) {
    this.currentPose.splice(index, 1);
  }
  getCurrentPoseArray() {
    return this.currentPose;
  }

  getNewPoses() {
    if (newPoses) {
      this.currentPose = [];
      for (let i = 0; i < myLevel; i++) {
        this.currentPose.push(getPose());
      }
      newPoses = false;
      newPosesDisplay = true;
    } //end of if
  } //end of getNewPoses
} //end of class.

function checkPose(userPose) {
  let PC = poseClassifier.getCurrentPoseArray();
  for (let i = 0; i < PC.length; i++) {
    let arr = PC[i];

    if (userPose === arr[1] && SP == 1) {
      poseClassifier.timetoSplice(i);
    }
  } //end of for
  if (PC.length === 0) {
    myScore++;
    correctText = true;
    newPoses = true;

    poseClassifier.getNewPoses();

    song.play();
  }
} //end of display method
