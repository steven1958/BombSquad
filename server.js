// server side code

var suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
var values = ["2", "4", "5", "8", "10", "J", "Q", "K", "A"];
var roles =["good guy", "good guy", "good guy", "good guy", "terrorist", "terrorist"]

var deck = new Array();
var currentPlayer = 0;

var cardsFlipped=0;
var numPlayers=6
var roundNumber=0;

var numDefused=0;
var bombFlipped=false;

var gameReady=false;
var players = new Array();
var playerDictionary ={}; 


// SET UP SERVER-CLIENT CONNECTION

//based on: http://buildnewgames.com/real-time-multiplayer/
// establish express server 
var gameport = process.env.PORT || 3000;
var app = require('express')();
var http = require('http').createServer(app);
var uuid = require('uuid');
var io = require('socket.io')(http);
var verbose = false;
var clients =[];
var clientDictionary ={}; 

http.listen( gameport, function() {
	console.log('listening on *:3000')
});

console.log("connected on port " + gameport);
app.get( '/', function( req, res ){ 
    res.sendFile( __dirname + '/index.html' );
});


app.get('/*', function(req, res, next){
	var file=req.params[0];

    //For debugging, we can track what files are requested.
    if(verbose) console.log('\t :: Express :: file requested : ' + file);
	res.sendFile(__dirname + '/' +file);
});


io.sockets.on("connection", function(client){
	// create new uuid
	client.userid = uuid.v4();

	// tell player they connected, give id 
	client.emit('onconnected', {id : client.userid});
    console.log('\t socket.io:: player ' + client.userid + ' connected');

	client.on('chat message', function(msg){

    	io.emit('chat message', msg);
  	});

    client.on("disconnect", function(data){
    	console.log('\t socket.io:: client disconnected ' + client.userid );    
    	if (client.customId != undefined){
    		io.emit('chat message', client.customId + " left the game");
    	}


		for( var i=0, len=players.length; i<len; ++i ){
		    var p = players[i];

		    if(p.Id == client.userid){
		        players.splice(i,1);
		        break;
		    }
		}
		gameReady=false;
		numPlayers--;

    	delete playerDictionary[client.userid];



    });

	// store client info
    client.on('storeClientInfo', function (data) {

		// client.broadcast.emit('chat message', {message:'A new user joined:'+data.customId, id:data.customId});
		if (gameReady){

			client.emit('serverAddPlayer', {GameFull:true});

		} else {

			// randomize order of characters
			shuffleArray(roles);

			var name = data.customId;
			client.customId=name;
			var role = roles[0];
			roles.splice(0,1);

			var hand = new Array();
			var player = {Name: name, Role:role, Hand: hand, Id:client.userid};
			players.push(player);

			// map player to the client's server id
			playerDictionary[client.userid] = player;

		    if (players.length==numPlayers){
		    	createDeck();
		    	gameReady=true;
		    	client.broadcast.emit("chat message", "All Players In");
			}

			client.emit('serverAddPlayer', {GameFull:false, Role:role, Id:client.userid});

		}

    });


    client.on("startRound", function(data){

		if (gameReady){
		    startRound(roundNumber);
		    // document.getElementById('player_' + currentPlayer).classList.add('active');
		    io.emit('serverStartGame', {Ready:true, Players:players});
		    // console.log("players: "+players);

		    
	   } else {
	   		client.emit('serverStartGame', {Ready:false})
	   }

    });


	client.on("cardFlipped", function(card){

		cardsFlipped++;

	    if (card.Type=="bomb"){
	    	bombFlipped=true;
	    	io.emit("endGame", "terroristsWin");
	    } else if(card.Type=="defuse") {
	    	numDefused++;
	    	if (numDefused==6) io.emit("endGame", "goodGuysWin");
	    }

		// remove the card that was flipped from deck
		for (var i=0; i<deck.length; i++){
			if (deck[i].Id==card.Id){
				deck.splice(i,1);
			}
		}

		if(cardsFlipped==numPlayers){
			io.emit("showStartRoundButton");
		}	

		io.emit("serverFlippedCard", card);	    	

	});


});



// GAME LOGIC Functions


// Durstenfeld shuffle 
function shuffleArray(array) {
	for (var k=5; k>0; k--){
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


function startRound(roundNum){
	cardsFlipped=0;
	// console.log("cards flipped: "+cardsFlipped);
	shuffleArray(deck);

    players.forEach(function(player){
        player.Hand = new Array();
    });

	dealHands(numPlayers-roundNum);
	roundNumber++;

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
        }
    }


}


// need a restart function- return to home screen






