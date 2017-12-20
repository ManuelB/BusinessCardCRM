sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"./ScopeVisioCRM"
], function(Controller, UIComponent, ScopeVisioCRM) {
	"use strict";

	return Controller.extend("incentergy.bccrm.BusinessCardCRM.controller.BusinessCardDetails", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf incentergy.bccrm.BusinessCardCRM.view.BusinessCardDetails
		 */
		onInit: function() {
			var me = this;
			UIComponent.getRouterFor(this).getRoute("BusinessCards").attachPatternMatched(function (oEvent) {
				me.getView().bindElement("/BusinessCards/"+oEvent.getParameter("arguments").id);
			});
		},
		
		formatJSON: function (oObject) {
			return "<pre>"+JSON.stringify(oObject, null, 2)+"</pre>";
		},
		onSendToCRM: function(oEvent) {
			ScopeVisioCRM.prototype.sendCustomerToCRM(this.getView().getBindingContext().getObject());
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf incentergy.bccrm.BusinessCardCRM.view.BusinessCardDetails
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf incentergy.bccrm.BusinessCardCRM.view.BusinessCardDetails
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf incentergy.bccrm.BusinessCardCRM.view.BusinessCardDetails
		 */
		//	onExit: function() {
		//
		//	}

	});

});