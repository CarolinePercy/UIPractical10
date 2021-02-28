// Each time this function is called a GameObject
// is create based on the arguments
// In JavaScript you can consider everything an Object
// including functions

// All variables under here
var canvas = document.getElementById("game"); // canvas to draw to
var context = canvas.getContext("2d"); // Allows the file to draw to canvas
var cheerSound = document.getElementById("Cheers"); // sound that plays when NPC and Player intersect
var buttonSound = document.getElementById("ButtonSound"); // sound that plays when NPC and Player intersect
var selectBox = document.getElementById('equipment');

var collision = false; // bool to keep track of whether the NPC and Player are currently colliding (stops sounds from repeating itself)
var facingRight = [true, true]; // keeps track of which direction the motorcycle is going

var fireFrames = 8; // How many frames
var bikeFrames = 3;
var initial = new Date().getTime();
var current; // current time
var xFrame = [0,0]; // holds the animation value along x axis for both Player and Npc
var yFrame = [0,0]; // holds animation value along y axis for Npc (players y axis value stays constant)


// Methods/Classes after

// GameObject (both NPC and Player)
function GameObject(img, x, y, width, height, scale)
{
    this.img = new Image();
    this.img.src = img;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

// The GamerInput is an Object that holds the Current
// GamerInput (Left, Right, Up, Down)
function GamerInput(input)
{
    this.action = input;
}

var gamerInput = new GamerInput("None"); //No Input
// Default GamerInput is set to None

var options = [{
    "text": "Select a Motorcyclist",
    "value": "None",
    "selected": true
  },
  {
    "text": "Black Motorcyclist",
    "value": "Black"
  },
  {
    "text": "White Motorcyclist",
    "value": "White"
  },
  {
    "text": "Red Motorcyclist",
    "value": "Red"
  }
];

var xmlhttp = new XMLHttpRequest();
var fireData;
var playerData;
var current_score;

// Gameobjects is a collection of the Actors within the game
// these objects are placeholder, they get updated in the onPageLoad
var gameobjects = [new GameObject("./favicon.ico", 0,0,0,0,0),
new GameObject("./favicon.ico", 100,100,100,0,0)];

function onPageLoad()
{
  xmlhttp.open("GET", "./data/level.json", true);
  xmlhttp.send();
  // Using JSON and Local Storage for
    // GameState Management
    var playerXPos = parseInt(localStorage.getItem('xPos'));
    var playerYPos = parseInt(localStorage.getItem('yPos'));

    xmlhttp.onreadystatechange = function ()
    {
      if (this.readyState == 4 && this.status == 200) // if response is ready and contents are "OK"
      {
        data = JSON.parse(this.responseText);
          fireData = data.fireRing;
          playerData = data.player;

          if (isNaN(playerXPos) || isNaN(playerYPos) || (playerXPos == 0 && playerYPos == 0) )
          {
            localStorage.setItem('xPos', parseInt(playerData.position.x));
            localStorage.setItem('yPos', parseInt(playerData.position.y));
            playerXPos = parseInt(localStorage.getItem('xPos'));
            playerYPos = parseInt(localStorage.getItem('yPos'))
          }

          gameobjects[0] = new GameObject(playerData.image, playerXPos, playerYPos,
          playerData.size.x, playerData.size.y, playerData.size.scale);

          gameobjects[1] = new GameObject(fireData.image, fireData.position.x, fireData.position.y,
          fireData.size.x, fireData.size.y, fireData.size.scale);
      }
    };

    current_score = localStorage.getItem('score');

      if (isNaN(current_score) || current_score == null)
      {
        localStorage.setItem('score', 0);
        current_score = localStorage.getItem('score');
      }

      document.getElementById("score").innerHTML = " [ " + current_score + " ] ";
}

function updateScore()
{
  current_score = localStorage.getItem('score');



    if (isNaN(current_score))
    {
      localStorage.setItem('score', 0);
    }
     else
    {
      localStorage.setItem('score', parseInt(current_score) + 1);
      current_score = localStorage.getItem('score');
    }

    document.getElementById("score").innerHTML = " [ " + current_score + " ] ";

}

// Process keyboard input event
function input(e)
{
          if (!buttonSound.paused)
          {
            buttonSound.currentTime = 0;
          }
          buttonSound.play();

          gamerInput = new GamerInput(e);

          if (gamerInput.action != "None")
          {
            updateScore();
          }

          updatePlayerStorage();

}

function switchingRiders()
{
  var temp = document.getElementById("equipment").value;

  if (temp === "None")
  {
     yFrame[0] = 0;
  }

  else if (temp === "Black")
  {
       yFrame[0] = 96;
  }

  else if (temp === "White")
  {
         yFrame[0] = 192;
  }

  else
  {
         yFrame[0] = 288;
  }
}

function update()
{
      if (gamerInput.action === "Left") // if user is pressing left, move player that way and flip image
      {
        gameobjects[0].x -= 1;
        facingRight[0] = false;
      }

      if (gamerInput.action === "Right") // else if user is pressing right, move right and make image back to how it originally was
      {
        gameobjects[0].x += 1;
        facingRight[0] = true;
      }

      if (gamerInput.action === "Up")
      {
        gameobjects[0].y -= 1;
      }

      if (gamerInput.action === "Down")
      {
        gameobjects[0].y += 1;
      }

      //gamerInput = new GamerInput("None");

      // Bools to just make the maths look a bit nicer / easier to read
      var npcTopRight =  gameobjects[1].x + gameobjects[1].width;
      var playerTopRight =  gameobjects[0].x + gameobjects[0].width;
      var npcBottomLeft =  gameobjects[1].y + gameobjects[1].height;
      var playerBottomLeft =  gameobjects[0].y + gameobjects[0].height;

      // Checks if the two objects intersect eachother
      if (gameobjects[0].x < npcTopRight && playerTopRight > gameobjects[1].x
        && gameobjects[0].y < npcBottomLeft && playerBottomLeft > gameobjects[1].y)
      {
      //  console.log("collide!");
          if (!collision) // if the objects were not in collision last frame
          {
            cheerSound.play();
            collision = true;
          }
      }
      else // if they didnt collide, let the collision variable go to false so when they do collide, noise is allowed to be played
      {
      //  console.clear();
        collision = false;
    //    console.log("miss!");
      }

      switchingRiders();
}

// Draw GameObjects to Console
// Modify to Draw to Screen
function draw()
{
    animate(); // draws both objects to canvas
}

function animate()
{
  current = new Date().getTime(); // update current
  context.clearRect(0, 0, canvas.width, canvas.height); // clear canvas of previous frame

    if (current - initial >= 100) // check is greater that 500 ms
    {
      initial = current; // reset initial

        xFrame[1] = (xFrame[1] + 1) % fireFrames; // update npc frame
        xFrame[0] = (xFrame[0] + 1) % bikeFrames; // update player frame

        if (xFrame[1] == 0) // if NPC frame is back to 0 after looping around, its y goes down by 1
        {
          yFrame[1] += gameobjects[1].img.height / fireFrames;
        }

        if (xFrame[1] == 4 && yFrame[1] == 350) // resets the frames once they reach the end of the sprite sheet
        {
          xFrame[1] = 0;
          yFrame[1] = 0;
        }
    }



    if (!facingRight[0]) // if the player is facing left, show sprite to match
    {
      context.translate(gameobjects[0].x+gameobjects[0].img.width - 200, gameobjects[0].y);
      context.scale(-1,1);

      context.drawImage(gameobjects[0].img, (gameobjects[0].img.width / 3) * xFrame[0], yFrame[0], gameobjects[0].width,
      gameobjects[0].height, 0, 0, 97, 93);

      context.setTransform(1,0,0,1,0,0);
    }

    else // let the object face right
     {
       context.drawImage(gameobjects[0].img, (gameobjects[0].img.width / 3) * xFrame[0], yFrame[0], gameobjects[0].width,
        gameobjects[0].height, gameobjects[0].x, gameobjects[0].y, 97, 93);
    }

    if (!facingRight[1])
    {
      context.translate(gameobjects[1].x+gameobjects[0].img.width - 240, gameobjects[1].y);
      context.scale(-1,1);

      context.drawImage(gameobjects[1].img, (gameobjects[1].img.width / 8) * xFrame[1], yFrame[1], gameobjects[1].width,
      gameobjects[1].height, 0, 0, 50, 50);

      context.setTransform(1,0,0,1,0,0);
    }

    else // let the object face right
     {
       context.drawImage(gameobjects[1].img, (gameobjects[1].img.width / 8) * xFrame[1], yFrame[1], gameobjects[1].width,
        gameobjects[1].height, gameobjects[1].x, gameobjects[1].y, 50, 50);
    }
}

function updatePlayerStorage()
{
  localStorage.setItem('xPos', parseInt(gameobjects[0].x));
  localStorage.setItem('yPos', parseInt(gameobjects[0].y));

  //console.log(localStorage.getItem('xPos'));
}

// Gameloop that is forever gone through until program closes
function gameloop()
{
    update();
    draw();
    window.requestAnimationFrame(gameloop);
}

function riderSelect() {
  var selection = document.getElementById("equipment").value;
  var active = document.getElementById("active");
  if (active.checked == true) {
    document.getElementById("HUD").innerHTML = selection + " active ";
  //  console.log("Weapon Active");
  } else {
    document.getElementById("HUD").innerHTML = selection + " selected ";
  //  console.log("Weapon Selected");
  }
}

function mirrorFire()
{
  facingRight[1] = !facingRight[1];
}

for (var i = 0; i < options.length; i++) {
  var option = options[i];
  selectBox.options.add(new Option(option.text, option.value, option.selected));
}
// Handle Active Browser Tag Animation
window.requestAnimationFrame(gameloop);
// Handle Keypressed
window.addEventListener('keyup', input);
//button.addEventListener("onclick", input);
