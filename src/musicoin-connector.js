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

  this.workTypes = {
    score: 0,
    lyrics: 1,
    recording: 2
  }
}

MusicoinConnector.prototype.loadMyWorks = function (callback) {
  var propertiesObject = {address: blockchain.getSelectedAccount()};
  request({
    url: this.musicoinMyWorksURL,
    qs: propertiesObject,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200 && body && body.success) {
      var unlisted = [];
      var listed = [];
      // body.result.forEach(function (next) {
      //   var work = this.createWorkFromServerItem(next);
      //   if (next.is_listed) {
      //     listed.push(work);
      //   }
      //   else {
      //     unlisted.push(work)
      //   }
      // }.bind(this));

      // var ourTimesWork = "0x2090ca20502b06f99026d78ec97bc00a993ed069";
      this.blockchain.listWorksForOwner(blockchain.getSelectedAccount())
        .then(function (works) {
          // get a promise for each work's license list
          var allLicensesPromises = works.map(function(work) {
            return this.blockchain.listLicensesForWork(work)
          }.bind(this));

          // wait for them to return, then put them back together with the work
          Promise.all(allLicensesPromises).then(function(licenseLists) {
            var allLocal = works.map(function(work, idx) {
              return this.createWorkFromAddress(work, licenseLists[idx]);
            }.bind(this));

            callback([
              {name: "Listed", contracts: listed},
              {name: "Unlisted", contracts: unlisted},
              {name: "Local", contracts: allLocal}
            ]);

          }.bind(this));
        }.bind(this));
    }
    else {
      console.log(error);
    }
  }.bind(this));
};

MusicoinConnector.prototype.getWorkLicenseAddresses = function(workAddress) {
  return this.blockchain.listLicensesForWork(workAddress)
}

MusicoinConnector.prototype.loadContractsFromURL = function (page, keywords, callback) {
  if (page == "local") {
    this.blockchain.listRecentLicenses(10000).then(function (list) {
      var items = [];
      list.forEach(function (licenseAddress) {
        var contract = this.createContractItemFromAddress(licenseAddress);
        if (contract) items.push(contract);
      }.bind(this));
      callback([{name: "Favorites", contracts: items}]);
    }.bind(this));
    return;
  }


  if (page == "favorites") {
    callback(this.loadFavoritesFromFile(callback));
    return;
  }

  var propertiesObject = {page_id: page, query: keywords};
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

MusicoinConnector.prototype.getPlaybackPaymentPercentage = function () {
  return this.playbackPaymentPercentage;
}

MusicoinConnector.prototype.convertCategoryFormat = function (serverFormat) {
  var output = [];

  var categories = serverFormat;
  for (var c in categories) {
    output.push(this.createContractGroup(categories[c]));
  }
  return output;
};

MusicoinConnector.prototype.addFavorite = function (contractId) {
  var contractIds = this.loadFavoritesIdsSync();
  if (!contractIds.includes(contractId)) {
    contractIds.push(contractId);
    fs.writeFile(this.favoritesFile, JSON.stringify(contractIds), function (err) {
      if (err)
        console.log(err);
      else
        console.log("Added favorite! " + contractId);
    });
  }
};

MusicoinConnector.prototype.loadFavoritesIdsSync = function() {
  console.log("home: " + process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local'));
  var favsText = fs.existsSync(this.favoritesFile)
    ? fs.readFileSync(this.favoritesFile, 'utf8')
    : "";
  var contractIds = [];
  if (favsText) {
    try {
      contractIds = JSON.parse(favsText);
    }
    catch (e) {
      console.log(e);
    }
  }
  return contractIds;
};

MusicoinConnector.prototype.loadFavoritesFromFile = function (callback) {
  fs.readFile(this.favoritesFile, 'utf8', function (err, data) {
    if (err) throw err;
    var contractIds = this.loadFavoritesIdsSync();
    var items = [];
    contractIds.forEach(function (addr) {
      var contract = this.createContractItemFromAddress(addr);
      if (contract) items.push(contract);
    }.bind(this))
    callback([{name: "Favorites", contracts: items}]);
  }.bind(this));
};


MusicoinConnector.prototype.createContractGroup = function (serverGroup) {
  var group = {name: serverGroup.title, contracts: []};
  serverGroup.result.forEach(function (item) {
    var contract = this.createContractItemFromAddress(item.contract_id);
    if (contract != null) group.contracts.push(contract);
  }.bind(this));

  return group;
};

MusicoinConnector.prototype.createContractItemFromAddress = function (_contractId) {
  try {
    var ppp = this.blockchain.getLicenseContractInstance(_contractId);
    var work = this.blockchain.getWorkContractInstance(ppp.workAddress());
    console.log(_contractId + " workAddress: " + ppp.workAddress());
    console.log(_contractId + " weiPerPlay: " + ppp.weiPerPlay());
    console.log(_contractId + " playCount: " + ppp.playCount());
    console.log(_contractId + " artists: " + work.artist());
    console.log(_contractId + " title: " + work.title());
    return {
      contractId: _contractId,
      album: "",
      artist: work.artist(),
      track: work.title(),
      playCount: ppp.playCount(),
      img: musicoin.convertToUrl(work.imageUrl())
    };
  }
  catch (e) {
    console.log("Could not createContract from address: " + e);
    return null;
  }
};

MusicoinConnector.prototype.getCategories = function (callback) {
  request({
    url: this.musicoinListURL,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var output = body.pages;
      output.push({id: "favorites", name: "My Favorites"});
      output.push({id: "local", name: "Local"});
      callback(output);
    }
    else {
      console.log(error);
    }
  }.bind(this));
};

MusicoinConnector.prototype.createWorkFromAddress = function (_contractId, licenseAddresses) {
  var work = this.blockchain.getWorkContractInstance(_contractId);
  return {
    contractId: _contractId,
    album: "",
    artist: work.artist(),
    track: work.title(),
    type: work.workType(),
    img: musicoin.convertToUrl(work.imageUrl()),
    metadata: this.loadMetadataFromUrl(musicoin.convertToUrl(work.metadataUrl())),
    licenses: licenseAddresses.map(this.getLicenseDetails)
  };
};

MusicoinConnector.prototype.getLicenseDetails = function(licenseAddress) {
  var license = this.blockchain.getLicenseContractInstance(licenseAddress);
  var _buildContributorsFromLicense = function (license) {

    var address;
    var output = [];
    for (var idx = 0; ((address = license.contributors(idx)) != "0x"); idx++) {
      output.push({
        address: address,
        shares: license.contributorShares(idx)});
    }
    return output;
  };

  var _buildRoyaltiesFromLicense = function (license) {
    var address;
    var output = [];
    for (var idx = 0; ((address = license.royalties(idx)) != "0x"); idx++) {
      output.push({
        address: address,
        amount: this.blockchain.toMusicCoinUnits(license.royaltyAmounts(idx))
      });
    }
    return output;
  }.bind(this);

  return {
    type: 0,
    typeName: "PPP",
    coinsPerPlay: this.blockchain.toMusicCoinUnits(license.weiPerPlay()),
    address: licenseAddress,
    editable: false,
    releaseState: 3,
    contributors: _buildContributorsFromLicense(license),
    royalties: _buildRoyaltiesFromLicense(license),
    metadata: [{key: "testKey", value: "testValue"}]
  }
};

MusicoinConnector.prototype.loadMetadataFromUrl = function(url) {
  // TODO
  return [];
};

MusicoinConnector.prototype.createWorkFromServerItem = function (serverItem) {
  return {
    contractId: serverItem.contract_id,
    album: serverItem.album_name,
    artist: serverItem.artist_name,
    track: serverItem.song_name,
    type: this.workTypes.recording,
    img: musicoin.convertToUrl(serverItem.artworkUrl),
    metadata: [], // TODO: This will need to be loaded from the file in IPFS
    licenses: [{
      type: 0,
      typeName: "PPP",
      coinsPerPlay: 1,
      address: serverItem.contract_id,
      editable: false,
      contributors: [], //
      royalties: [],
      metadata: []
    }],
  };
};