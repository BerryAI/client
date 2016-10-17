var request = require("request");
var fs = require("fs");
function MusicoinConnector(blockchain) {
    this.blockchain = blockchain;
    this.musicoinCatalogURL = "http://dev.catalog.musicoin.org/api/license/search";
    this.musicoinListURL = "http://catalog.musicoin.org/api/pages/list";
    this.musicoinContentURL = "http://catalog.musicoin.org/api/page/content";
    this.musicoinMyWorksURL = "http://dev.catalog.musicoin.org/api/myworks";
    this.favoritesFile = 'favorites.json';
    this.playbackPaymentPercentage = 70;
}

MusicoinConnector.prototype.loadMyWorks = function(callback) {
    var propertiesObject = { address:blockchain.getSelectedAccount()};
    request({
        url: this.musicoinMyWorksURL,
        qs: propertiesObject,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200 && body && body.success) {
            var output = [];
            body.result.forEach(function(next) {
                output.push(this.createContractItemFromAddress(next.contract_id));
            }.bind(this));
            callback(output);
        }
        else {
            console.log(error);
        }
    }.bind(this));
};

MusicoinConnector.prototype.loadContractsFromURL = function(page, keywords, callback) {
    if (page == "favorites") {
        callback(this.loadFavoritesFromFile(callback));
        return;
    }

    var propertiesObject = { page_id:page, query: keywords};
    request({
        url: this.musicoinContentURL,
        qs: propertiesObject,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(this.convertCategoryFormat(body.content));
        }
        else {
            console.log(error);
        }
    }.bind(this))
};

MusicoinConnector.prototype.getPlaybackPaymentPercentage = function() {
    return this.playbackPaymentPercentage;
}

MusicoinConnector.prototype.convertCategoryFormat = function(serverFormat) {
    var output = [];
    var categories = serverFormat;
    for (var c in categories) {
        output.push(this.createContractGroup(categories[c]));
    }
    return output;
};

MusicoinConnector.prototype.addFavorite = function(contractId) {
    fs.readFile(this.favoritesFile, 'utf8', function (err, data) {
        if (err) throw err;
        var contractIds = JSON.parse(data);
        if (!contractIds.includes(contractId)) {
            contractIds.push(contractId);
            fs.writeFile(fileName, JSON.stringify(contractIds), function (err) {
                if (err)
                    console.log(err);
                else
                    console.log("Added favorite! " + contractId);
            });
        }
    }.bind(this));
};

MusicoinConnector.prototype.loadFavoritesFromFile = function(callback) {
    fs.readFile(this.favoritesFile, 'utf8', function (err, data) {
        if (err) throw err;
        var contractIds = JSON.parse(data);
        var items = [];
        contractIds.forEach(function(contract) {
            items.push(this.createContractItemFromAddress(contract));
        }.bind(this))
        callback([{name: "Favorites", contracts: items}]);
    }.bind(this));
};


MusicoinConnector.prototype.createContractGroup = function(serverGroup) {
    var group = {name: serverGroup.title, contracts: []};
    serverGroup.result.forEach(function(item){
        group.contracts.push(this.createContractItemFromAddress(item.contract_id));
    }.bind(this));
    return group;
};

MusicoinConnector.prototype.createContractItemFromAddress = function(_contractId) {
    var ppp = this.blockchain.getContractInstance(_contractId);
    var metadata = JSON.parse(ppp.metadata());
    return {
        contractId: _contractId,
        album: metadata.album,
        artist: metadata.artist,
        track: metadata.track,
        playCount: ppp.playCount(),
        img: musicoin.convertToUrl(metadata.artworkUrl)
    };
};

MusicoinConnector.prototype.getCategories = function(callback) {
    request({
        url: this.musicoinListURL,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var output = body.pages;
            output.push({id: "favorites", name: "My Favorites"});
            callback(output);
        }
        else {
            console.log(error);
        }
    }.bind(this));
};