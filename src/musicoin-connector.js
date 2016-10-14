var request = require("request");
var fs = require("fs");
function MusicoinConnector(web3) {
    this.web3 = web3;
    this.musicoinCatalogURL = "http://dev.catalog.musicoin.org/api/license/search";
}

MusicoinConnector.prototype.loadContractsFromURL = function(page, callback) {
    if (page == "favorites") {
        callback(this.loadFavoritesFromFile(callback));
        return;
    }

    var that = this;
    request({
        url: that.musicoinCatalogURL,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var output = [];
            output.push(that.createContractGroup({name: page + ": Group 1", contracts: body}));

            // TODO: Just faking it until we get more groups
            output.push(that.createContractGroup({name: page + ": Group 2", contracts: body}));
            callback(output);
        }
        else {
            console.log(error);
        }
    })
};


MusicoinConnector.prototype.addFavorite = function(contractId) {
    fs.readFile('favorites.json', 'utf8', function (err, data) {
        if (err) throw err;
        var contractIds = JSON.parse(data);
        if (!contractIds.includes(contractId)) {
            contractIds.push(contractId);
            fs.writeFile('favorites.json', JSON.stringify(contractIds), function (err) {
                if (err)
                    console.log(err);
                else
                    console.log("Added favorite! " + contractId);
            });
        }
    });
};

MusicoinConnector.prototype.loadFavoritesFromFile = function(callback) {
    var that = this;
    fs.readFile('favorites.json', 'utf8', function (err, data) {
        if (err) throw err;
        var contractIds = JSON.parse(data);
        var items = [];
        for (var idx in contractIds) {
            items.push(that.createContractItemFromAddress(contractIds[idx]));
        }
        callback([{name: "Favorites", contracts: items}]);
    });
};


MusicoinConnector.prototype.createContractGroup = function(serverGroup) {
    var group = {name: serverGroup.name, contracts: []};
    var that = this;
    serverGroup.contracts.forEach(function(item){
        group.contracts.push(that.createContractItemFromAddress(item.contract_id));
    });
    return group;
};

MusicoinConnector.prototype.createContractItemFromAddress = function(_contractId) {
    var ppp = this.web3.eth.contract(musicoin.getContractAbiFromCatalog(_contractId)).at(_contractId);
    var metadata = JSON.parse(ppp.metadata());
    return {
        contractId: _contractId,
        album: metadata.album,
        artist: metadata.artist,
        track: metadata.track,
        img: musicoin.convertToUrl(metadata.artworkUrl)
    };
};

MusicoinConnector.prototype.getCategories = function() {
    // TODO: Get this list from the server
    return [
        {id: "new", name: "New Releases"},
        {id: "coinboard", name: "Coinboard"},
        {id: "favorites", name: "My Favorites"}
    ];
};