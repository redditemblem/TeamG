app.service('DataService', ['$location', function ($location) {
	var characters;
	var enemies
	
	this.getCharacters = function(){ return characters; };
	this.setCharacters = function(s){ characters = s; };
	
	this.getEnemies = function(){ return enemies; };
	this.setEnemies = function(s){ enemies = s; };
}]);