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

    releaseLicense: function(license) {
        alert("Releasing License: " + JSON.stringify(license));
    },

    releaseWork: function(work) {
        alert("Releasing Work: " + JSON.stringify(work));
    },

    showView: function(element) {
        this.$.worksView.style.display = 'none';
        this.$.workEditor.style.display = 'none';
        element.style.display = 'block';
    }
})