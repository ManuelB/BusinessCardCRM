sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller"
], function(jQuery, Controller) {
	"use strict";

	return Controller.extend("incentergy.bccrm.BusinessCardCRM.controller.BusinessCardCRM", {
		onAddBusinessCard: function(oEvent) {
			// creating input on-the-fly
	        var input = jQuery(document.createElement("input"));
	        input.attr("type", "file");
	        // add onchange handler if you wish to get the file :)
	        input.trigger("click"); // opening dialog
		}
	});
});