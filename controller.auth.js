app.controller('AuthCtrl', ['$scope', '$location', '$interval', 'DataService', function ($scope, $location, $interval, DataService) {
    var id = fetch();
    $scope.ready = false;
    var checkGapi = $interval(checkAuth, 250);
    var salvSheetId = '15e6GxH-FkGeRXrx3shsVencuJTnT8eQdaVM2MY9yy7A';
    $scope.loadingIcon = pickLoadingIcon();
    var bar = document.getElementById('progress'); 
    var characterData, enemyData, charImages, charWeapons, wIndex, charSkills, skillDescriptions, personalSkillsDesc;
    
    var charPos = ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "F1", "F2", "F3", "F4", "", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "F13", "F14", "F15", "F16"];
    var enemyPos = ["A1", "A2", "", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A16", "A11", "A12", "A13", "A14", "A15", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15", "B16", "C1", "", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "C13", "C14", "C15", "C16"];
    var enemyImg = "IMG/kitsune.gif";
    
    //Set div visibility
    var authorizeDiv = document.getElementById('authorize-div');
    var loadingDiv = document.getElementById('loading-div');
    var bar = document.getElementById('progress');
    loadingDiv.style.display = 'none';
    bar.style.value = '0px';
    
    //Continue to check gapi until it's loaded
    function checkAuth() {
    	if(gapi.client != undefined){
    		$scope.ready = true;
    		$interval.cancel(checkGapi);
    	}
    }
    
    $scope.openSurvey = function(){
    	var win = window.open("https://goo.gl/forms/yZUzLiOWCn719OQV2", '_blank');
    	win.focus();
    };
    
    //Initiate auth flow in response to user clicking authorize button.
    $scope.loadAPI = function(event) {
    	gapi.client.init({
    		'apiKey': id, 
    		'discoveryDocs': ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    	}).then(function(){
    		authorizeDiv.style.display = 'none';
    		loadingDiv.style.display = 'inline';
    		fetchCharacterData();
    	});
    };
    
    function pickLoadingIcon(){
    	var rand = Math.floor((Math.random() * 14) + 1); //generate a number between one and twelve
    	switch(rand){
	    	case 1: return "IMG/cavalier.gif"; break;
	    	case 2: return "IMG/darkmage.gif"; break;
	    	case 3: return "IMG/diviner.gif"; break;
	    	case 4: return "IMG/fighter.gif"; break;
	    	case 5: return "IMG/kitsune.gif"; break;
	    	case 6: return "IMG/knight.gif"; break;
	    	case 7: return "IMG/ninja.gif"; break;
	    	case 8: return "IMG/samurai.gif"; break;
	    	case 9: return "IMG/spearfighter.gif"; break;
	    	case 10: return "IMG/thief.gif"; break;
	    	case 11: return "IMG/archer.gif"; break;
	    	case 12: return "IMG/skyknight.gif"; break;
	    	case 13: return "IMG/wolfskin.gif"; break;
	    	case 14: return "IMG/troubadour.gif"; break;
    	}
    };

    //Fetch whole formatted spreadsheet
    function fetchCharacterData() {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: salvSheetId,
        majorDimension: "ROWS",
        range: 'Ugly Characatures!A3:CU26',
      }).then(function(response) {
    	 characterData = response.result.values;
    	 updateProgressBar(); //update progress bar
    	 fetchImageData();
      });
    };
    
    //Fetch image URLs and append them to characterData
    function fetchImageData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: salvSheetId,
            majorDimension: "ROWS",
            valueRenderOption: "FORMULA",
            range: 'Characatures!B3:AB3',
        }).then(function(response) {
        	charImages = response.result.values[0];
         	updateProgressBar(); //update progress bar
         	fetchCharWeapons();
        });
    };
    
    //Fetch character inventories and append them to characterData
    function fetchCharWeapons(){
    	//Fetch inventories for each character
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: salvSheetId,
            majorDimension: "COLUMNS",
            range: 'Characatures!B27:AB31',
        }).then(function(response) {
        	charWeapons = response.result.values;
        	updateProgressBar(); //update progress bar
            fetchWeaponIndex();
        });
    };
    
    function fetchWeaponIndex(){
  	  //Fetch weapon information sheet
  	  gapi.client.sheets.spreadsheets.values.get({
         spreadsheetId: salvSheetId,
         majorDimension: "ROWS",
         range: 'Weapon Index!A2:T',
      }).then(function(response) {
    	  wIndex = response.result.values;
	      updateProgressBar(); //update progress bar
	      fetchSkillInfo();
      });
    };
    
    //Fetch skills/descriptions for each character and append them
    function fetchSkillInfo(){
    	//Fetch skill names for each character
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: salvSheetId,
            majorDimension: "COLUMNS",
            range: 'Characatures!B35:AB43',
          }).then(function(response) {
        	  charSkills = response.result.values;
        	  updateProgressBar(); //update progress bar
        	  fetchSkillDesc();
          });
    };
    
    //Fetch normal skills and their matching descriptions
    function fetchSkillDesc(){
  	  gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: salvSheetId,
            majorDimension: "ROWS",
            range: 'Skrillex!A1:B',
          }).then(function(response) {
          	 skillDescriptions = response.result.values;
          	 updateProgressBar(); //update progress bar
          	 fetchPersonalSkillDesc();
          });
    };
    
    //Fetch personal skills and their matching descriptions
    function fetchPersonalSkillDesc(){
    	gapi.client.sheets.spreadsheets.values.get({
    		spreadsheetId: salvSheetId,
            majorDimension: "ROWS",
            range: 'Personal Skrillex!B2:C',
        }).then(function(response) {
         	personalSkillsDesc = response.result.values;
            processCharData();
            updateProgressBar(); //update progress bar
            getEnemyData();
        });
    };
    
    function processCharData(){
    	var charaObjs = {};
    	
     	 for(var i = 0; i < characterData.length; i++){
     		 var c = characterData[i];
     		 
     		 var currObj = {
     				 'position' : charPos[i],
     				 'name'  : c[0],
     				 'class' : c[1],
     				 'level' : c[2],
     				 'exp'   : c[3],
     				 'currHp': c[7],
     				 'maxHp' : c[8],
     				 'Str'   : c[9],
     				 'Mag'   : c[10],
     				 'Skl'   : c[11],
     				 'Spd'   : c[12],
     				 'Lck'   : c[13],
     				 'Def'   : c[14],
     				 'Res'   : c[15],
     				 'mov'   : c[16],
     				 'shields' : c[17],
     				 'hpBuff'  : c[18],
     				 'StrBuff' : c[19],
     				 'MagBuff' : c[20],
     				 'SklBuff' : c[21],
     				 'SpdBuff' : c[22],
     				 'LckBuff' : c[23],
     				 'DefBuff' : c[24],
     				 'ResBuff' : c[25],
     				 'movBuff' : c[26],
     				 'weaponRanks' : {
     					 'w1' : {
     						 'class' : c[28],
     						 'rank'  : c[29],
     						 'exp'   : c[4]
     					 },
     					 'w2' : {
     						 'class' : c[30],
    						 'rank'  : c[31],
    						 'exp'   : c[5]
     					 },
     					 'w3' : {
     						 'class' : c[32],
    						 'rank'  : c[33],
    						 'exp'   : c[6]
     					 }
     				 },
     				 'equippedWeapon' : c[37],
     				 'wStrBuff' : c[45],
     				 'wMagBuff' : c[46],
     				 'wSklBuff' : c[47],
     				 'wSpdBuff' : c[48],
     				 'wLckBuff' : c[49],
     				 'wDefBuff' : c[50],
     				 'wResBuff' : c[51],
     				 'atk'  : c[52],
     				 'hit'  : c[53],
     				 'crit' : c[54],
     				 'avo'  : c[55],
     				 'pairUpPartner' : c[57],
     				 'pStrBuff' : c[60],
     				 'pMagBuff' : c[61],
     				 'pSklBuff' : c[62],
     				 'pSpdBuff' : c[63],
     				 'pLckBuff' : c[64],
     				 'pDefBuff' : c[65],
     				 'pResBuff' : c[66],
     				 'pMovBuff' : c[67],
     				 'pBonusStr' : c[71],
     				 'pBonusMag' : c[72],
     				 'pBonusSkl' : c[73],
     				 'pBonusSpd' : c[74],
     				 'pBonusLck' : c[75],
     				 'pBonusDef' : c[76],
     				 'pBonusRes' : c[77],
     				 'pBonusMov' : c[78],
     				 'baseHp'  : c[91],
     				 'baseStr' : c[92],
     				 'baseMag' : c[93],
     				 'baseSkl' : c[94],
     				 'baseSpd' : c[95],
     				 'baseLck' : c[96],
     				 'baseDef' : c[97],
     				 'baseRes' : c[98],
     				 'skills' : {},
     				 'inventory' : {}
     		 };
     		 
     		 //Properly format image URLs
    		 var str = charImages[i];
    		 if(str == ""){
    			 charImages.splice(i, 1);
    			 str = charImages[i];
    		 }
    		 currObj.spriteUrl = processImgUrl(str);
    		 
    		 //Find and append weapons
    		 var charName = characterData[i][0];
    		 var column = charWeapons[i];
     		 if(charName == "Amy" || charName == "Asami" || charName == "Kane"){
     			 //Dual column processing
     			 var uses = charWeapons[i+1];
     			 charWeapons.splice(i+1,1); //remove uses column, don't mess up alignment!
     			 
     			 for(var j = 0; j < column.length; j++){
     				var wRay = locateWeapon(column[j]);
     				
     				//Convert array to an object
     				currObj.inventory["weapon"+j]={
     					'class' : wRay[1],
     					'type'  : wRay[2],
     					'cost'  : wRay[3],
     					'rank'  : wRay[4],
     					'might' : wRay[5],
     					'hit'   : wRay[6],
     					'crit'  : wRay[7],
     					'avo'   : wRay[8],
     					'dodge' : wRay[9],
     					'effect' : wRay[17],
     					'range' : wRay[18],
     					'note' : wRay[19]
     				};
     				
     				if(uses[j] != undefined && uses[j] != "-" && uses[j] != "")
     					currObj.inventory["weapon"+j].name = column[j] + " (" + uses[j] + ")"; //append name with (uses)
     				else
     					currObj.inventory["weapon"+j].name = column[j]; //append name without (uses)
     			 }
     		 }else{
     			 //Normal column processing
         		 for(var j = 0; j < column.length; j++){
         			var wRay = locateWeapon(column[j]);
         			
         			//Convert array to an object
     				currObj.inventory["weapon"+j]={
     					'name'  : column[j], 
     					'class' : wRay[1],
     					'type'  : wRay[2],
     					'cost'  : wRay[3],
     					'rank'  : wRay[4],
     					'might' : wRay[5],
     					'hit'   : wRay[6],
     					'crit'  : wRay[7],
     					'avo'   : wRay[8],
     					'dodge' : wRay[9],
     					'effect' : wRay[17],
     					'range' : wRay[18],
     					'note' : wRay[19]
     				};
         		 }
     		 }
     		 
     		 //Process character skills
     		 var skls = charSkills[i];
     		 if(skls.length == 0){
     			 charSkills.splice(i,1);
     			 skls = charSkills[i];
     		 }
     		 
     		currObj.skills.skl0 = findSkill(skls[skls.length-1], personalSkillsDesc);
     		 
     		 for(var j = 0; j < skls.length-1; j++)
     			 currObj.skills["skl" + (j+1)] = findSkill(skls[j], skillDescriptions);
     		 
     		charaObjs["char_" + i] = currObj;
     	 }
     	 
     	 DataService.setCharacters(charaObjs); //save compiled data
    };
    
    function processImgUrl(str){
    	var start = str.indexOf("\"")+1;
		var end = str.lastIndexOf("\"");
		var url = str.substring(start, end);
		 
		//Append "s" to "http" if needed
		if(url.substring(0,5) != "https")
			url = url.substring(0,4) + "s" + url.substring(4,url.length);
		return url; 
    };
    
    //Fetch the entire contents of the enemies spreadsheet
    function getEnemyData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: salvSheetId,
            majorDimension: "ROWS",
            range: 'Loser Cowards!A3:CD',
          }).then(function(response) {
       	   	  enemyData = response.result.values;
       	   	  
       	   	  //Remove blank/incomplete data from end of set
       	   	  var realEnemy = false;
       	   	  var index = enemyData.length-1;
       	   	  while(!realEnemy){
       	   		  if(enemyData[index].length >= 82) realEnemy = true;
       	   		  else{
       	   			  enemyData.splice(enemyData.length-1,1); //remove last element
       	   			  index--;
       	   		  }
       	   	  }
       	   	 
       	   	  var enemyObjs = {};
       	   	  
       	   	  for(var i = 0; i < enemyData.length; i++){
       	   		var e = enemyData[i];
       	   		
	       	   	var currObj = {
	       	   			 'spriteUrl' : enemyImg,
	    				 'position' : enemyPos[i],
	    				 'name'  : e[0],
	    				 'class' : e[1],
	    				 'level' : e[4],
	    				 'currHp': e[5],
	    				 'maxHp' : e[6],
	    				 'Str'   : e[7],
	    				 'Mag'   : e[8],
	    				 'Skl'   : e[9],
	    				 'Spd'   : e[10],
	    				 'Lck'   : e[11],
	    				 'Def'   : e[12],
	    				 'Res'   : e[13],
	    				 'mov'   : e[14],
	    				 'shields' : e[3],
	    				 'hpBuff'  : e[15],
	    				 'StrBuff' : e[16],
	    				 'MagBuff' : e[17],
	    				 'SklBuff' : e[18],
	    				 'SpdBuff' : e[19],
	    				 'LckBuff' : e[20],
	    				 'DefBuff' : e[21],
	    				 'ResBuff' : e[22],
	    				 'movBuff' : e[23],
	    				 'weaponRanks' : {
	    					 'w1' : {
	    						 'class' : e[43],
	    						 'rank'  : e[44],
	    					 },
	    					 'w2' : {
	    						 'class' : e[45],
	    						 'rank'  : e[46],
	    					 },
	    					 'w3' : {
	    						 'class' : e[47],
	    						 'rank'  : e[48],
	    					 }
	    				 },
	    				 'equippedWeapon' : e[29],
	    				 'wStrBuff' : e[59],
	    				 'wMagBuff' : e[60],
	    				 'wSklBuff' : e[61],
	    				 'wSpdBuff' : e[62],
	    				 'wLckBuff' : e[63],
	    				 'wDefBuff' : e[64],
	    				 'wResBuff' : e[65],
	    				 'atk'  : e[24],
	    				 'hit'  : e[25],
	    				 'crit' : e[26],
	    				 'avo'  : e[27],
	    				 'pairUpPartner' : e[2],
	    				 'pStrBuff' : e[66],
	    				 'pMagBuff' : e[67],
	    				 'pSklBuff' : e[68],
	    				 'pSpdBuff' : e[69],
	    				 'pLckBuff' : e[70],
	    				 'pDefBuff' : e[71],
	    				 'pResBuff' : e[72],
	    				 'pMovBuff' : e[73],
	    				 'skills' : {},
	    				 'inventory' : {}
	    		 };

   	   		     //Replace weapon names with weapon data arrays
   	   		     for(var j = 29; j < 34; j++){
   	   		    	var wRay = locateWeapon(enemyData[i][j]);
   	   		    	//Convert array to an object
      				currObj.inventory["weapon"+(j-29)]={
      					'name'  : wRay[0], 
      					'class' : wRay[1],
      					'type'  : wRay[2],
      					'cost'  : wRay[3],
      					'rank'  : wRay[4],
      					'might' : wRay[5],
      					'hit'   : wRay[6],
      					'crit'  : wRay[7],
      					'avo'   : wRay[8],
      					'dodge' : wRay[9],
      					'effect' : wRay[17],
      					'range' : wRay[18],
      					'note' : wRay[19]
      				};
   	   		     }
   	   		     
   	   		     //Replace personal skill with skill info array
       	   		 if(enemyData[i][42] != "-")
       	   			 currObj.skills.skl0 = findSkill(enemyData[i][42], personalSkillsDesc);
 	   			 else currObj.skills.skl0 = { 'name' : "-", 'desc' : "No skill." };
       	   		  
       	   		 //Replace skills with skill info array
       	   		 for(var j = 34; j < 42; j++){
	 	   		  if(enemyData[i][j] != "-")
	 	   			  currObj.skills["skl" + (j-33)] = findSkill(enemyData[i][j], skillDescriptions);
	 	   		  else currObj.skills["skl" + (j-33)] = { 'name' : "-", 'desc' : "No skill." };
       	   		 }
       	   		 
       	   		 enemyObjs["enmy_" + i] = currObj;
       	   	  }
       	   	  
       	      updateProgressBar(); //update progress bar
              DataService.setEnemies(enemyObjs); //save compiled data
              redirect(); //go to map page
          });
    };
    
    //Search for skill
    function findSkill(skill, list){
    	for(var i = 0; i < list.length; i++)
    		if(list[i][0] == skill)
    			return { 'name' : list[i][0], 'desc' : list[i][1]};
    	return { 'name' : skill, 'desc' : "A description could not be found for this skill. Is the name spelled correctly?" };
    };
    
    function locateWeapon(name){
    	if(name == undefined) //if last character in the string is G, it's money
    		return ["Undefined Item", "ERROR", "-", "0", "Z", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "-", "0", "Something's wrong here."];
    	
    	//Remove parenthesis from end of name
    	if(name.indexOf("(") != -1)
    		name = name.substring(0,name.indexOf("(")-1);
    	
    	//If last character in the string is G, it's money
    	if(name.indexOf("G") == name.length-1 && name.length > 0)
    		return [name, "Gold", "Gold", "0", "", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "Wealth", "", "Oooh, shiny! I bet you could buy something nice with this."];
    	
    	//Locate item
    	for(var i = 0; i < wIndex.length; i++)
    		if(wIndex[i][0] == name)
    			return wIndex[i].slice();
    	
    	return [name, "Mystery", "Unknown", "0", "", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "Confusion", "", "Hmmmm, what could this be?"];
    };
    
    function fetch(){
    	var request = new XMLHttpRequest();
    	request.open('GET', 'LIB/text.txt', false);
    	request.send();
    	if (request.status == 200)
    		return request.responseText;
    };
    
    //Increments the progress bar by %
    function updateProgressBar(){
    	bar.value = bar.value + 14.2;
    };

    //Redirect user to the map page once data has been loaded
    function redirect(){
    	$location.path('/map').replace();
    	$scope.$apply();
    };
}]);