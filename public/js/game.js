

//Sounds
let open_vault = new Audio("sounds/open_vault.wav");
let perfect = new Audio("sounds/perfect_answer.wav");
let great = new Audio("sounds/great_answer.wav");
let wrong = new Audio("sounds/wrong_answer.wav");
let timeout = new Audio("sounds/timeout_answer.wav");
let timer = new Audio("sounds/timer.wav");
let answer_hover = new Audio("sounds/answer_hover.wav");



//First part of API url used for trivia database
let url = "https://triviaapi.onrender.com/randomQuestion/";
let levelSelected = "Blue"; //Parameter to end of API url



//Arrays with game info
let vaults = ["Blue", "Green", "Red", "Yellow", "Purple"];
let categories = ["Art", "Books", "Geography"];



//Game modes and settings
let aceMode = false;
let randomMode = false;
let timeLimit = 25000;
let perfectLimit = 2500;
let greatLimit = 7000;
let liveQuestionFlag = false; //Flag for if question is currently running - certain things disabled when question is live



//Base trivia view
let divClone = $("#trivia").clone();





//Initial game page state
$("#trivia").hide();






/*
 * Listener for random play game mode: select a level, get a random question from that level
 * Hides game and loads the game options to select before starting
 *
 */
$(".random-play-link").click(function(){

  $("#trivia").hide();
  $("#result-screen").hide();
  $("#question-screen").hide();
  $(".choices").hide();

  $("#game-selection").show();
});





/*
 * Listeners for vault images used in game selection section
 * Sets the vault level and loads first question
 *
 */
$(".vault-img").click(function(){

  //Live question flag prevents clicks from triggering new question before current question has been completed
  if( liveQuestionFlag == true )
    return;
  liveQuestionFlag = true;

  //Resets the question screen to prepare to load initial question
  resetScreen();

  open_vault.play();

  //Get vault level, game modes from clicks
  levelSelected = $(this).attr("alt");
  aceMode = false;

  if( levelSelected == "Random" ){
    randomMode = true;
    levelSelected = vaults[ Math.floor(Math.random()*5) ];
  }
  else
    randomMode = false;


  if( levelSelected == "Purple" )
    aceMode = true;
  else
    aceMode = false;


  setTimeout(function(){

    loadQuestion( levelSelected, aceMode, randomMode );
  }, 3000);

});





/*
 * Picks a question random from the database based on vault level and category
 * Uses fetch API and supplied API url
 *
 */
async function getTrivia( level ){

  const response = await fetch(url + level).catch(err => console.log('Request Failed', err));
  const jsonResult = await response.json();

  return jsonResult[0];
}



/*
 * Loads the question and starts the timer
 * Serves the question on the game screen based on inputs
 *
 */
async function loadQuestion( levelSelected, aceMode, randomMode ){

  liveQuestionFlag = true;

  if( randomMode == true )
    levelSelected = vaults[ Math.floor(Math.random()*5) ];

  let qna = await getTrivia(levelSelected);

  //Results of API query using getTrivia function
  let category = qna.category;
  let question = qna.question;
  let answer = qna.answer;
  let choices = randomizeAnswerOrder(JSON.parse(qna.choices));


  //Show question timer and question
  $(".timer-front").css("background-color", levelSelected);   //Set color of timer, choice button press
  $("#question-screen").show();
  $(".timer").show();
  $(".prompt").html( question );
  $(".category").html( category );

  //Set color when choice is selected based on level
  let c = "linear-gradient("+levelSelected.toLowerCase()+","+levelSelected.toLowerCase()+")";
  $(".choice-btn").css("background-image", c);


  //Start timer and show answer choices
  setTimeout( function(){

    startTimer( aceMode, answer );

    $("#choice1").html( choices[0] );
    $("#choice2").html( choices[1] );
    $("#choice3").html( choices[2] );
    $("#choice4").html( choices[3] );
    $(".choices").show();
  }, 2000 );
}



/*
 * Starts question timer and sets up listeners for choices
 *
 */
function startTimer( aceMode, answer ){

  let timeLeft = timeLimit; //25000 for standard question

  if( aceMode == true )
    timeLeft = timeLimit/10;

  let timerStart = new Date();

  timer.play();

  //Animates timer of duration timeLeft from full to 0 width, loads the result screen if animation ends (user timeout)
  $(".timer-front").animate(
    {
      width: 0
    },
    timeLeft,
    function(){

      timer.pause();
      timer.currentTime = 0;

      $(".timer-front").removeAttr('style');  //reset timer
      loadResult("Timeout");
    }
  );

  //Highlight choice on hover
  $(".choice-btn").mouseenter( function(){  answer_hover.play();  });

  //Go to result screen on click
  $(".choice-btn").click( function(){

    //Stop sounds and animation
    timer.pause();
    timer.currentTime = 0;
    $(".timer-front").stop();

    //Get clicked value and time elapsed
    let clickedAnswer = $(this).html();
    let elapsed = new Date() - timerStart;

    //Check clicked with answers
    if( clickedAnswer != answer )
      loadResult("Wrong");
    else
      loadResult( calculateScore(elapsed) );

  });

}



/*
 * View update mathod that loads result screen when answered or timeout
 * Adds listeners to result screen so next question can be asked
 *
 * Takes string that indicates result of question
 */
function loadResult( res ){

    if( res == "Timeout" ){

      $(".score").html("Sorry, you timed out");
      $(".score-img").attr("src", "images/wrong-timeout.png");
    }
    if( res == "Wrong" ){

      $(".score").html("Sorry, wrong answer");
      $(".score-img").attr("src", "images/wrong-timeout.png");
    }
    else
      $(".score").html(res);

    playSound(res);

    //Change question screen to result screen
    $("#question-screen").hide();
    $("#result-screen").show();

    liveQuestionFlag = false; //Change indicator so that new question can be loaded

    //Add on click continue button that resets screen and loads next question
    $(".continue-btn").on("click", function(){

      resetScreen();

      loadQuestion( levelSelected, aceMode, randomMode );
    });
}



/*
 * Resets the game screen in preparation for new question
 *
 */
function resetScreen(){

  $("#trivia").replaceWith(divClone.clone());
  $("#trivia").show();

  $("#result-screen").hide();
  $("#question-screen").hide();
  $(".choices").hide();

  $("choice-btn").html();
  $(".timer-front").removeAttr('style');
}





/*
 * Support functions
 *
 */
//Checks if answer is correct and calculates what to display on the result screen
function calculateScore( timeElapsed ){

 if( timeElapsed < perfectLimit )
   return "Perfect";
 else if( timeElapsed >= perfectLimit && timeElapsed < greatLimit )
   return "Great";
 else
   return "Good";
}



//Shuffler
function randomizeAnswerOrder( array ){

    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}



//Selects and plays result sound
function playSound( result ){

  switch(result){

    case "Perfect":
      perfect.play();
      break;
    case "Great":
    case "Good":
      great.play();
      break;
    case "Wrong":
      wrong.play();
      break;
    case "Timeout":
      timeout.play();
      break;
    default:
      break;
  }
}
