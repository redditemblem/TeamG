app.service('DataService', ['$rootScope', function($rootScope) {
    const sheetId = '1Y9xK4Dr02jSW_b_7pT6Cc25_qSwS2I6eeafECd2lu7k';
    const updateVal = (100 / 1) + 0.1;
    const boxWidth = 31;
    const gridWidth = 1;
    var progress = 0;

	var characters = null;
	var enemies = null;
    var rows = [];
    var cols = [];
    var map, characterData, enemyData, itemIndex, skillIndex, coordMapping, terrainIndex, terrainLocs;

    this.getCharacters = function() { return characters; };
	this.getEnemies = function() { return enemies; };
    this.getMap = function() { return map; };
    this.getRows = function() { return rows; };
    this.getColumns = function(){ return cols; };
    this.getTerrainTypes = function() { return terrainIndex; };
    this.getTerrainMappings = function() { return terrainLocs; };

    this.loadMapData = function() { fetchCharacterData(); };
    this.calculateRanges = function() { getMapDimensions(); };

    //\\//\\//\\//\\//\\//
    // DATA AJAX CALLS  //
    //\\//\\//\\//\\//\\//

    function fetchCharacterData() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "COLUMNS",
            range: 'Stats!B2:AZ',
        }).then(function(response) {
            characterData = response.result.values;
            updateProgressBar();
            fetchCharacterImages();
        });
    };

    function fetchCharacterImages() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "COLUMNS",
            valueRenderOption: "FORMULA",
            // Obtain all images from all columns at row 5
            range: 'Stats!B5:AZ5',
        }).then(function(response) {
			var images = response.result.values[0];
			
			for(var i = 0; i < images.length && i < characterData.length; i++){
				characterData[i].splice(4, 1, processImageURL(images[i])); //replace the element at index 4
			}

			updateProgressBar();
			fetchEnemyData();
        });
	}
	
	function fetchEnemyData() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "COLUMNS",
            range: 'Enemy Stats!B1:BZ',
        }).then(function(response) {
            enemyData = response.result.values;
            updateProgressBar();
            fetchEnemyImages();
        });
    };

    function fetchEnemyImages() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "COLUMNS",
            valueRenderOption: "FORMULA",
            // Obtain all images from all columns at row 5
            range: 'Enemy Stats!B5:AZ5',
        }).then(function(response) {
			var images = response.result.values[0];
			
			for(var i = 0; i < images.length && i < enemyData.length; i++){
				enemyData[i].splice(3, 1, processImageURL(images[i])); //replace the element at index 3
			}

			updateProgressBar();
			fetchItemIndex();
        });
	}
	
	function fetchItemIndex() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Item List!B2:AO',
        }).then(function(response) {
			var results = response.result.values;
			
			itemIndex = {};
			for(var i = 0; i < results.length; i++){
				var itm = results[i];
				if(itm[0].length > 0){ //if the item has a name
					itemIndex[itm[0]] = {
						'name' : itm[0],
						'type' : itm[1],
						'atkStat' : itm[2],
						'rank' : itm[3],
						'might' : parseInt(itm[4]) | 0,
						'hit' : parseInt(item[5]) | 0,
						'crit' : parseInt(itm[6]) | 0,
						'crit%' : parseFloat(itm[7]) | 0.0,
						'critDmg' : parseInt(itm[8]) | 0,
						'avo' : parseInt(itm[9]) | 0,
						'cEva' : parseInt(itm[10]) | 0,
						'range' : itm[11],
						'effect' : itm[12],
						'effective' : itm[13],
						'StrEqpt' : parseInt(itm[14]) | 0,
						'MagEqpt' : parseInt(itm[15]) | 0,
						'SklEqpt' : parseInt(itm[16]) | 0,
						'SpdEqpt' : parseInt(itm[17]) | 0,
						'LckEqpt' : parseInt(itm[18]) | 0,
						'DefEqpt' : parseInt(itm[19]) | 0,
						'MagEqpt' : parseInt(itm[20]) | 0,
						'StrInv' : parseInt(itm[28]) | 0,
						'MagInv' : parseInt(itm[29]) | 0,
						'SklInv' : parseInt(itm[30]) | 0,
						'SpdInv' : parseInt(itm[31]) | 0,
						'LckInv' : parseInt(itm[32]) | 0,
						'DefInv' : parseInt(itm[33]) | 0,
						'MagInv' : parseInt(itm[34]) | 0,
						'desc' : itm[35] != undefined ? itm[35] : "",
						'spriteUrl' : itm[36] != undefined ? itm[36] : "",
					}
				}
			}

            updateProgressBar();
            fetchSkillIndex();
        });
	};
	
	function fetchSkillIndex() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Skill List!B2:C',
        }).then(function(response) {
			var skills = response.result.values;
			
			gapi.client.sheets.spreadsheets.values.get({
				spreadsheetId: sheetId,
				majorDimension : "COLUMNS",
				valueRenderOption: "FORMULA",
				range: 'Skill List!A2:A',
			}).then(function(response){
				var images = response.results.values[0];

				skillIndex = {};
				for(var i = 0; i < skills.length; i++){
					var s = skills[i];
					if(s[0].length > 0){ //if the item has a name
						skillIndex[s[0]] = {
							'name' : s[0],
							'desc' : s[1],
							'spriteUrl' : images[i] != undefined ? processImageURL(images[i]) : ""
						}
					}
				}

				updateProgressBar();
				processCharacters();
			});
        });
    };

    /*function fetchTerrainIndex(){
    	gapi.client.sheets.spreadsheets.values.get({
    		spreadsheetId: sheetId,
    		majorDimension: "ROWS",
    		range: 'Terrain Chart!A2:K',
    	}).then(function(response) {
    		var rows = response.result.values;
    		terrainIndex = {};

    		for(var i = 0; i < rows.length; i++){
    			var r = rows[i];
    			terrainIndex[r[0]] = {
    				'avo' : r[1] != "-" ? parseInt(r[1]) : 0,
    				'def' : r[2] != "-" ? parseInt(r[2]) : 0,
    				'heal' : r[3] != "-" ? parseInt(r[3].match(/^[0-9]+/)) : 0,
    				'Foot' :  r[4],
    				'Armor' : r[5],
    				'Mage' : r[6],
    				'Mounted' : r[7],
    				'Flier' : r[8],
    				'effect' : r[9]
    			}
    		}

    		updateProgressBar();
    		fetchTerrainChart();
    	});
    };

    function fetchTerrainChart(){
        gapi.client.sheets.spreadsheets.values.get({
    		spreadsheetId: sheetId,
    		majorDimension: "ROWS",
    		range: 'Terrain Map!A:ZZ',
        }).then(function(response) {
    		coordMapping = response.result.values;

    		updateProgressBar();
    		processCharacters();
    	});
    };*/

    function processCharacters() {
        characters = {};

        for (var i = 0; i < characterData.length; i++) {
            var c = characterData[i];
			if(c[0].length == 0) continue;

            var currObj = {
                'name': c[0],
				'class': c[1],
				'unitType' : c[2],
                'spriteUrl': c[3],
                'level': c[4],
				'exp': c[5],
				'gold' : parseInt(c[6].substring(0, c[6].index("|")).trim()) | 0,
				'ore' : parseInt(c[6].substring(c[6].index("|")+1).trim()) | 0,
				'position': c[7],
                'currHp': parseInt(c[9]) | 0,
                'maxHp': parseInt(c[10]) | 0,
                'StrPair': parseInt(c[11]) | 0,
                'MagPair': parseInt(c[12]) | 0,
                'SklPair': parseInt(c[13]) | 0,
                'SpdPair': parseInt(c[14]) | 0,
                'LckPair': parseInt(c[15]) | 0,
                'DefPair': parseInt(c[16]) | 0,
                'ResPair': parseInt(c[17]) | 0,
				'MovPair': parseInt(c[18]) | 0,
				'StrBase' : parseInt(c[20]) | 0,
				'MagBase' : parseInt(c[21]) | 0,
				'SklBase' : parseInt(c[22]) | 0,
				'SpdBase' : parseInt(c[23]) | 0,
				'LckBase' : parseInt(c[24]) | 0,
				'DefBase' : parseInt(c[25]) | 0,
				'MagBase' : parseInt(c[26]) | 0,
				'MovBase' : parseInt(c[27]) | 0,
				'weaknesses' : c[28].length > 0 && c[28] != "-" ? c[28].split(",") : [],
				'atk' : parseInt(c[29]) | 0,
				'hit' : parseInt(c[30]) | 0,
				'crit' : parseInt(c[31]) | 0,
				'avo' : parseInt(c[32]) | 0,
				'cEva' : parseInt(c[33]) | 0,
				'inventory' : {},
				'partner' : c[42],
				'stance' : c[43],
				'shields': c[44],
				'skills' : {},
                'hpBuff': parseInt(c[54]) | 0,
                'StrBuff': parseInt(c[55]) | 0,
                'MagBuff': parseInt(c[56]) | 0,
                'SklBuff': parseInt(c[57]) | 0,
                'SpdBuff': parseInt(c[58]) | 0,
                'LckBuff': parseInt(c[59]) | 0,
                'DefBuff': parseInt(c[60]) | 0,
                'ResBuff': parseInt(c[61]) | 0,
				'MovBuff': parseInt(c[62]) | 0,
				'atkBuff' : parseInt(c[63]) | 0,
				'hitBuff' : parseInt(c[64]) | 0,
				'critBuff' : parseInt(c[65]) | 0,
				'avoBuff' : parseInt(c[66]) | 0,
				'cEvaBuff' : parseInt(c[67]) | 0,
                'weaponRanks': {
                    'w1': {
                        'class': c[83],
                        'rank': c[84],
                        'exp': calcExpPercent(c[85])
                    },
                    'w2': {
                        'class': c[86],
                        'rank': c[87],
                        'exp': calcExpPercent(c[88])
                    },
                    'w3': {
                        'class': c[89],
                        'rank': c[90],
                        'exp': calcExpPercent(c[91])
                    }
                },
            };

            //Find and append weapons

            currObj.skills.skl0 = findSkill(skls[skls.length - 1], personalSkillsDesc);

            for (var j = 0; j < skls.length - 1; j++)
                currObj.skills["skl" + (j + 1)] = findSkill(skls[j], skillDescriptions);

            charaObjs["char_" + i] = currObj;
        }

        updateProgressBar();
        fetchMapUrl();
    };

    function fetchMapUrl() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "COLUMNS",
            valueRenderOption: "FORMULA",
            range: 'Current Map!A6:A6',
        }).then(function(response) {
            var formula = response.result.values[0][0];
            map = processImageURL(formula);

            updateProgressBar();
        });
    };

    //******************\\
    // CHARACTER RANGES \\
    //******************\\

    function getMapDimensions() {
        var map = document.getElementById('mapImg');
        var height = map.naturalHeight; //calculate the height of the map

        height = height / (boxWidth + gridWidth);
        for (var i = 0; i < height; i++)
            rows.push(i + 1);

        var width = map.naturalWidth; //calculate the width of the map
        width = width / (boxWidth + gridWidth);

        for (var i = 0; i < width; i++)
            cols.push(i + 1);

        updateProgressBar();
        initializeTerrain();
    };

    function initializeTerrain() {
        terrainLocs = {};

        for (var r = 0; r < rows.length; r++)
            for (var c = 0; c < cols.length; c++)
                terrainLocs[cols[c] + "," + rows[r]] = getDefaultTerrainObj();

        //Update terrain types from input list
        for (var r = 0; r < coordMapping.length; r++) {
            var row = coordMapping[r];
            for (var c = 0; c < cols.length && c < row.length; c++) {
                if (row[c].length > 0) terrainLocs[cols[c] + "," + rows[r]].type = row[c];
            }
        }

        for (var c in characters)
            if (terrainLocs[characters[c].position] != undefined)
                terrainLocs[characters[c].position].occupiedAffiliation = c.indexOf("char_") > -1 ? "char" : characters[c].affiliation;

        updateProgressBar();
        //calculateCharacterRanges();
    };

    function getDefaultTerrainObj() {
        return {
            'type': "Plains",
            'movCount': 0,
            'atkCount': 0,
            'healCount': 0,
            'occupiedAffiliation': ''
        }
    };

    function calculateCharacterRanges() {
        for (var c in characters) {
            var char = characters[c];
            var list = [];
            var atkList = [];
            var healList = [];

            if (char.position.length > 0) {
                var horz = parseInt(char.position.substring(0, char.position.indexOf(",")));
                var vert = parseInt(char.position.substring(char.position.indexOf(",") + 1, char.position.length));
                var range = parseInt(char.mov);

                var maxAtkRange = 0;
                var maxHealRange = 0;

                for (var i in char.inventory) {
                    var item = char.inventory[i];
                    var r = formatItemRange(item.range);
                    if (isAttackingItem(item.class) && r > maxAtkRange && r <= 5) maxAtkRange = r;
                    else if (!isAttackingItem(item.class) && r > maxHealRange && r <= 5) maxHealRange = r;
                }
                if (maxAtkRange > maxHealRange) maxHealRange = 0;

                var affliliation = c.indexOf("char_") > -1 ? "char" : "enemy";

                recurseRange(0, horz, vert, range, maxAtkRange, maxHealRange, char.class.movType, affliliation, list, atkList, healList, "_");
                char.range = list;
                char.atkRange = atkList;
                char.healRange = healList;
            } else {
                char.range = [];
                char.atkRange = [];
                char.healRange = [];
            }
        }

        //Finish load
        updateProgressBar();
    };

    function recurseRange(mode, horzPos, vertPos, range, atkRange, healRange, terrainType, affiliation, list, atkList, healList, trace) {
        var coord = rows[horzPos] + cols[vertPos];
        var tile = terrainLocs[coord];

        //Mov mode calcs
        if (trace.length > 1 && mode == 0) {
            var classCost = terrainIndex[tile.type][terrainType];

            //Unit cannot traverse tile if it has no cost or it is occupied by an enemy unit
            if (classCost == undefined ||
                classCost == "-" ||
                (tile.occupiedAffiliation.length > 0 && tile.occupiedAffiliation != affiliation)
            ) {
                if (atkRange > 0) {
                    range = atkRange;
                    mode = 1;
                } else if (healRange > 0) {
                    range = healRange;
                    mode = 2;
                } else return;
            } else range -= parseFloat(classCost);
        }

        //Attack/heal mode calcs
        if (mode > 0) {
            var classCost = terrainIndex[terrainLocs[coord].type].Fliers;
            if (classCost == undefined || classCost == "-") return;
            range -= parseFloat(classCost);
        }

        if (mode == 0 && list.indexOf(coord) == -1) list.push(coord);
        else if (mode == 1 && atkList.indexOf(coord) == -1) atkList.push(coord);
        else if (healList.indexOf(coord) == -1) healList.push(coord);

        trace += coord + "_";

        if (range <= 0) { //base case
            if (mode == 0 && atkRange > 0) {
                range = atkRange;
                mode = 1;
            } else if (mode != 2 && healRange > 0) {
                if (mode == 0) range = healRange;
                else range = healRange - atkRange;
                mode = 2;
            } else return;
        }

        if (horzPos > 0 && trace.indexOf("_" + rows[horzPos - 1] + cols[vertPos] + "_") == -1 &&
            (mode == 0 || (list.indexOf("_" + rows[horzPos - 1] + cols[vertPos] + "_") == -1 &&
                (mode == 1 || atkList.indexOf("_" + rows[horzPos - 1] + cols[vertPos] + "_") == -1))))
            recurseRange(mode, horzPos - 1, vertPos, range, atkRange, healRange, terrainType, affiliation, list, atkList, healList, trace);

        if (horzPos < rows.length - 1 && trace.indexOf("_" + rows[horzPos + 1] + cols[vertPos] + "_") == -1 &&
            (mode == 0 || (list.indexOf("_" + rows[horzPos + 1] + cols[vertPos] + "_") == -1 &&
                (mode == 1 || atkList.indexOf("_" + rows[horzPos + 1] + cols[vertPos] + "_") == -1))))
            recurseRange(mode, horzPos + 1, vertPos, range, atkRange, healRange, terrainType, affiliation, list, atkList, healList, trace);

        if (vertPos > 0 && trace.indexOf("_" + rows[horzPos] + cols[vertPos - 1] + "_") == -1 &&
            (mode == 0 || (list.indexOf("_" + rows[horzPos] + cols[vertPos - 1] + "_") == -1 &&
                (mode == 1 || atkList.indexOf("_" + rows[horzPos] + cols[vertPos - 1] + "_") == -1))))
            recurseRange(mode, horzPos, vertPos - 1, range, atkRange, healRange, terrainType, affiliation, list, atkList, healList, trace);

        if (vertPos < cols.length - 1 && trace.indexOf("_" + rows[horzPos] + cols[vertPos + 1] + "_") == -1 &&
            (mode == 0 || (list.indexOf("_" + rows[horzPos] + cols[vertPos + 1] + "_") == -1 &&
                (mode == 1 || atkList.indexOf("_" + rows[horzPos] + cols[vertPos + 1] + "_") == -1))))
            recurseRange(mode, horzPos, vertPos + 1, range, atkRange, healRange, terrainType, affiliation, list, atkList, healList, trace);
    };

    function formatItemRange(range) {
        if (range.indexOf("~") != -1 && range.length > 1)
            range = range.substring(range.indexOf("~") + 1, range.length);
        range = range.trim();
        return parseInt(range) || 0;
    };

    function isAttackingItem(wpnClass) {
        return wpnClass != "Staff" && wpnClass != "Consumable";
    };

    //\\//\\//\\//\\//\\//
    // HELPER FUNCTIONS //
    //\\//\\//\\//\\//\\//

    function updateProgressBar() {
        if (progress < 100) {
            progress = progress += updateVal; //13 calls
            $rootScope.$broadcast('loading-bar-updated', progress, map);
        }
    };

    function processImageURL(str) {
		if(str == undefined || str.length == 0) return "";
        else return str.substring(str.indexOf("\"") + 1, str.lastIndexOf("\""));
	};
	
	function calcExpPercent(exp){
		if(exp.length < 3) return 0;

		var split = exp.split("/");
		var curr = parseInt(split[0].trim()) | 0;
		var nextRank = parseInt(split[1].trim()) | 0;

		if(curr == 0 || nextRank == 0) return 0;
		else return curr/nextRank;
	};

    function getItem(name) {
        var originalName = name;
        if (name != undefined && name.length > 0) {
            if (name.indexOf("(") != -1)
                name = name.substring(0, name.indexOf("("));
            name = name.trim();
        }

        if (name == undefined || name.length == 0 || itemIndex[name] == undefined)
            return {
                'name': name != undefined ? name : "",
                'class': "",
                'rank': "",
                'type': "",
                'might': "",
                'hit': "",
                'crit': "",
                'net': "",
                'range': "",
                'effect': "Couldn't locate this item.",
                'laguzEff': "",
                'desc': "",
                'HP': "",
                'Str': "",
                'Mag': "",
                'Skl': "",
                'OSpd': "",
                'DSpd': "",
                'Lck': "",
                'Def': "",
                'Res': "",
                'icoOverride': ""
            }

        var copy = Object.assign({}, itemIndex[name]);
        copy.name = originalName;
        return copy;
    };

    function getSkill(name) {
        if (name == undefined || name.length == 0 || skillIndex[name] == undefined)
            return {
                'name': name != undefined ? name : "",
                'slot': "",
                'classes': "",
                'finalEff': "",
                'notes': "This skill could not be located."
            }
        else return skillIndex[name];
    };

    function getClass(name) {
        if (name == undefined || name.length == 0 || classIndex[name] == undefined)
            return {
                'name': name != undefined ? name : "",
                'tags': [],
                'desc': ""
            }
        else return JSON.parse(JSON.stringify(classIndex[name]));
    };

    function getStatusEffect(name) {
        if (name == undefined || name.length == 0 || statusIndex[name] == undefined)
            return {
                'name': "No Status",
                'turns': "",
                'effect': "This unit's feeling pretty normal."
            }
        else return statusIndex[name];
    };

    //-------------------\\
    // STAT CALCULATIONS \\
    //-------------------\\

    function calcRankLetter(exp) {
        exp = parseInt(exp);

        if (exp < 10) return "E";
        else if (exp < 30) return "D";
        else if (exp < 70) return "C";
        else if (exp < 150) return "B";
        else if (exp < 300) return "A";
        else return "S";
    };

    function getEquippedWeaponRank(char) {
        var eqWpnCls = char.equippedWeapon.class;

        var wpnRank = "";
        if (eqWpnCls == "Laguz") {
            eqWpnCls = char.equippedWeapon.name.substring(0, char.equippedWeapon.name.indexOf("-")).trim();
            wpnRank = char.equippedWeapon.name.substring(char.equippedWeapon.name.indexOf("-") + 1).trim();
        } else {
            if (eqWpnCls == char.weaponRanks.w1.class) wpnRank = char.weaponRanks.w1.rank;
            else if (eqWpnCls == char.weaponRanks.w2.class) wpnRank = char.weaponRanks.w2.rank;
            else if (eqWpnCls == char.weaponRanks.w3.class) wpnRank = char.weaponRanks.w3.rank;
            else if (eqWpnCls == char.weaponRanks.w4.class) wpnRank = char.weaponRanks.w4.rank;
        }

        if (wpnRank.length > 0) return weaponRankBonuses[eqWpnCls][wpnRank];
        else return {
            'dmg': 0,
            'hit': 0,
            'crit': 0
        };
    };

    function calcAttack(char) {
        var eqWpn = char.equippedWeapon;

        var playerMight;
        if (eqWpn.type == "Physical") playerMight = char.TrueStr;
        else if (eqWpn.type == "Magical") playerMight = char.TrueMag;
        else playerMight = 0;

        var wpnMight = parseInt(eqWpn.might) || 0;
        var dmgBonus = getEquippedWeaponRank(char).dmg;

        return Math.floor(playerMight + wpnMight + dmgBonus);
    };

    function calcHit(char) {
        var wpnHit = parseInt(char.equippedWeapon.hit) || 0;
        var hitBonus = getEquippedWeaponRank(char).hit;

        return Math.floor((char.TrueSkl * 2.5) + (char.TrueLck * 1.5) + wpnHit + hitBonus);
    };

    function calcAvo(char) {
        var wpnAvo = parseInt(char.equippedWeapon.avo) || 0;
        return Math.floor((char.TrueSpd * 2.5) + (char.TrueLck * 1.5) + wpnAvo);
    };

    function calcCrit(char) {
        var wpnCrit = parseInt(char.equippedWeapon.crit) || 0;
        var critBonus = getEquippedWeaponRank(char).crit;
        return Math.floor((char.TrueSkl * 2.5) + wpnCrit + critBonus);
    };

    function calcEva(char) {
        var wpnEva = parseInt(char.equippedWeapon.eva) || 0;
        return Math.floor((char.TrueLck * 2.5) + wpnEva);
    };

    function calcTrueStat(char, stat) {
        var base = char[stat];
        var buff = char[stat + "Buff"];
        var boost = char[stat + "Boost"];

        if (stat == "Spd") stat = "OSpd";
        var wpn = char.equippedWeapon[stat];

        base = parseInt(base);
        buff = (buff.length > 0 ? parseInt(buff) : 0);
        boost = (boost.length > 0 ? parseInt(boost) : 0);
        wpn = (wpn != undefined ? parseInt(wpn) : 0);

        return base + buff + boost + wpn;
    };
}]);
