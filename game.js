function createGame(){

	var thisPlayerName = playerName();


	var newGame = {
		id: generateId(4),
		units: {},
		buildings: {},
		players: {}		
	}

	newGame.players[thisPlayerName] = {
		name: thisPlayerName,
		gold: 10,
		gameId: this.gameId
	}

	return newGame;
}


function playerName(){

	var adjList = ["rapid", "fearsome", "frozen", "fridgid","molten","bloody","cunning","intrepid","savage","noble","mighty","crazy","dark","prophetic"];
	var nounList = ["warlord","shaman","royal","general","pirate","wizard","leader","captain","chief","officer","ruler","lord,"];

	var adjective = adjList[Math.floor(Math.random()*adjList.length)];
	var noun = nounList[Math.floor(Math.random()*nounList.length)];

	var playerName = adjective + noun[0].toUpperCase() + noun.slice(1);

	return playerName;
}


function generateId(length){
	var chars = "abcdefghijklmnopqrstuvwxyz1234567890"
    var hash = "";

    for (var i = 0; i < length ; i++){
    	hash += chars[Math.floor(Math.random()*chars.length)]
    }

    return hash;
}








module.exports.createGame = createGame;