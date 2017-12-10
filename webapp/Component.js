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
				var provider = new firebase.auth.GoogleAuthProvider();
			    firebase.auth().signInWithPopup(provider).then(function(result) {
				  // This gives you a Google Access Token. You can use it to access the Google API.
				  var token = result.credential.accessToken;
				  // The signed-in user info.
				  var user = result.user;
				  window.localStorage.firebaseGoogleToken = token;
				  
				}).catch(function(error) {
				  // Handle Errors here.
				  var errorCode = error.code;
				  var errorMessage = error.message;
				  // The email of the user's account used.
				  var email = error.email;
				  // The firebase.auth.AuthCredential type that was used.
				  var credential = error.credential;
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