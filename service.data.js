app.service('DataService', ['$rootScope', function($rootScope) {
    const rowNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "BB", "CC", "DD", "EE", "FF", "GG", "HH", "II", "JJ", "KK", "LL", "MM", "NN", "OO", "PP", "QQ", "RR", "SS", "TT", "UU", "VV", "WW", "XX", "YY", "ZZ"];
    const sheetId = '1Y9xK4Dr02jSW_b_7pT6Cc25_qSwS2I6eeafECd2lu7k';
    const updateVal = (100 / 13) + 0.1;
    const boxWidth = 31;
    const gridWidth = 1;
    var progress = 0;

    var characters = null;
    var enemies = null;
    var rows = [];
    var cols = [];
    var map, characterData, enemyData, itemIndex, skillIndex, coordMapping, terrainIndex, terrainLocs;

    this.getCharacters = function() {
        return characters;
    };
    this.getEnemies = function() {
        return enemies;
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
            majorDimension: "ROWS",
            valueRenderOption: "FORMULA",
            // Obtain all images from all columns at row 5
            range: 'Stats!B5:AZ5',
        }).then(function(response) {
            var images = response.result.values[0];

            for (var i = 0; i < images.length && i < characterData.length; i++) {
                characterData[i].splice(3, 1, processImageURL(images[i])); //replace the element at index 4
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
            majorDimension: "ROWS",
            valueRenderOption: "FORMULA",
            range: 'Enemy Stats!B4:AZ4',
        }).then(function(response) {
            var images = response.result.values[0];

            for (var i = 0; i < images.length && i < enemyData.length; i++) {
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
            for (var i = 0; i < results.length; i++) {
                var itm = results[i];
                if(itm.length == 0) continue;

                if (itm[0].length > 0) { //if the item has a name
                    itemIndex[itm[0]] = {
                        'name': itm[0],
                        'type': itm[1],
                        'atkStat': itm[2],
                        'rank': itm[3],
                        'might': parseInt(itm[4]) | 0,
                        'hit': parseInt(itm[5]) | 0,
                        'crit': parseInt(itm[6]) | 0,
                        'crit%': parseFloat(itm[7]) | 0.0,
                        'critDmg': parseInt(itm[8]) | 0,
                        'avo': parseInt(itm[9]) | 0,
                        'cEva': parseInt(itm[10]) | 0,
                        'range': itm[11],
                        'effect': itm[12],
                        'effective': itm[13],
                        'StrEqpt': parseInt(itm[14]) | 0,
                        'MagEqpt': parseInt(itm[15]) | 0,
                        'SklEqpt': parseInt(itm[16]) | 0,
                        'SpdEqpt': parseInt(itm[17]) | 0,
                        'LckEqpt': parseInt(itm[18]) | 0,
                        'DefEqpt': parseInt(itm[19]) | 0,
                        'MagEqpt': parseInt(itm[20]) | 0,
                        'StrInv': parseInt(itm[28]) | 0,
                        'MagInv': parseInt(itm[29]) | 0,
                        'SklInv': parseInt(itm[30]) | 0,
                        'SpdInv': parseInt(itm[31]) | 0,
                        'LckInv': parseInt(itm[32]) | 0,
                        'DefInv': parseInt(itm[33]) | 0,
                        'MagInv': parseInt(itm[34]) | 0,
                        'desc': itm[35] != undefined ? itm[35] : "",
                        'spriteUrl': itm[36] != undefined ? itm[36] : "",
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
                majorDimension: "COLUMNS",
                valueRenderOption: "FORMULA",
                range: 'Skill List!A2:A',
            }).then(function(response) {
                var images = response.result.values[0];

                skillIndex = {};
                for (var i = 0; i < skills.length; i++) {
                    var s = skills[i];
                    if(s.length == 0) continue;

                    if (s[0].length > 0) { //if the item has a name
                        skillIndex[s[0]] = {
                            'name': s[0],
                            'desc': s[1],
                            'spriteUrl': images[i] != undefined ? processImageURL(images[i]) : ""
                        }
                    }
                }

                updateProgressBar();
                fetchTerrainIndex();
            });
        });
    };

    function fetchTerrainIndex(){
    	gapi.client.sheets.spreadsheets.values.get({
    		spreadsheetId: sheetId,
    		majorDimension: "ROWS",
    		range: 'Terrain List!A2:K',
    	}).then(function(response) {
    		var rows = response.result.values;
    		terrainIndex = {};

    		for(var i = 0; i < rows.length; i++){
                var r = rows[i];
                if(r.length == 0 || r[0].length == 0) continue;

    			terrainIndex[r[0]] = {
    				'avo' : parseInt(r[1]) | 0,
    				'def' : parseInt(r[2]) | 0,
    				'heal' : r[3],
    				'Foot' :  r[4],
    				'Beast' : r[5],
    				'Mage' : r[6],
    				'Mount (T1)' : r[7],
                    'Mount (T2)' : r[8],
                    'Flier' : r[9],
    				'note' : r[10]
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
    		range: 'Terrain Coordinates!A1:ZZ',
        }).then(function(response) {
    		coordMapping = response.result.values;

    		updateProgressBar();
    		processCharacters();
    	});
    };

    function processCharacters() {
        characters = {};

        for (var i = 0; i < characterData.length; i++) {
            var c = characterData[i];
            if (c[0].length == 0) continue;

            var currObj = {
                'name': c[0],
                'class': c[1],
                'unitType': c[2],
                'spriteUrl': c[3],
                'level': c[4],
                'exp': c[5],
                'gold': parseInt(c[6].substring(0, c[6].indexOf("|")).trim()) | 0,
                'ore': parseInt(c[6].substring(c[6].indexOf("|")+1).trim()) | 0,
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
                'StrBase': parseInt(c[20]) | 0,
                'MagBase': parseInt(c[21]) | 0,
                'SklBase': parseInt(c[22]) | 0,
                'SpdBase': parseInt(c[23]) | 0,
                'LckBase': parseInt(c[24]) | 0,
                'DefBase': parseInt(c[25]) | 0,
                'MagBase': parseInt(c[26]) | 0,
                'MovBase': parseInt(c[27]) | 0,
                'weaknesses': c[28].length > 0 && c[28] != "-" ? c[28].split(",") : [],
                'atk': parseInt(c[29]) | 0,
                'hit': parseInt(c[30]) | 0,
                'crit': parseInt(c[31]) | 0,
                'avo': parseInt(c[32]) | 0,
                'cEva': parseInt(c[33]) | 0,
                'inventory': {},
                'partner': c[42],
                'stance': c[43],
                'shields': c[44],
                'skills': {},
                'hpBuff': parseInt(c[54]) | 0,
                'StrBuff': parseInt(c[55]) | 0,
                'MagBuff': parseInt(c[56]) | 0,
                'SklBuff': parseInt(c[57]) | 0,
                'SpdBuff': parseInt(c[58]) | 0,
                'LckBuff': parseInt(c[59]) | 0,
                'DefBuff': parseInt(c[60]) | 0,
                'ResBuff': parseInt(c[61]) | 0,
                'MovBuff': parseInt(c[62]) | 0,
                'atkBuff': parseInt(c[63]) | 0,
                'hitBuff': parseInt(c[64]) | 0,
                'critBuff': parseInt(c[65]) | 0,
                'avoBuff': parseInt(c[66]) | 0,
                'cEvaBuff': parseInt(c[67]) | 0,
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
            var itemArray = c.slice(36, 41);
            var eqptIndex = itemArray.indexOf(c[35]);
            if(eqptIndex != -1){ //if there is an equipped item, move it to the head of the list
                itemArray.splice(eqptIndex, 1);
                itemArray.splice(0, 0, c[35]);
            }

            for(var j = 0; j < itemArray.length; j++)
                currObj.inventory["itm" + j] = getItem(itemArray[j]);

            for(var k = 47; k <= 52; k++)
                currObj.skills["skl" + (k-46)] = getSkill(c[k]);

            characters["char_" + i] = currObj;
        }

        updateProgressBar();
        processEnemies();
    };

    function processEnemies() {
        enemies = {};

        for (var i = 0; i < enemyData.length; i++) {
            var e = enemyData[i];
            if (e[0].length == 0) continue;

            var currObj = {
                'name': e[0],
                'class': e[1],
                'unitType': e[2],
                'spriteUrl': e[3],
                'currHp': parseInt(e[5]) | 0,
                'maxHp': parseInt(e[6]) | 0,
                'StrPair': parseInt(e[7]) | 0,
                'MagPair': parseInt(e[8]) | 0,
                'SklPair': parseInt(e[9]) | 0,
                'SpdPair': parseInt(e[10]) | 0,
                'LckPair': parseInt(e[11]) | 0,
                'DefPair': parseInt(e[12]) | 0,
                'ResPair': parseInt(e[13]) | 0,
                'MovPair': parseInt(e[14]) | 0,
                'StrBase': parseInt(e[16]) | 0,
                'MagBase': parseInt(e[17]) | 0,
                'SklBase': parseInt(e[18]) | 0,
                'SpdBase': parseInt(e[19]) | 0,
                'LckBase': parseInt(e[20]) | 0,
                'DefBase': parseInt(e[21]) | 0,
                'MagBase': parseInt(e[22]) | 0,
                'MovBase': parseInt(e[23]) | 0,
                'level': e[24],
                'position': e[25],
                'atk': parseInt(e[26]) | 0,
                'hit': parseInt(e[27]) | 0,
                'crit': parseInt(e[28]) | 0,
                'avo': parseInt(e[29]) | 0,
                'cEva': parseInt(e[30]) | 0,
                'weaknesses': e[35].length > 0 && e[35] != "-" ? e[35].split(",") : [],
                'inventory': {},
                'weaponRanks': {
                    'w1': {
                        'class': e[40],
                        'rank': e[42],
                    },
                    'w2': {
                        'class': e[86],
                        'rank': e[87],
                    },
                    'w3': {
                        'class': e[89],
                        'rank': e[90],
                    }
                },
                'skills': {},
                'partner': e[55],
                'stance': e[56],
                'shields': e[57],
                'hpBuff': parseInt(e[59]) | 0,
                'StrBuff': parseInt(e[60]) | 0,
                'MagBuff': parseInt(e[61]) | 0,
                'SklBuff': parseInt(e[62]) | 0,
                'SpdBuff': parseInt(e[63]) | 0,
                'LckBuff': parseInt(e[64]) | 0,
                'DefBuff': parseInt(e[65]) | 0,
                'ResBuff': parseInt(e[66]) | 0,
                'MovBuff': parseInt(e[67]) | 0,
                'atkBuff': parseInt(e[68]) | 0,
                'hitBuff': parseInt(e[69]) | 0,
                'critBuff': parseInt(e[70]) | 0,
                'avoBuff': parseInt(e[71]) | 0,
                'cEvaBuff': parseInt(e[72]) | 0,
            };

            //Find and append weapons
            var itemArray = e.slice(34, 39);
            var eqptIndex = itemArray.indexOf(e[33]);
            if(eqptIndex != -1) { //if there is an equipped item, move it to the head of the list
                itemArray.splice(eqptIndex, 1);
                itemArray.splice(0, 0, e[33]);
            }

            for(var j = 0; j < itemArray.length; j++)
                currObj.inventory["itm" + j] = getItem(itemArray[j]);

            for(var k = 46; k < 51; k++)
                currObj.skills["skl" + (k-45)] = getSkill(e[k]);

            enemies["enmy_" + i] = currObj;
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

        height = (height / (boxWidth + gridWidth)) - 2;
        rows = rowNames.slice(0, height);

        var width = map.naturalWidth; //calculate the width of the map
        width = (width / (boxWidth + gridWidth)) - 2;

        for (var i = 0; i < width; i++)
            cols.push(i + 1);

        updateProgressBar();
        initializeTerrain();
    };

    function initializeTerrain() {
        terrainLocs = {};

        for (var r = 0; r < rows.length; r++)
            for (var c = 0; c < cols.length; c++)
                terrainLocs[rows[r]+cols[c]] = getDefaultTerrainObj();

        //Update terrain types from input list
        for (var r = 0; r < coordMapping.length; r++) {
            var row = coordMapping[r];
            for (var c = 0; c < cols.length && c < row.length; c++) {
                if (row[c].length > 0) terrainLocs[rows[r]+cols[c]].type = row[c];
            }
        }

        for (var c in characters)
            if (terrainLocs[characters[c].position] != undefined)
                terrainLocs[characters[c].position].occupiedAffiliation = "char";

        for (var e in enemies)
            if (terrainLocs[enemies[e].position] != undefined)
                terrainLocs[enemies[e].position].occupiedAffiliation = "enemy";

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
        if (str == undefined || str.length == 0) return "";
        else return str.substring(str.indexOf("\"") + 1, str.lastIndexOf("\""));
    };

    function calcExpPercent(exp) {
        if (exp.length < 3) return 0;

        var split = exp.split("/");
        var curr = parseInt(split[0].trim()) | 0;
        var nextRank = parseInt(split[1].trim()) | 0;

        if (curr == 0 || nextRank == 0) return 0;
        else return curr / nextRank;
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
                'type' : "Mystery",
                'desc' : "This item could not be located."
            }

        var copy = Object.assign({}, itemIndex[name]);
        copy.name = originalName;
        return copy;
    };

    function getSkill(name) {
        if (name == undefined || name.length == 0 || skillIndex[name] == undefined)
            return {
                'name': name != undefined ? name : "",
                'notes': "This skill could not be located."
            }
        else return skillIndex[name];
    };

    function getClass(name) {
        if (name == undefined || name.length == 0 || classIndex[name] == undefined)
            return {
                'name': name != undefined ? name : "",
                'desc': ""
            }
        else return classIndex[name];
    };
}]);
