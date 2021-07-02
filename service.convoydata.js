app.service('ConvoyDataService', ['$rootScope', function($rootScope) {
    const sheetId = '1Y9xK4Dr02jSW_b_7pT6Cc25_qSwS2I6eeafECd2lu7k';
    var inventory;

    this.getItems = function() {
        return inventory;
    };

    this.loadConvoyData = function() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Convoy!A2:N',
        }).then(function(response) {
            var items = response.result.values;
            inventory = [];

            for (var i = 0; i < items.length; i++) {
                var c = items[i];
                if (c.length == 0 || c[0].length == 0) continue;

                var temp = {
                    'name': c[0],
                    'owner': c[1],
                    'type': c[2],
                    'stat': c[3],
                    'rank': c[4],
                    'might': parseInt(c[5]) | 0,
                    'hit': parseInt(c[6]) | 0,
                    'crit': parseInt(c[7]) | 0,
                    'crit%': parseInt(c[8]) | 0,
                    'critMod': parseInt(c[9]) | 0,
                    'avo': c[10],
                    'cEva': c[11],
                    'range': c[12],
                    'desc': c[13] != undefined ? c[13] : ""
                };

                if(temp.range != undefined)
                    temp.rangeVal = parseInt(temp.range.substring(temp.range.lastIndexOf("~") + 1).trim()) | 0;

                inventory.push(temp);
            }

            $rootScope.$broadcast('convoy-load-finished'); //signal end of load
        });
    };
}]);
