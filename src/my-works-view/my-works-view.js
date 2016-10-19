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
            if (this.worksDataIsDirty) {
                console.log("Forcing MyWorks to refresh because it's dirty!");
                getMusicoin().updateMyWorksView();
            }
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
        this.worksDataIsDirty = false;
    },

    handleWorkSelection: function(work) {
        this.setSelectedWork(work[0]);
    },

    handleAddNewWork: function() {
        // create a new work, but don't add it to the "works" page until it's been released
        this.setSelectedWork(this.createNewWork());
    },

    setSelectedWork: function(work) {
        this.selectedWork = work;
        this.$.workEditor.setDataModel({
            work: this.selectedWork,
            editable: !this.selectedWork.address
        });
        this.showView(this.$.workEditor);
    },

    createNewWork: function() {
        return {
            track: "New Work",
            img: "",
            metadata: [],
            licenses: []
        }
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
        var imgFileUrlPromise = this.ipfsUtils.add(work.imgFile);
        var metadataFileUrlPromise = this.ipfsUtils.addString(JSON.stringify(work.metadata));

        Promise.all([imgFileUrlPromise, metadataFileUrlPromise]).then(function (hashes) {
            workReleaseRequest.imageUrl = "ipfs://" + hashes[0];
            workReleaseRequest.metadataUrl = "ipfs://" + hashes[1];
            blockchain.releaseWork(workReleaseRequest, musicoin.password, {
                onSuccess: function (address) {
                    // TODO: We need to indicate the the grid view is dirty.  We can't
                    // just add this work directly because the grid view is grouped/filtered
                    // on the server (potentially) so it needs to be refreshed.
                    this.worksDataIsDirty = true;
                    work.address = address;
                    editor.onReleaseSuccess(address);
                    console.log("Success! Contract address: " + address);
                }.bind(this),
                onTransaction: function (tx) {
                    editor.onReleasePending(tx);
                    console.log(tx);
                },
                onFailure: function (err) {
                    editor.onReleaseFailure(err);
                    console.log(err);
                }
            });
        }.bind(this));
    },

    releaseLicense: function(releaseEvent) {
        var license = releaseEvent.license;
        var work = this.selectedWork;
        var editor = releaseEvent.editor;
        var licenseReleaseRequest = {
          workAddress: work.address,
          coinsPerPlay: license.coinsPerPlay,
          resourceUrl: "",
          metadataUrl: "",
          royalties: license.royalties.map(function (r) {return r.address}),
          royaltyAmounts: license.royalties.map(function (r) {return r.amount}),
          contributors: license.contributors.map(function (r) {return r.address}),
          contributorShares: license.contributors.map(function (r) {return r.shares}),
        };

        var audioFileUrlPromise = this.ipfsUtils.add(releaseEvent.audioFile);
        var metadataFileUrlPromise = this.ipfsUtils.addString(JSON.stringify(license.metadata));

        Promise.all([audioFileUrlPromise, metadataFileUrlPromise]).then(function (hashes) {
            licenseReleaseRequest.resourceUrl = "ipfs://" + hashes[0];
            licenseReleaseRequest.metadataUrl = "ipfs://" + hashes[1];
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
        });
    },

    showView: function(element) {
        this.$.worksView.style.display = 'none';
        this.$.workEditor.style.display = 'none';
        element.style.display = 'block';
    }
})