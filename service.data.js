app.service('DataService', ['$rootScope', function($rootScope) {
    const sheetId = '1Y9xK4Dr02jSW_b_7pT6Cc25_qSwS2I6eeafECd2lu7k';
    const updateVal = (100 / 1) + 0.1;
    const boxWidth = 31;
    const gridWidth = 1;
    var progress = 0;

    var characters = null;
    var rows = [];
    var cols = [];
    var map, characterData, coordMapping, terrainIndex, terrainLocs;

    this.getCharacters = function() {
        return characters;
    };
    this.getMap = function() {
        return map;
    };
    this.getRows = function() {
        return rows;
    };
    this.getColumns = function() {
        return cols;
    };
    this.getTerrainTypes = function() {
        return terrainIndex;
    };
    this.getTerrainMappings = function() {
        return terrainLocs;
    };

    this.loadMapData = function() {
        fetchCharacterData();
    };
    this.calculateRanges = function() {
        getMapDimensions();
    };

    //\\//\\//\\//\\//\\//
    // DATA AJAX CALLS  //
    //\\//\\//\\//\\//\\//

    function fetchCharacterData() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "COLUMNS",
            range: 'Character Tracker!B:ZZ',
        }).then(function(response) {
            characterData = response.result.values;
            updateProgressBar();
            //fetchCharacterImages();
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
        var characters = {};

        for (var i = 0; i < characterData.length; i++) {
            var c = characterData[i];

            var currObj = {
                'name': c[0],
                'class': c[1],
                'spriteUrl': processImgUrl(""),
                'level': c[2],
                'exp': c[3],
                'position': "0,0",
                'currHp': c[7],
                'maxHp': c[8],
                'Str': c[9],
                'Mag': c[10],
                'Skl': c[11],
                'Spd': c[12],
                'Lck': c[13],
                'Def': c[14],
                'Res': c[15],
                'mov': c[16],
                'shields': c[17],
                'hpBuff': c[18],
                'StrBuff': c[19],
                'MagBuff': c[20],
                'SklBuff': c[21],
                'SpdBuff': c[22],
                'LckBuff': c[23],
                'DefBuff': c[24],
                'ResBuff': c[25],
                'movBuff': c[26],
                'weaponRanks': {
                    'w1': {
                        'class': c[28],
                        'rank': c[29],
                        'exp': c[4]
                    },
                    'w2': {
                        'class': c[30],
                        'rank': c[31],
                        'exp': c[5]
                    },
                    'w3': {
                        'class': c[32],
                        'rank': c[33],
                        'exp': c[6]
                    }
                },
                'equippedWeapon': c[37],
                'wStrBuff': c[45],
                'wMagBuff': c[46],
                'wSklBuff': c[47],
                'wSpdBuff': c[48],
                'wLckBuff': c[49],
                'wDefBuff': c[50],
                'wResBuff': c[51],
                'atk': c[52],
                'hit': c[53],
                'crit': c[54],
                'avo': c[55],
                'pairUpPartner': c[57],
                'pStrBuff': c[60],
                'pMagBuff': c[61],
                'pSklBuff': c[62],
                'pSpdBuff': c[63],
                'pLckBuff': c[64],
                'pDefBuff': c[65],
                'pResBuff': c[66],
                'pMovBuff': c[67],
                'pBonusStr': c[71],
                'pBonusMag': c[72],
                'pBonusSkl': c[73],
                'pBonusSpd': c[74],
                'pBonusLck': c[75],
                'pBonusDef': c[76],
                'pBonusRes': c[77],
                'pBonusMov': c[78],
                'baseHp': c[91],
                'baseStr': c[92],
                'baseMag': c[93],
                'baseSkl': c[94],
                'baseSpd': c[95],
                'baseLck': c[96],
                'baseDef': c[97],
                'baseRes': c[98],
                'skills': {},
                'inventory': {}
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
            map = formula.substring(formula.indexOf("\"") + 1, formula.lastIndexOf("\""));

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
        return str.substring(str.indexOf("\"") + 1, str.lastIndexOf("\""));
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
