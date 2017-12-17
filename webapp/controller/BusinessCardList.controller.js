sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], function(Controller, UIComponent) {
	"use strict";
	return Controller.extend("incentergy.bccrm.BusinessCardCRM.controller.BusinessCardList", {
		onInit: function() {
			var me = this;
			this._gApiLoaded = new Promise(function(resolve) {
				jQuery.sap.includeScript("https://apis.google.com/js/api.js", "gapi", function() {
					gapi.load("client", function() {
						gapi.client.setApiKey("AIzaSyBQ-0UwMCXAm8kKzlxzvTqVqsgaH7KOeO0");
						resolve();
					});
				});
			}); // https://www.googleapis.com/auth/cloud-platform
			// https://www.googleapis.com/auth/cloud-vision	
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
			input.change(function() {
				me.processImageOCR(domInput.files[0]).then(function(oOCRResults) {
					me.processText(oOCRResults.OCRResult.responses[0].fullTextAnnotation.text).then(function(oNERResults) {
						oOCRResults.NERResult = oNERResults.NERResult;
						me.addBusinessCard(oOCRResults);
					});
				});
			});
			// add onchange handler if you wish to get the file :)
			input.trigger("click"); // opening dialog
		},
		addBusinessCard: function(oBusinessCard) {
			var oModel = this.getView().getModel();
			if (!("FirstName" in oBusinessCard)) {
				oBusinessCard.FirstName = "Unknown";
			}
			if (!("LastName" in oBusinessCard)) {
				oBusinessCard.LastName = "Unknown";
			}
			oModel.appendItem("/BusinessCards", oBusinessCard);
		},
		/**
		 * This function send an image to the google vision API and
		 * detects the text.
		 * @param {Blob} oBlob the image to send
		 * @return a promise when the processing is done
		 */
		processImageOCR: function(oBlob) {
			var me = this;
			// http://ahogrammer.com/2016/11/29/extracting-information-from-business-card-with-google-api/
			var pPromise = new Promise(function(resolve, reject) {
				me._gApiLoaded.then(function() {
					// https://developers.google.com/discovery/v1/reference/apis/list Just hit execute to get a list
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
							}).then(function(oResponse) {
								resolve({
									"ImageBase64": base64data,
									"OCRResult": oResponse.result
								});
							});
						};
					});
				});
			});
			return pPromise;
		},
		processText: function(sText) {
			var me = this;
			// http://ahogrammer.com/2016/11/29/extracting-information-from-business-card-with-google-api/
			var pPromise = new Promise(function(resolve, reject) {
				gapi.client.load("https://language.googleapis.com/$discovery/rest", "v1", function() {
					gapi.client.language.documents.analyzeEntities({
						"document": {
							"type": "PLAIN_TEXT",
							"content": sText
						},
						"encodingType": "UTF8"
					}).then(function(oResponse) {
						resolve({
							"NERResult": oResponse.result
						});
					});
				});
			});
			return pPromise;
		},
		/**
		 *@memberOf incentergy.bccrm.BusinessCardCRM.controller.BusinessCardList
		 */
		onPressItem: function(oEvent) {
			var oListItem = oEvent.getParameter("listItem");
			UIComponent.getRouterFor(this).navTo("BusinessCards", {
				// get everything after the last /
				// e.g. /BusinessCards/-L0__dp2cMojTFGBMOwX -> -L0__dp2cMojTFGBMOwX
				"id": oListItem.getBindingContextPath().match(/\/([^\/]*)$/)[1]
			});
		},
		/**
		 *@memberOf incentergy.bccrm.BusinessCardCRM.controller.BusinessCardList
		 */
		onPressDelete: function(oEvent) {
			// Remove all items that are selected
			var oList = this.byId("list");
			this.getView().getModel().getFirebasePromise().then(function (firebase) {
				oList.getSelectedContexts().forEach(function (oContext) {
					firebase.database().ref(oContext.getPath()).remove();
				});
			});
		}
	});
});