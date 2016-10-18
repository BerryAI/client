Polymer({
  is: 'license-editor',
  properties: {
    license: {
      type: Object,
      reflectToAttribute: true
    },
    work: {
      type: Object,
      reflectToAttribute: true
    },
    expanded: {
      type: Boolean,
      value: false
    }
  },
  ready: function () {
    this.$.audioFile.onchange = function() {
      this._updateSelectedFile();
    }.bind(this);

    this.$.fileSelector.onclick = function() {
      if (this.license.editable) {
        this.$.audioFile.click();
      }
    }.bind(this);

    this.selectedAudioText = "Select audio file";
  },

  toggleLicenseBody: function() {
    this.expanded = !this.expanded;
  },

  releaseLicense: function(e) {
    e.stopPropagation();
    this.fire('release-license', {
      license: this.license,
      work: this.work
    })
  },

  _computeRemainingPrice: function(price, change) {
    return price - this.sumOfRoyalties(this.license.royalties);
  },

  _computeLicenseText: function(address) {
    return address ? address : "Unreleased";
  },

  sumOfRoyalties: function(royalties) {
    var total = 0;
    royalties.forEach(function (r) {
      total += r.amount;
    })
    return total;
  },

  updateUserMapping: function (e) {
    var item = e.model.royalty ? e.model.royalty : e.model.contributor;
    if (item)
      addressToNameMapping[item.address] = item.name;
  },

  addContributorOnEnter: function (e) {
    if (!this.license.editable) return;
    var that = this;
    this.processAndClearOnEnter(e, function(value) {
      that.addContributor(value);
    });
  },

  addRoyaltyOnEnter: function (e) {
    if (!this.license.editable) return;
    var that = this;
    this.processAndClearOnEnter(e, function(value) {
      that.addRoyalty(value);
    });
  },

  processAndClearOnEnter: function(e, callback) {
    if (e.keyCode === 13) {
      var name = e.currentTarget.value;
      e.currentTarget.value = '';
      callback(name);
    }
  },

  addContributor: function(input) {
    if (!this.license.editable) return;
    var contributor = this.isAddress(input)
      ? this.lookupContributorByAddress(input)
      : this.lookupContributorByName(input); // just testing delete function
    if (contributor) {
      this.push('license.contributors', {
        name: contributor.name,
        address: contributor.address,
        shares: 1
      });
    }
  },

  addRoyalty: function(input) {
    if (!this.license.editable) return;
    var contributor = this.isAddress(input)
      ? this.lookupContributorByAddress(input)
      : this.lookupContributorByName(input); // just testing delete function
    if (contributor) {
      this.push('license.royalties', {
        name: contributor.name,
        address: contributor.address,
        amount: 1
      });
    }
  },

  isAddress: function(value) {
    return value.startsWith("0x");
  },

  lookupContributorByName: function (name) {
    var found;
    for (var addr in addressToNameMapping) {
      if (addressToNameMapping[addr] == name) {
        found = addr;
      }
    }
    if (found) {
      return {
        name: name,
        address: found
      };
    }
  },

  lookupContributorByAddress: function (addr) {
    var found = addressToNameMapping[addr] || "(name)";
    return {
      name: found,
      address: addr
    }; // testing
  },

  removeContributor: function (e) {
    if (!this.license.editable) return;
    this.splice('license.contributors', e.model.index, 1);
  },

  removeRoyalty: function (e) {
    if (!this.license.editable) return;
    this.splice('license.royalties', e.model.index, 1);
  },

  selectFile: function(e) {
    if (!this.license.editable) return;
    this.$.audioFile.click(e);
  },

  updateMapping: function(address) {
    this.royalties.forEach(function(value) {
      if (value.address == address) {
        console.log("Setting mapping: " + value.address + " => " + value.name);
      }
    });
  },

  _updateSelectedFile: function() {
    if (!this.license.editable) return;
    var filePath = this.$.audioFile.value;
    if (filePath) {
      this.set('selectedAudio', filePath);
      var stats = fs.statSync(filePath);
      var fileSizeInBytes = stats["size"];
      var fileSizeInMegabytes = fileSizeInBytes / 1000000.0
      this.$.metadataEditor.addMetadata("fileName", path.basename(filePath));
      this.set('selectedAudioText', path.basename(filePath));
      this.set('selectedAudioSize', fileSizeInMegabytes.toFixed(1) + " mb");
    }
  }
});