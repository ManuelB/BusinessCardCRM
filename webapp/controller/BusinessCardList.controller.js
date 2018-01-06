sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/HashChanger",
	"sap/m/MessageToast"
], function(Controller, UIComponent, HashChanger) {
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
			fetch("data/census-derived-all-first.txt", {
				credentials: 'same-origin'
			}).then(function(oResponse) {
				return oResponse.text();
				// http://deron.meranda.us/data/census-dist-male-first.txt
			}).then(function(sCensusDerivedAll) {
				me._aFirstNames = sCensusDerivedAll.split(/\n/).map(function(sLine) {
					return sLine.split(/\s+/)[0];
				});
			});
			fetch("data/lastnames.txt", {
				credentials: 'same-origin'
			}).then(function(oResponse) {
				return oResponse.text();
				// http://deron.meranda.us/data/census-dist-male-first.txt
			}).then(function(sLastNames) {
				me._aLastNames = sLastNames.split(/\n/);
			});
			
			sap.ui.getCore().getEventBus().subscribe("Home", "DataChannelAvailable", function (sChannelId, sEventId, oEvent) {
				me.oDataChannel = oEvent.channel;
				me.byId("WebRTCSendButton").setVisible(true);
			});
		},
		onNavButtonPress: function() {
			var oSplitApp = this.getView().getParent().getParent();
			var oMaster = oSplitApp.getMasterPages()[0];
			oSplitApp.toMaster(oMaster, "flip");
		},
		onSendToOtherWebRTCClient: function() {
			var me = this;
			var oList = this.byId("list");
			oList.getSelectedItems().forEach(function (oItem) {
				var oBusinessCard = oItem.getBindingContext().getObject();
				var sBusinessCard = JSON.stringify(oBusinessCard);
				me.oDataChannel.send(sBusinessCard);
			});
		},
		/**
		 * When the add business card button is clicked
		 */
		onAddBusinessCard: function(oEvent) {
			var me = this;
			// creating input on-the-fly
			var domInput = document.createElement("input");
			domInput.type = "file";
			domInput.onchange = function() {
				me.byId("list").setBusy(true);
				me.processImageOCR(domInput.files[0]).then(function(oOCRResults) {
					try {
						me.processText(oOCRResults.OCRResult.responses[0].fullTextAnnotation.text).then(function(oNERResults) {
							oOCRResults.NERResult = oNERResults.NERResult;
							me.addBusinessCard(oOCRResults);
							me.byId("list").setBusy(false);
						});
					} catch(e) {
						MessageToast.show("Could not add business card. "+e);
						me.byId("list").setBusy(false);
					}
				});
			};
			// add onchange handler if you wish to get the file :)
			domInput.click(); // opening dialog
		},
		addBusinessCard: function(oBusinessCard) {
			var oModel = this.getView().getModel();
			try {
				var sTextUpperCase = oBusinessCard.OCRResult.responses[0].fullTextAnnotation.text.toUpperCase();
				var aFoundName = this._aFirstNames.filter(function(s) {
					return sTextUpperCase.indexOf(s) != -1;
					// Make longest match first one
				}).sort(function(a, b) {
					return b.length - a.length;
				});
				if (aFoundName.length > 0) {
					var sFoundName = aFoundName[0];
					oBusinessCard.FirstName = sFoundName.charAt(0).toUpperCase() + sFoundName.substring(1).toLowerCase();
				}
				var aFoundLastName = this._aLastNames.filter(function(s) {
					return sTextUpperCase.indexOf(s.toUpperCase()) != -1;
					// Make longest match first one
				}).sort(function(a, b) {
					return b.length - a.length;
				});
				if (aFoundLastName.length > 0) {
					var sFoundLastName = aFoundLastName[0];
					oBusinessCard.LastName = sFoundLastName.charAt(0).toUpperCase() + sFoundLastName.substring(1).toLowerCase();
				}

				var sText = oBusinessCard.OCRResult.responses[0].fullTextAnnotation.text;

				// Find phone number
				if (sText.match(/([+0-9()\- ]{5,})/)) {
					oBusinessCard.Phone = RegExp.$1;
				}
				// Find Phone
				if (sText.match(/([^ ]*@[^ ]*\.[0-9a-zA-Z]{2,6})/)) {
					oBusinessCard.Email = RegExp.$1;
				}

				for (var i = 0; i < oBusinessCard.NERResult.entities.length; i++) {
					var oEntity = oBusinessCard.NERResult.entities[0];
					if (oEntity.type === "LOCATION") {
						//   {
						//     "mentions": [
						//       {
						//         "text": {
						//           "beginOffset": 89,
						//           "content": "S. Amphlett Blvd"
						//         },
						//         "type": "PROPER"
						//       }
						//     ],
						//     "metadata": {
						//       "mid": "/g/1tf6xlb4"
						//     },
						//     "name": "S. Amphlett Blvd",
						//     "salience": 0.091283955,
						//     "type": "LOCATION"
						//   }
						if ("wikipedia_url" in oEntity.metadata) {
							oBusinessCard.City = oEntity.name;
						} else {
							oBusinessCard.Street = oEntity.name;
						}

					}
				}

			} catch (e) {
				jQuery.sap.log.error(e);
			}
			if (!("FirstName" in oBusinessCard)) {
				oBusinessCard.FirstName = "Unknown";
			}
			if (!("LastName" in oBusinessCard)) {
				oBusinessCard.LastName = "Unknown";
			}
			
			var aBusinessCards = oModel.getProperty("/BusinessCards");
			aBusinessCards.push(oBusinessCard);
			oModel.setProperty("/BusinessCards", aBusinessCards);
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
			var that = this;
			// Remove all items that are selected
			var oList = this.byId("list");
			var oModel = this.getView().getModel();
			var aBusinessCards = oModel.getProperty("/BusinessCards");
			var aIndexToRemove = oList.getSelectedContexts().map(function(oContext) {
				// return index from path
				return parseInt(oContext.getPath().match(/(\d+)$/)[1]);
			});
			var aPathToRemove = oList.getSelectedContexts().map(function(oContext) {
				return oContext.getPath();
			});
			// get all elements that are not selected
			aBusinessCards = aBusinessCards.filter(function (e, i) {
				return !(aIndexToRemove.includes(i));
			});
			oModel.setProperty("/BusinessCards", aBusinessCards);
			// if the currently active card is deleted
			if (aPathToRemove.includes("/" + HashChanger.getInstance().getHash()) ) {
				UIComponent.getRouterFor(that).navTo("Home");
			}
		}
	});
});