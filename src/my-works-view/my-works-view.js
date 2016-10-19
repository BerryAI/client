// var ipfsUtil = require('../ipfs-connector.js');
Polymer({
    is: 'my-works-view',
    ready: function() {
        this.ipfsUtils = new IPFSConnector();
        this.$.worksView.addEventListener('selected', function(e) {
            this.handleWorkSelection(e.detail);
        }.bind(this));

        this.$.workEditor.addEventListener('selected', function(e) {
            this.showLicenseDetail(e.detail);
        }.bind(this));

        this.$.workEditor.addEventListener('back-clicked', function(e){
            this.showView(this.$.worksView);
        }.bind(this));

        this.$.workEditor.addEventListener('release-work', function(e){
            this.releaseWork(e.detail);
        }.bind(this));

        // this event bubbles up from all child license editors.
        this.$.workEditor.addEventListener('release-license', function(e){
            this.releaseLicense(e.detail);
        }.bind(this));
    },

    setDataModel: function(works) {
        this.$.worksView.setDataModel(works);
    },

    handleWorkSelection: function(work) {
        this.selectedWork = work[0];
        this.$.workEditor.setDataModel({
            work: this.selectedWork,
            editable: false,
            metadata: [{key: "test", value:"Value"}],
            licenses: [] // TODO: we need to load licenses associated with this work
        });
        this.showView(this.$.workEditor);
    },

    handleAddNewWork: function() {
        this.$.workEditor.setDataModel(this.createNewWork());
        this.showView(this.$.workEditor);
    },

    createNewWork: function() {
        return {
            work: {
                track: "New Work",
                img: "",
                metadata: [],
                licenses: []
            },
            editable: true
        }
    },

    releaseLicense: function(releaseEvent) {
        var license = releaseEvent.license;
        var work = releaseEvent.work;
        var editor = releaseEvent.editor;
        var licenseReleaseRequest = {
          workAddress: work.contractId,
          coinsPerPlay: license.coinsPerPlay,
          resourceUrl: "",
          metadataUrl: "",
          royalties: license.royalties.map(function (r) {return r.address}),
          royaltyAmounts: license.royalties.map(function (r) {return r.amount}),
          contributors: license.contributors.map(function (r) {return r.address}),
          contributorShares: license.contributors.map(function (r) {return r.shares}),
        }
        this.ipfsUtils.add(releaseEvent.audioFile)
          .then(function (hash) {
              licenseReleaseRequest.resourceUrl = "ipfs://" + hash;
              licenseReleaseRequest.metadataUrl = "ipfs://metadataUrl"; // TODO:
              blockchain.releaseLicense(licenseReleaseRequest, musicoin.password, {
                  onSuccess: function (address) {
                      license.address = address;
                      editor.onReleaseSuccess(address);
                      console.log("Success! Contract address: " + address);
                  },
                  onTransaction: function (tx) {
                      editor.onReleasePending(tx);
                      console.log(tx);
                  },
                  onFailure: function (err) {
                      editor.onReleaseFailure(err);
                      console.log(err);
                  }
              });
          })
    },

    releaseWork: function (releaseEvent) {
        var work = releaseEvent.work;
        var editor = releaseEvent.editor;
        var workReleaseRequest = {
            type: work.type,
            title: work.track,
            artist: work.artist,
            imageUrl: "",
            metadataUrl: ""
        }
        this.ipfsUtils.add(work.imgFile)
          .then(function (hash) {
              workReleaseRequest.imageUrl = "ipfs://" + hash;
              workReleaseRequest.metadataUrl = "ipfs://metadataUrl"; // TODO:
              blockchain.releaseWork(workReleaseRequest, musicoin.password, {
                  onSuccess: function (address) {
                      work.address = address;
                      editor.onReleaseSuccess(address);
                      console.log("Success! Contract address: " + address);
                  },
                  onTransaction: function (tx) {
                      editor.onReleasePending(tx);
                      console.log(tx);
                  },
                  onFailure: function (err) {
                      editor.onReleaseFailure(err);
                      console.log(err);
                  }
              });
          })
    },

    showView: function(element) {
        this.$.worksView.style.display = 'none';
        this.$.workEditor.style.display = 'none';
        element.style.display = 'block';
    }
})