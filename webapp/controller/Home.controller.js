sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/TextArea",
	"sap/m/Button"
], function(jQuery, Controller, MessageToast, Dialog, TextArea, Button) {
	"use strict";

	return Controller.extend("incentergy.bccrm.BusinessCardCRM.controller.Home", {
		onInit: function() {
			this._oConfiguration = {
			  'iceServers': [{
			    'urls': 'stun:stun.l.google.com:19302'
			  }]
			};
			this._oMediaConstraints = {
			    mandatory: [{
			        RtpDataChannels: true
			    }]
			};
		},
		onNavButtonPress: function() {
			var oSplitApp = this.getView().getParent().getParent();
			var oMaster = oSplitApp.getMasterPages()[0];
			oSplitApp.toMaster(oMaster, "flip");
		},
		onOfferWebRTCSyncSession: function() {
			var me = this;
			this.oRTCPeerConnection = new RTCPeerConnection(this._oConfiguration);
			
			// Establish your peer connection using your signaling channel here
			var oDataChannel =
			  this.oRTCPeerConnection.createDataChannel("Model");
			
			oDataChannel.onerror = function (error) {
			  jQuery.sap.log.error("Data Channel Error:"+ error);
			};
			this.oDataChannel = oDataChannel;
			this.oRTCPeerConnection.onicecandidate = function (oEvent) {
				// console.log("Offering connection: "+((oEvent && oEvent.candidate) ? oEvent.candidate.candidate : "null"));
				// Wait until we found all the ice candidates before offering the session
				if(!oEvent.candidate) {
					me.byId("webRTCSDPText").setContent("<p>"+JSON.stringify(me.oRTCPeerConnection.localDescription)+"</p>");
				}
			};
			this.oRTCPeerConnection.createOffer().then(function (oSDPOffer) {
				return me.oRTCPeerConnection.setLocalDescription(oSDPOffer);
			}).then(function () {
				me.byId("webRTCSDPPanel").setHeaderText("Click in the other browser on Join WebRTC Session and paste the following text");
				// https://webrtchacks.com/sdp-anatomy/
				// v=0
				// o=- 973498238240410179 2 IN IP4 127.0.0.1
				// s=-
				// t=0 0
				// a=msid-semantic: WMS
				me.byId("webRTCOfferAnswer").setVisible(true);
				me.byId("webRTCOfferAnswerButton").setVisible(true);
			}).catch(function(reason) {
			    // An error occurred, so handle the failure to connect
			    MessageToast.show("Error: "+reason);
			});
		},
		onSetWebRTCOfferAnswer: function() {
			this.oRTCPeerConnection.setRemoteDescription(JSON.parse(this.byId("webRTCOfferAnswer").getValue()));
			sap.ui.getCore().getEventBus().publish("Home", "DataChannelAvailable", {"channel": this.oDataChannel});
		},
		onJoinWebRTCSyncSession: function() {
			var me = this;
			if(!this._oWebRTCJoinDialog) {
				var oTextarea = new TextArea({rows: 10, cols: 20});
				var oJoinButton = new Button({text: "Join", "press": function () {
					var sSDP = oTextarea.getValue();
					var oSDPOffer = JSON.parse(sSDP);
					var oRTCJoinPeerConnection = new RTCPeerConnection(me._oConfiguration);
					oRTCJoinPeerConnection.ondatachannel = function (oEvent) {
					  var oReceiveChannel = oEvent.channel;
					  oReceiveChannel.onmessage = function (oMessage) {
					  	var oModel = me.getView().getModel();
					  	var oBusinessCard = JSON.parse(oMessage.data);
					  	var aBusinessCards = oModel.getProperty("/BusinessCards");
						aBusinessCards.push(oBusinessCard);
						oModel.setProperty("/BusinessCards", aBusinessCards);
					  };
					  oReceiveChannel.onerror = function (error) {
					  	jQuery.sap.log.error("Data Channel Error:"+ error);
					  };
					};
					oRTCJoinPeerConnection.onicecandidate = function (oEvent) {
						// console.log("Joining connection: "+((oEvent && oEvent.candidate) ? oEvent.candidate.candidate : "null"));
						if(!oEvent.candidate) {
							me.byId("webRTCSDPText").setContent("<p>"+JSON.stringify(oRTCJoinPeerConnection.localDescription)+"</p>");
						}
					};
					oRTCJoinPeerConnection.setRemoteDescription(oSDPOffer);
					oRTCJoinPeerConnection.createAnswer().then(function (oAnswer) {
						oRTCJoinPeerConnection.setLocalDescription(oAnswer);
						// console.log(JSON.stringify(oAnswer));
					});
					me._oWebRTCJoinDialog.close();
				}});
				this._oWebRTCJoinDialog = new Dialog({title:"Paste WebRTC SDP here", content: [oTextarea], endButton: oJoinButton});
			}
			this._oWebRTCJoinDialog.open();
		}
	});
});