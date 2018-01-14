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
				// Example: https://www.w3.org/2002/12/cal/vcard-notes.html
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
						'        <user>'+oScopeVisioCredentials.username+'</user>'+
						'        <pass>'+oScopeVisioCredentials.password+'</pass>'+
						'        <language>de_DE</language>'+
						'        <organisation>'+oScopeVisioCredentials.organization+'</organisation>'+
						'      </authn>'+
						'      <args>'+
						'        <conflictDetectionByEmail>true</conflictDetectionByEmail>'+
						'        <overwrite>fillin</overwrite>'+
						'        <data>BEGIN:VCARD\n'+
						'VERSION:3.0\n'+
						'N:'+oCustomer.LastName+';'+oCustomer.FirstName+';;;\n'+
						'FN:'+oCustomer.LastName+' '+oCustomer.LastName+'\n'+
						'ORG:'+oCustomer.Organization+';\n'+
						'TITLE:'+oCustomer.Position+'\n'+
						'EMAIL;type=INTERNET;type=WORK;type=pref:'+oCustomer.Email+'\n'+
						'TEL;type=WORK;type=pref:'+oCustomer.Phone+'\n'+
						// 'TEL;type=CELL:+1 781 555 1212\n'+
						// 'TEL;type=HOME:+1 202 555 1212\n'+
						// 'TEL;type=WORK:+1 (617) 555-1234\n'+
						'item1.ADR;type=WORK:;;'+oCustomer.Street+';'+oCustomer.City+';'+oCustomer.State+';'+oCustomer.ZipCode+';'+oCustomer.Country+'\n'+
						'item1.X-ABADR:us\n'+
						//'item2.ADR;type=HOME;type=pref:;;3 Acacia Avenue;Newtown;MA;02222;USA\n'+
						//'item2.X-ABADR:us\n'+
						'NOTE:'+oCustomer.Notes+'\n'+
						'CATEGORIES:BusinessCardCRM\n'+
						// 'X-ABUID:5AD380FD-B2DE-4261-BA99-DE1D1DB52FBE\:ABPerson\n'+
						'END:VCARD</data>'+
						'      </args>'+
						'    </ns1:req>'+
						'  </SOAP-ENV:Body>'+
						'</SOAP-ENV:Envelope>'
				}).then(function(response) {
					// jQuery.sap.log.info(response);
					return response.text();
				}).catch(function(res) {
					jQuery.sap.log.error(res);
				}).then(function (sXmlResponseText) {
					// <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"><SOAP-ENV:Header/><SOAP-ENV:Body><ns1:reply xmlns:ns1="http://www.Scopevisio.com/contacts"><record/><insertCount>0</insertCount><updateCount>0</updateCount><errors/></ns1:reply></SOAP-ENV:Body></SOAP-ENV:Envelope>
					var oParser = new DOMParser();
					var oXmlDoc = oParser.parseFromString(sXmlResponseText,"text/xml");
					var sInsertCount = oXmlDoc.getElementsByTagName("insertCount")[0].childNodes[0].nodeValue;
					var sUpdateCount = oXmlDoc.getElementsByTagName("updateCount")[0].childNodes[0].nodeValue;
					MessageToast.show("Inserted Contacts: "+sInsertCount+". Update Contacts: "+sUpdateCount);
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