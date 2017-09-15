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
            range: 'Convoy!A2:M',
        }).then(function(response) {
            var items = response.result.values;
            inventory = [];

            for (var i = 0; i < items.length; i++) {
                var c = items[i];
                if (c[0].length > 0) {
                    inventory.push({
                        'name': c[0],
                        'itemType': c[1],
                        'rank': c[3],
                        'might': parseInt(c[5]) | 0,
                        'hit': parseInt(c[6]) | 0,
                        'crit': parseInt(c[7]) | 0,
                        'critChanceMod': parseInt(c[8]) | 0,
                        'critDmgMod': parseInt(c[9]) | 0,
                        'avo': c[10],
                        'eva': c[11],
                        'range': parseInt(c[12].substring(c[12].lastIndexOf("~")).trim()) | 0,
                        'effect': c[13],
                        s
                    })
                }
            }

            $rootScope.$broadcast('convoy-load-finished'); //signal end of load
        });
    };
}]);
