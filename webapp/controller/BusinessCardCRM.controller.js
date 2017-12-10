sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller"
], function(jQuery, Controller) {
	"use strict";

	return Controller.extend("incentergy.bccrm.BusinessCardCRM.controller.BusinessCardCRM", {
		onInit: function() {
			this.googleClientId = "808339103735-t2k0j0vpcv34ac74ki1ntbno22hm2hfc.apps.googleusercontent.com";
			var me = this;
			jQuery.sap.includeScript("https://apis.google.com/js/api.js", "gapi", function() {
				me.afterGoogleApiLoaded();
			});
			// https://www.googleapis.com/auth/cloud-platform
			// https://www.googleapis.com/auth/cloud-vision	
		},
		afterGoogleApiLoaded: function() {
			var me = this;
			gapi.load('client:auth2', function() {
				gapi.auth2.init({
					client_id: me.googleClientId,
					scope: "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/cloud-vision"
				}).then(function() {
					me.auth2 = gapi.auth2.getAuthInstance();
					// Listen for sign-in state changes.
					me.auth2.isSignedIn.listen(function(isSignedIn) {
						me.updateSigninStatus(isSignedIn);
					});
					// Handle the initial sign-in state.
					me.updateSigninStatus(me.auth2.isSignedIn.get());

				});
			});
		},
		updateSigninStatus: function(isSignedIn) {
			this.byId("authorizeWithGoogle").setEnabled(!isSignedIn);
			this.byId("unauthorizeWithGoogle").setEnabled(isSignedIn);
		},
		unauthorizeWithGoogle: function() {
			gapi.auth2.getAuthInstance().signOut();
		},
		authorizeWithGoogle: function() {
			gapi.auth2.getAuthInstance().signIn();
		},
		onNavButtonPress: function() {
			var oSplitApp = this.getView().getParent().getParent();
			var oMaster = oSplitApp.getMasterPages()[0];
			oSplitApp.toMaster(oMaster, "flip");
		},
		onAddBusinessCard: function(oEvent) {
			// creating input on-the-fly
			var input = jQuery(document.createElement("input"));
			input.attr("type", "file");
			// add onchange handler if you wish to get the file :)
			input.trigger("click"); // opening dialog
		},
		processImage: function(oBlob) {
			var pPromise = new Promise(function (resolve, reject) {
				gapi.client.load("https://vision.googleapis.com/$discovery/rest", "v1", function() {
					gapi.client.setApiKey('******');
					var reader = new FileReader();
					reader.readAsDataURL(oBlob);
					reader.onloadend = function() {
						var base64data = reader.result;
						gapi.client.vision.images.annotate({
							"requests": [
							    {
							      "features": [
							        {
							          "type": "TEXT_DETECTION"
							        }
							      ],
							      "image": {
							        "content": base64data
							      }
							    }
							    ]
						}).then(resolve);
					}
				});
			});
			return pPromise;
		}
	});
});