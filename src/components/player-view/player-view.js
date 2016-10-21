Polymer({
  is: 'player-view',
  properties: {
    showGroupPlayIcon: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
    },
    groups: {
      type: Array,
      value: [],
      reflectToAttribute: true
    }
  },
  ready: function() {
  },
  handleItemSelection : function(e) {
    this.fire('selected', [e.model.item]);
  },
  handleGroupSelection: function(e) {
    this.fire('selected', e.model.group.contracts.slice());
  },
  setDataModel: function(dataModel) {
    this.set('groups', dataModel);
  }
})