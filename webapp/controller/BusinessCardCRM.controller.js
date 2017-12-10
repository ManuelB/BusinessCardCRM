sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller"
], function(jQuery, Controller) {
	"use strict";

	return Controller.extend("incentergy.bccrm.BusinessCardCRM.controller.BusinessCardCRM", {
		onInit: function() {
			var me = this;
			this._gApiLoaded = new Promise(function(resolve) {
				jQuery.sap.includeScript("https://apis.google.com/js/api.js", "gapi", function() {
					gapi.load('client', function() {
						gapi.client.setApiKey('AIzaSyBQ-0UwMCXAm8kKzlxzvTqVqsgaH7KOeO0');
						resolve();
					});
				});
			});
			// https://www.googleapis.com/auth/cloud-platform
			// https://www.googleapis.com/auth/cloud-vision	
		},
		onNavButtonPress: function() {
			var oSplitApp = this.getView().getParent().getParent();
			var oMaster = oSplitApp.getMasterPages()[0];
			oSplitApp.toMaster(oMaster, "flip");
		},
		/**
		 * When the add business card button is clicked
		 */
		onAddBusinessCard: function(oEvent) {
			var me = this;
			// creating input on-the-fly
			var domInput = document.createElement("input");
			var input = jQuery(domInput);
			input.attr("type", "file");
			input.change(function () {
				me.processImage(domInput.files[0]).then(function (oParameters) {
					me.addBusinessCard(oParameters);
				});
			});
			// add onchange handler if you wish to get the file :)
			input.trigger("click"); // opening dialog
			
		},
		addBusinessCard: function(oBusinessCard) {
			var oModel = this.getView().getModel();
			oModel.appendItem("/BusinessCards", oBusinessCard);
		},
		/**
		 * This function send an image to the google vision API and
		 * detects the text.
		 * @param {Blob} oBlob the image to send
		 * @return a promise when the processing is done
		 */
		processImage: function(oBlob) {
			var me = this;
			var pPromise = new Promise(function(resolve, reject) {
				me._gApiLoaded.then(function() {
					gapi.client.load("https://vision.googleapis.com/$discovery/rest", "v1", function() {

						var reader = new FileReader();
						reader.readAsDataURL(oBlob);
						reader.onloadend = function() {
							var base64data = reader.result;
							gapi.client.vision.images.annotate({
								"requests": [{
									"features": [{
										"type": "TEXT_DETECTION"
									}],
									"image": {
										"content": base64data.replace(/^data:image\/jpeg;base64,/, "")
									}
								}]
							}).then(function (oResponse) {
								resolve({"base64": base64data, "ocrResult": oResponse.result});
							});
						}
					});
				});
			});
			return pPromise;
		}
	});
});