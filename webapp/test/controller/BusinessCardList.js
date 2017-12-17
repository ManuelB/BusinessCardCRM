sap.ui.define(["incentergy/bccrm/BusinessCardCRM/controller/BusinessCardList.controller"], function(BusinessCardList) {
	"use strict";

	QUnit.module("Module name", {

		beforeEach: function() {

		},

		afterEach: function() {

		}
	});

	QUnit.test("Send file to Google OCR Engine", function(assert) {
		expect(3);
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
		  var controller = new BusinessCardList();
		  controller.onInit();
		  controller.processImageOCR(ManuelBlechschmidtBusinessCardBlob).then(function (oResult) {
		  	assert.equal("Incentergy\nGmbH\nManuel Blechschmidt\nCEO\nwww.incentergy.de\nPhone: +49 173 632 26 21\nMail: manuel.blechschmidt@incentergy.de\n", oResult.result.responses[0].fullTextAnnotation.text);
		    done();
		  });
		});
	});
});