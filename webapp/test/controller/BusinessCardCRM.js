sap.ui.define(["incentergy/bccrm/BusinessCardCRM/controller/BusinessCardCRM.controller"], function(BusinessCardCRM) {
	"use strict";

	QUnit.module("Module name", {

		beforeEach: function() {

		},

		afterEach: function() {

		}
	});

	QUnit.test("Send file to Google OCR Engine", function(assert) {
		expect(2);
		var done = assert.async();
		fetch("test/resources/Manuel_Blechschmidt_Business_Card_Small.jpg", {
			credentials: 'same-origin' // <- this is mandatory to deal with cookies
		}).then(function(response) {
		  assert.ok(response.ok);
		  return response.blob();
		}).catch(function () {
			assert.ok(false);
		}).then(function(ManuelBlechschmidtBusinessCardBlob) {
		  assert.ok(ManuelBlechschmidtBusinessCardBlob);
		  var controller = new BusinessCardCRM();
		  controller.processImage(ManuelBlechschmidtBusinessCardBlob).then(function (oResult) {
		  	console.log(oResult);
		  });
		  done();
		});
	});
});