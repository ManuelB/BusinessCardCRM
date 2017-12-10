sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller"
], function(jQuery, Controller) {
	"use strict";

	return Controller.extend("incentergy.bccrm.BusinessCardCRM.controller.App", {
		onNavButtonPress: function() {
			var oSplitApp = this.getView().getParent().getParent();
			var oMaster = oSplitApp.getMasterPages()[0];
			oSplitApp.toMaster(oMaster, "flip");
		}
	});
});