
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


    // io.configure(function(){
    // 	io.set('log level', 0);

    // 	io.set('authorization', function (handshakeData, callBack){
    // 		callback(null,true);
    // 	});


    // });

    io.sockets.on("connection", function(client){
    	// create new uuid
    	client.userid = uuid.v4();

    	// tell player they connected, give id 
    	client.emit('onconnected', {id : client.userid});
        console.log('\t socket.io:: player ' + client.userid + ' connected');

		client.on('chat message', function(msg){
	    	console.log('message: ' + msg);
	    	var messageId=clientDictionary[client.userid];
	    	console.log(client.userid);
	    	console.log(messageId);

	    	console.log(clientDictionary);
	    	io.emit('chat message', {message:msg, id: messageId});
	  	});

        client.on("disconnect", function(data){
        	console.log('\t socket.io:: client disconnected ' + client.userid );    
        	io.emit('chat message', {message:client.customId + " left the game", id:clientDictionary[client.userid]});


	        for( var i=0, len=clients.length; i<len; ++i ){
	            var c = clients[i];

	            if(c.clientId == client.userid){
	                clients.splice(i,1);
	                break;
	            }
	        }



        });

    	// store client info
	    client.on('storeClientInfo', function (data) {
			client.broadcast.emit('chat message', {message:'A new user joined:'+data.customId, id:data.customId});
	        var clientInfo = new Object();
	        clientInfo.customId = data.customId;
	        client.customId = data.customId;
	        clientInfo.clientId = client.userid;
	        clients.push(clientInfo);

	        // map the erver side id to the user's custom id
	        clientDictionary[client.userid] = data.customId;
	        // console.log(clientDictionary[client.id]);

	        if (clients.length == 6){
	        	console.log("all players are in");
	        	io.emit('chat message', "All Players are In");
	        }
	    });



    });






