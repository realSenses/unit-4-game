//character object constructor
function Character(healthPoints, attackPower, counterAttackPower, name, anthem){
	this.hp = healthPoints;
	this.ap = attackPower;
	this.cap = counterAttackPower;
	this.name = name;
	this.anthem = anthem;
	this.baseAp = attackPower;
	this.enemy;

	this.attack = function(){
		var power = this.ap;
		if (this.enemy) {
			power = this.cap;
		} else {
			// hero's ap grows each turn
			this.ap += this.baseAp;
		}
		return power;
	}

	this.takeDamage = function(damage){
		this.hp -= damage;
		return this.hp;
	}
}

//global variables
var numOfEnemies = 12;
var characters = [];
var hero;
var opponent;
var waitingForClick = true;
var enemiesDefeated = 0;
var sounds = [];

// *** Functions *** //

// game initialize
function gameInit(){
	// create the html elements
	for (var i = 0; i < numOfEnemies; i++) {
		// pick a random character from the library
		var random = getFromLibrary();
		// instantiate the character object
		var newChar = new Character(charLibrary[random].health, charLibrary[random].attack, charLibrary[random].counterAttack, charLibrary[random].name, charLibrary[random].anthem);
		characters.push(newChar);
		// generate new html element
		var characterElement = $("#enemies .character#blank").clone().prop("id", "char"+i)
			.appendTo("#enemies .charContainer");
		characterElement.find(".name").text(newChar.name);
		characterElement.find(".portrait").html("<img src='"+charLibrary[random].image+"'' alt='"+newChar.name+"'>");
		characterElement.find(".anthem").html(charLibrary[random].anthem);
		characterElement.data({
			char:i, 
			ap: newChar.hp, 
			hp: newChar.hp, 
			cap: newChar.cap 
		});
	}
	// remove blank character html
	$("#enemies .character#blank").remove();

	// set click events
	$(".character").on("click", function(){
		// make this char the hero
		hero = $(this).data("char");
		showMessage("Now click to choose your first opponent to battle. <br> Your attack gets stronger each time you use it. But choose the order of your opponents wisely.", true);
		// reassign click events on non-hero characters
		$(".character").off("click").on("click", function(){
			setOpponent($(this).data("char"));
		});
		// set the enemy boolean on character objects
		for (var i = 0; i < characters.length; i++) {
			if (i === hero){
				characters[i].enemy = false;
				$(this).attr("class","character").detach().appendTo("#hero .charContainer").off("click");

			} else {
				characters[i].enemy = true;
			}
		}
	});
	$("#newGame").on("click", function() {
	    location.reload(false);
	}).hide();
	$("#attack").on("click", doFight);

	showStats();

	// set up sound effects
	sounds[0] = new Audio("assets/sounds/attack.wav");
	sounds[1] = new Audio("assets/sounds/cheer.wav");
	sounds[2] = new Audio("assets/sounds/tie.wav");
	sounds[3] = new Audio("assets/sounds/dead.wav");
	
}

function getFromLibrary(){
	// returns the index of a random character from the library
	var index = Math.floor(Math.random()*charLibrary.length);
	// check to see if this character is already in play
	while (charLibrary[index].inPlay === true){
		// try again
		index = Math.floor(Math.random()*charLibrary.length);
	}
	charLibrary[index].inPlay = true;
	return index
}

function setOpponent(charId){
	if (waitingForClick){
		opponent = charId;
		// stops player from clicking on more than one opponent
		waitingForClick = false;
		$("#enemies #char"+charId).attr("class", "character" ).detach().appendTo("#opponent .charContainer").off("click");
		$("#attack").show();
		showMessage("Click attack to begin the battle.", true, false);
	}
}

function doFight(){
	if(opponent === false){
		showMessage("You must choose a character and an opponent.", false);
	} else {
		showMessage(characters[hero].name + " and " + characters[opponent].name + " are clashing beats!", true);
		sounds[0].play();
		characters[hero].takeDamage(characters[opponent].attack());
		characters[opponent].takeDamage(characters[hero].attack());
		showStats();
		//check to see if this fight is over
		if(characters[hero].hp <= 0 && characters[opponent].hp <= 0){
			fightOver("tie");
		} else {
			if (characters[opponent].hp <= 0){
				fightOver(hero);
			} 
			if (characters[hero].hp <= 0){
				fightOver(opponent);
			}
		}
	}
}
function showStats(){
	// prints out stats for all characters
	for (var i = 0; i < characters.length; i++) {
		var statsHtml = "<div class='stat'>HP: " + characters[i].hp + "</div>";
		statsHtml += "<div class='stat'>AP: " + characters[i].ap + "</div>";
		statsHtml += "<div class='stat'>CAP: " + characters[i].cap + "</div>";
		$(".character#char" + i + " .stats").html(statsHtml);
	}
}
function showMessage(text, clearPrev, cssClass){
	// prints out the the #message html element
	if(clearPrev) {
		$("#message .msgText").empty();
	}
	if (cssClass === false){
		$("#message").removeClass().find(".msgText").append(text);
	} else {
		$("#message").addClass(cssClass).find(".msgText").append(text);
	}
}
function fightOver(winner){
	showMessage(winner + " wins!", true);
	if (winner === "tie") {
		showMessage("You and " + characters[opponent].name + " destroyed each other at the same time.", true, "loseMsg");
		gameOver("lose");
		sounds[2].play();
		$("#newGame").show();
	} else if (winner === hero) {
		showMessage("You destroyed "+ characters[opponent].name, true, "winMsg");
		enemiesDefeated++;
		sounds[1].play();
	} else if (winner === opponent) {
		showMessage(characters[opponent].name + " destroyed you.", true, "loseMsg");
		gameOver("lose");
		sounds[3].play();
		
	}
	if (enemiesDefeated === characters.length-1){
		gameOver("win");
		showMessage(character.anthem)
	} else if (winner === hero){
		// game not over, prepare for next round
		
		showMessage("<br>Choose another opponent.", false);
		opponent = false;
		$("#opponent .charContainer").empty();
		$("#attack").hide();
		waitingForClick = true;
	}
}

function gameOver(result){
	var msgClass = result + "GameMsg";
	showMessage("<br>Game Over: You " + result + "!", false, msgClass);
	waitingForClick = false;
	$("#attack").hide();
	$("#controls #newGame").show();
}
$("document").ready(gameInit);