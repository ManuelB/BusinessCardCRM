sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"incentergy/bccrm/BusinessCardCRM/model/models",
	"openui5/community/model/firebase/FirebaseModel"
], function(UIComponent, Device, models, FirebaseModel) {
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
			var oFBConfig = {
			    apiKey: "AIzaSyB98nY09BXBnx3n5GVMlw0GD06tiRcq6xg",
			    authDomain: "businesscardcrm.firebaseapp.com",
			    databaseURL: "https://businesscardcrm.firebaseio.com",
			    projectId: "businesscardcrm",
			    storageBucket: "",
			    messagingSenderId: "906525357736"
			};
			var oComponentModel = new FirebaseModel(null, oFBConfig);
			// Login to firebase
			oComponentModel.getFirebasePromise().then(function(firebase){
			    firebase.auth().signInAnonymously().catch(function(error) {
			        // Handle Errors here.
			        var errorCode = error.code;
			        var errorMessage = error.message;
			        // Do something. Panic is acceptable
			        jQuery.sap.log.error(errorCode+" "+errorMessage);
			    });
			});
			this.setModel(oComponentModel);
			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});