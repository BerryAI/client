Polymer({
    is: 'my-works-view',
    ready: function() {
        this.$.worksView.addEventListener('selected', function(e) {
            this.handleWorkSelection(e.detail);
        }.bind(this));

        this.$.workEditor.addEventListener('selected', function(e) {
            this.showLicenseDetail(e.detail);
        }.bind(this));

        this.$.workEditor.addEventListener('back-clicked', function(e){
            this.showView(this.$.worksView);
        }.bind(this));

        this.$.workEditor.addEventListener('add-license', function(){
            this.addNewLicense();
        }.bind(this));

        this.$.licenseEditor.addEventListener('back-clicked', function(e) {
            this.showView(this.$.workEditor);
        }.bind(this));

        this.$.licenseEditor.addEventListener('release', function(e) {
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
                img: ""
            },
            editable: true,
            licenses: []
        }
    },

    addNewLicense: function() {
        this.$.licenseEditor.setDataModel({
            work: this.selectedWork,
            license: {},
            editable: true
        });
        this.showView(this.$.licenseEditor);
    },

    showLicenseDetail: function(license) {
        this.$.licenseEditor.setDataModel({
            work: this.selectedWork,
            license: license,
            editable: false
        });
        this.showView(this.$.licenseEditor);
    },

    releaseLicense: function(license) {
        alert("Releasing: " + JSON.stringify(license));
    },

    showView: function(element) {
        this.$.licenseEditor.style.display = 'none';
        this.$.worksView.style.display = 'none';
        this.$.workEditor.style.display = 'none';
        element.style.display = 'block';
    }
})