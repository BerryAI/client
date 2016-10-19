Polymer({
  is: 'work-editor',
  properties: {
    work: {
      type: Object,
    },
    editable: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
    }
  },
  ready: function () {
    this.editable = true;
    this.licenses = [];
    this.metadata = [];
    this.releaseButtonText = "Release";
    this.$.fileSelector.onclick = function() {
      if (this.editable) {
        this.$.imageFile.click();
      }
    }.bind(this);

    this.$.imageFile.onchange = function() {
      if (!this.editable) return;
      var filePath = this.$.imageFile.value;
      if (filePath) {
        var corrected = "file:///" + filePath.split("\\").join("/");
        console.log("img path: " + filePath);
        console.log("img src: " + corrected);

        this.set('work.img', corrected);
        this.set('work.imgFile', filePath);
      }
    }.bind(this);
  },

  setDataModel: function (newModel) {
    this.work = newModel.work;
    this.editable = newModel.editable;
    this.status = this.work.contractId ? this.work.contractId : "";
  },

  printData: function () {
    console.log(JSON.stringify(this.getDataObject()));
  },

  getDataObject: function () {
    return this.work;
  },

  releaseWork: function() {
    this.fire('release-work', {
      editor: this,
      work: this.getDataObject()});
  },

  handleBackClick: function () {
    this.fire('back-clicked');
  },

  handleAddLicense: function (input) {
    this.push('work.licenses', this.createNewLicense());
  },

  onReleasePending: function() {
    this.status = "Pending...";
    this.releasePending = true;
  },

  onReleaseSuccess: function(address) {
    this.status = address;
    this.releasePending = false;
    this.set("work.address", address);
    this.editable = false;
  },

  onReleaseFailure: function(err) {
    this.releasePending = false;
    this.status = "Failed!";
    console.log("Filed to release work: " + err);
  },

  createNewLicense: function() {
    return {
      type: 0,
      typeName: "PPP",
      coinsPerPlay: 1,
      address: "",
      editable: true,
      contributors: [],
      royalties: [],
      metadata: []
    }
  }
});