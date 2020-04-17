var suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
var values = ["2", "4", "5", "8", "10", "J", "Q", "K", "A"];
var roles =["good guy", "good guy", "good guy", "good guy", "terrorist", "terrorist"]
var deck = new Array();
var players = new Array();
var currentPlayer = 0;
var gameReady=false;

var cardsFlipped=0;
var roundNumber=0;
var numPlayers=6

var numDefused=0;
var bombFlipped=false;



// Durstenfeld shuffle 
function shuffleArray(array) {
	for (var k=7; k>0; k--){
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	}
}

function createDeck()
{
    deck = new Array();
    for (var i = 0 ; i < values.length; i++)
    {
        for(var x = 0; x < suits.length; x++)
        {

        	var type = '';
        	if ((values[i] == "J" || values[i] == "Q" || values[i] == "K") && (suits[x] == "Hearts" || suits[x]== "Diamonds")){
        		type ="defuse";
        	} else if (suits[x]=="Clubs" && values[i]=="A"){
        		type="bomb";
        	} else {
        		type="normal";
        	}


            var card = { Value: values[i], Suit: suits[x], Flipped: false, Type:type, Id:suits[x]+values[i] };
            deck.push(card);
        }
    }
}

function addPlayer()
{
	// check if 6 players have already joined
	if (gameReady){
		alert('All players are already in');
	} else { 
		var name= document.getElementById('name').value;
		var role = roles[0];
		roles.splice(0,1);
		var hand = new Array();

		var player = {Name: name, Role:role, Hand: hand };
		players.push(player);
	    // players.push(name);
	    // var role = roles.shift;
	    document.getElementById('messages').innerHTML = '';
	    document.getElementById('messages').innerHTML = "You are a "+ role;
	    if (players.length==numPlayers){
	    	gameReady=true;
		}
	}


}


function createPlayersUI(){
    document.getElementById('players').innerHTML = '';

    for(var i = 0; i < players.length; i++)
    {
        var div_player = document.createElement('div');
        var div_playername = document.createElement('div');
        var div_hand = document.createElement('div');

        div_player.id = 'player_' + i;
        div_player.className = 'player';
        div_hand.id = 'hand_' + i;

        div_playername.innerHTML = "<h4>"+players[i].Name+"</h4>";
        div_player.appendChild(div_hand);
        div_player.appendChild(div_playername);

        document.getElementById('players').appendChild(div_player);
    }
}

function startGame(){
	if (gameReady){
		document.getElementById("userInformation").style.display = "none";
	    document.getElementById('btnStart').value = 'New Game';
	   	document.getElementById('btnStart').onClick = 'restartGame()';

	    document.getElementById("status").style.display="none";
	    // deal 6 cards to every player object
	    currentPlayer = 0;
	    createDeck();
	    startRound(roundNumber);
	    // document.getElementById('player_' + currentPlayer).classList.add('active');
   } else {
   		alert('Not enough players in game')
   }
}


function startRound(roundNum){
	roundNumber++;
	cardsFlipped=0;
	shuffleArray(deck);
	createPlayersUI();

    players.forEach(function(player){
        player.Hand = new Array();
    });

	dealHands(numPlayers-roundNum);

}

function dealHands(cardNumber)
{
    // alternate handing cards to each player
    // intially 6 cards each
    var deckIndex=0;
    for(var i = 0; i < cardNumber; i++)
    {
        for (var x = 0; x < players.length; x++)
        {
            var card = deck[deckIndex];
            deckIndex++;
            players[x].Hand.push(card);
            renderCard(card, x);
        }
    }

    // for now render playe 1's hand
    document.getElementById('hand').innerHTML='';
    renderHand(players[0]);

}

function renderCard(card, player)
{
    var hand = document.getElementById('hand_' + player);
    hand.appendChild(getUnflippedCard(card));
}

function renderHand(player)
{
    var myhand = document.getElementById('hand');
    var myCards = player.Hand;
    myCards.forEach(
    	function(card){
	    	myhand.appendChild(getFlippedCard(card));
	    });
}


function getUnflippedCard(card){
    var el = document.createElement('div');
    el.id=card.Id;
    el.className = 'unflippedcard';
    el.addEventListener('click', function(){ flipCard(card, el);}, false);
    return el;
}

function getFlippedCard(card){
    var el = document.createElement('div');
    el.id=card.Id+"_my_hand";
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
    el.innerHTML = '<b>'+card.Value+'</b>'+'<br/>' + icon;
    return el;
}


function flipCard(card, el)
{
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
    el.innerHTML = card.Value + '<br/>' + icon;

    cardsFlipped++;

    if (card.Type=="bomb"){
    	bombFlipped=true;
    } else if(card.Type=="defuse") {
    	numDefused++;
    }
	checkEndCondition()

	// remove the card that was flipped from deck
	for (var i=0; i<deck.length; i++){
		if (deck[i].Id==card.Id){
			deck.splice(i,1);
		}
	}

	if(cardsFlipped==numPlayers){
		startRound(roundNumber)
	}



    return el;
}

function checkEndCondition()
{
  
	if (bombFlipped){
		document.getElementById('endOfGameMessage').innerHTML = '<h2>The Terrorists Win!</h2>';
    	document.getElementById('endOfGameMessage').style.display = "inline-block";
	} else if (numDefused==numPlayers){
		document.getElementById('endOfGameMessage').innerHTML = '<h2>The Good Guys Win!</h2>';
    	document.getElementById('endOfGameMessage').style.display = "inline-block";
	}
}





window.addEventListener('load', function(){
		// randomize order of characters
	shuffleArray(roles); 
    // createDeck();
    // shuffleArray(deck);
});












