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
    },
    releasePending: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
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
    this.addressToNameMapping = [];
    this.status = this.license.address ? this.license.address : "Unreleased";
  },

  toggleLicenseBody: function() {
    this.expanded = !this.expanded;
  },

  releaseLicense: function(e) {
    e.stopPropagation();
    this.fire('release-license', {
      license: this.license,
      audioFile: this.selectedAudio,
      work: this.work,
      editor: this
    })
  },

  _computeRemainingCoinsPerPlay: function(coinsPerPlay, change) {
    return coinsPerPlay - this.sumOfRoyalties(this.license.royalties);
  },

  _computeLicenseText: function(address, status) {
    if (status) return status;
    return address ? address : "Unreleased";
  },

  _shouldHideShareholderMessage: function(e) {
    return this.license.contributors.length == 0 || this.sumOfRoyalties(this.license.royalties) == 0;
  },

  _shouldHideRoyaltyInstructions: function(e) {
    return this.license.contributors.length > 0 || this.license.royalties.length > 0;
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
      this.addressToNameMapping[item.address] = item.name;
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

  addNewRoyalty : function() {
    if (!this.license.editable) return;
    this.push('license.royalties', {
      name: '',
      address: '',
      amount: 0
    });
  },

  addNewContributor : function() {
    if (!this.license.editable) return;
    this.push('license.contributors', {
      name: '',
      address: '',
      shares: 1
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
    for (var addr in this.addressToNameMapping) {
      if (this.addressToNameMapping[addr] == name) {
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
    var found = this.addressToNameMapping[addr] || "(name)";
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
  },

  onReleasePending: function() {
    this.status = "Pending...";
    this.releasePending = true;
  },

  onReleaseSuccess: function(address) {
    this.status = address;
    this.releasePending = false;
    this.set("license.address", address);
    this.set("license.editable", false);
  },

  onReleaseFailure: function() {
    this.releasePending = false;
    this.status = "Failed!";
    console.log("Failed");
  }
});