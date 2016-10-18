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
    this.$.fileSelector.onclick = function() {
      if (this.editable) {
        this.$.imageFile.click();
      }
    }.bind(this);

    this.$.imageFile.onchange = function() {
      if (!this.editable) return;
      var filePath = this.$.imageFile.value;
      if (filePath) {
        this.set('work.img', filePath.split("\\").join("/"));
      }
    }.bind(this);
  },

  setDataModel: function (newModel) {
    this.work = newModel.work;
    this.editable = newModel.editable;
  },

  printData: function () {
    console.log(JSON.stringify(this.getDataObject()));
  },

  getDataObject: function () {
    return this.work;
  },

  releaseWork: function() {
    this.fire('release-work', this.getDataObject());
  },

  handleBackClick: function () {
    this.fire('back-clicked');
  },

  handleAddLicense: function (input) {
    this.push('work.licenses', this.createNewLicense());
  },

  releaseLicense: function(e) {
    alert("Releasing license from custom event: " + JSON.stringify(e.detail));
  },

  createNewLicense: function() {
    return {
      type: 0,
      typeName: "PPP",
      price: 1,
      address: "",
      editable: true,
      contributors: [],
      royalties: [],
      metadata: []
    }
  }
});