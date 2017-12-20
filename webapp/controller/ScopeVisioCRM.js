sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/ui/model/json/JSONModel"
], function(BaseObject, MessageToast, Dialog, JSONModel) {
	"use strict";
	return BaseObject.extend("incentergy.bccrm.BusinessCardCRM.controller.ScopeVisioCRM", {
		sendCustomerToCRM: function(oCustomer) {
			var sendToScopeVisio = function() {
				// {"customer": "1000000", "user" : "test@example.com", "password" : "secret", "organization" : "ACME Inc."}
				var oScopeVisioCredentials = JSON.parse(window.localStorage.ScopeVisioCredentials);
				fetch("https://www.veermastergin.de/scopevisio/api/soap/contact/Contact.importVCard", {
					headers: {
						'Accept': 'application/soap+xml; charset=utf-8',
						'Content-Type': 'application/soap+xml; charset=utf-8'
					},
					method: "POST",
					body: '<?xml version="1.0" encoding="UTF-8"?>'+
						'<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">'+
						'  <SOAP-ENV:Header/>'+
						'  <SOAP-ENV:Body>'+
						'    <ns1:req xmlns:ns1="https://www.scopevisio.com/">'+
						'      <authn>'+
						'        <customer>'+oScopeVisioCredentials.customer+'</customer>'+
						'        <user>'+oScopeVisioCredentials.user+'</user>'+
						'        <pass>'+oScopeVisioCredentials.password+'</pass>'+
						'        <language>de_DE</language>'+
						'        <organisation>'+oScopeVisioCredentials.organization+'</organisation>'+
						'      </authn>'+
						'      <args>'+
						'        <conflictDetectionByLegacyId>true</conflictDetectionByLegacyId>'+
						'        <conflictAction>skip</conflictAction>'+
						'        <data>ja;Jupp;Schmitz;ja;nein;nein;Herr</data>'+
						'      </args>'+
						'    </ns1:req>'+
						'  </SOAP-ENV:Body>'+
						'</SOAP-ENV:Envelope>'
				}).then(function(res) {
					jQuery.sap.log.info(res);
				}).catch(function(res) {
					jQuery.sap.log.info(res);
				});
			};
			
			if(!("ScopeVisioCredentials" in window.localStorage)) {
				this.showSettingsDialog(sendToScopeVisio);
			} else {
				sendToScopeVisio();
			}
		},
		showSettingsDialog: function (fnCallback) {
            var oScopeVisioCredentialsDialog = sap.ui.xmlfragment("incentergy.bccrm.BusinessCardCRM.dialog.ScopeVisioCredentialsDialog");
            var oModel = new JSONModel();
            oScopeVisioCredentialsDialog.setModel(oModel);
            oScopeVisioCredentialsDialog.getEndButton().attachPress(function (oEvent) {
            	window.localStorage.ScopeVisioCredentials = JSON.stringify(oScopeVisioCredentialsDialog.getModel().getData());
            	oScopeVisioCredentialsDialog.close();
            	oScopeVisioCredentialsDialog.destroy();
            	oScopeVisioCredentialsDialog = undefined;
            	fnCallback();
            });
            oScopeVisioCredentialsDialog.open();
		}
	});
});