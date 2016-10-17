Polymer({
  is: 'work-editor',
  properties: {
    work: {
      type: Object,
    },
    licenses: {
      type: Array,
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
  },

  setDataModel: function (newModel) {
    this.work = newModel.work;
    this.editable = newModel.editable;
    this.licenses = newModel.licenses || [];
  },

  printData: function () {
    console.log(JSON.stringify(this.getDataObject()));
  },

  getDataObject: function () {
    return {
      licenses: this.licenses,
      workType: this.workTypeIdx
    }
  },

  handleBackClick: function () {
    this.fire('back-clicked');
  },

  handleAddLicense: function (input) {
    this.fire('add-license');
  },

  viewLicense: function (e) {
    this.fire('selected', e.model.license)
  },

  removelicense: function (e) {
    if (!this.editable) return;
    this.splice('licenses', e.model.index, 1);
  }
});