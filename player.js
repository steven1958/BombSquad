// manage connection to server

var socket = io.connect('/', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: Infinity
  });
var players = new Array();
var thisPlayer;
var active=true;

$('#form1').submit(function(e){
  e.preventDefault(); // prevents page reloading
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

socket.on('chat message', function(userMessage){
	console.log(userMessage);
  $('#start-messages').append($('<div>').text(userMessage));
});

socket.on('onconnected', function(data){
	console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.id );
});

socket.on("newGame", function(){
	$('#userInformation').show();
	$("#newGameButton").hide();
	$("#currentGame").show();
	$("#start-messages").show();
	$('#start-messages').empty();
	$('#players').empty();
	$('#hand').empty();
	$('#restartGame').hide();

	$('#btnStart').show();

	thisPlayer="";
});

socket.on("serverStartGame", function(data){
	console.log(document.cookie);
	if (data.Ready){
		active=true;

	    $('#start-messages').hide();
	    $('#btnStart').hide();
		$('#restartGame').show();

	   	players=data.Players;
	    createPlayersUI();
	    var currentPlayer=0;

// 		render each player's hand
	    players.forEach(function(plyr){
	    	plyr.Hand.forEach(function(card){
	    		renderCard(card, currentPlayer);
	    	})
	    	currentPlayer++;
	    })

	    // display currrent players hand at bottom of screen
	    players.forEach(function(p){
	    	if (p.Id===thisPlayer){
	    		renderHand(p);
	    	}
	    })

	} else {
		alert('Not enough players in game')
	}

});

socket.on("serverFlippedCard", function(card)
{
	var el = document.getElementById(card.Id);
	getFlippedCard(card, el);

});

socket.on("endGame", function(endCondition){
	if (endCondition=="goodGuysWin"){
		document.getElementById('endOfGameMessage').innerHTML = '<h2>The Good Guys Win!</h2>';
    	document.getElementById('endOfGameMessage').style.display = "inline-block";
	} else {
		document.getElementById('endOfGameMessage').innerHTML = '<h2>The Terrorists Win!</h2>';
    	document.getElementById('endOfGameMessage').style.display = "inline-block";
	}
});

socket.on("showStartRoundButton", function(){
	active=false;
	$("#btnNextRound").show();
});

$('#addPlayer').click(function(){

	var name= $('#name').val();

	socket.emit('storeClientInfo', { customId:name });


	socket.on('serverAddPlayer', function(response){
		console.log("server added player");
		thisPlayer=response.Id;
		// on "game full" display message saying all players in
		if (response.GameFull){
			alert('All players are already in');

		// otherwise let them join game and switch to waiting screen
		} else {

			var role = response.Role;

		    $('#start-messages').append($('<h2>').text("You are a "+ role));
		    $('#start-messages').append($('<h4>').text("Waiting for Players to Join"));

		    $('#userInformation').hide();
		}
	});
	
});


$("#btnStart").click(function(){
	// console.log("Start game");
	socket.emit("startRound", "start");
});

$("#btnNextRound").click(function(){
	$("#btnNextRound").hide();
	// console.log("Start next round");
	socket.emit("startRound", "start");
});

$(".btnNewGame").click(function(){
	// console.log("starting new game");
	socket.emit("createNewGame", false);
});

$("#restartGame").click(function(){
	// console.log("starting new game");
	socket.emit("createNewGame", true);
});


function createPlayersUI(){
    $('#players').empty();

    for(var i = 0; i < players.length; i++){
        var div_player = document.createElement('div');
        var div_playername = document.createElement('div');
        var div_hand = document.createElement('div');

        div_player.id = 'player_' + i;
        div_player.className = 'player';
        div_hand.id = 'hand_' + i;

        div_playername.innerHTML = "<h4>"+players[i].Name+"</h4>";
        div_player.appendChild(div_hand);
        div_player.appendChild(div_playername);

        $('#players').append(div_player);
    }
}

function renderCard(card, player)
{
	var hand = document.getElementById('hand_' + player);

	if (card.Flipped){
	    // hand.appendChild(getFlippedCard(card));	
	} else {
	    hand.appendChild(getUnflippedCard(card));		
	}

}

function renderHand(player)
{
	$('#hand').empty();
    var myCards = player.Hand;
    myCards.forEach(
    	function(card){
    		var hand_el = document.createElement('div');
    		hand_el.id=card.Id+"_my_hand";
	    	$('#hand').append(getFlippedCard(card, hand_el));
	    });
}

function getUnflippedCard(card){
    var el = document.createElement('div');
    el.id=card.Id;
    el.className = 'unflippedcard';
    el.addEventListener('click', function(){ flipCard(card); }, false);
    return el;
}

function getFlippedCard(card, el){

    var icon = '';
    if (card.Suit == 'Hearts'){
   		icon='&hearts;';
		el.style.color = "#E42217";
    } else if (card.Suit == 'Spades'){
    	icon = '&spades;';
    }else if (card.Suit == 'Diamonds'){
    	icon = '&diams;';
    	el.style.color = "#E42217";

    } else {
    	icon = '&clubs;';
    }
    el.className = 'card';
    el.innerHTML = '';
    el.innerHTML = '<b>'+card.Value+'</b>'+'<br/>' + icon;
    return el;
}

function flipCard(card)
{
	if(active){	
   		socket.emit("cardFlipped", card);
	}
}



