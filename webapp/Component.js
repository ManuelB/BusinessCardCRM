sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"incentergy/bccrm/BusinessCardCRM/model/models",
	"incentergy/bccrm/BusinessCardCRM/model/LocalStorageModel"
], function(UIComponent, Device, models, LocalStorageModel) {
	"use strict";

	return UIComponent.extend("incentergy.bccrm.BusinessCardCRM.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
		
			var oComponentModel = new LocalStorageModel("BusinessCardCRM");
		    if(oComponentModel.getProperty("/BusinessCards") === undefined) {
		    	oComponentModel.setProperty("/BusinessCards", []);	
		    }
		    
			this.setModel(oComponentModel);
			
			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});