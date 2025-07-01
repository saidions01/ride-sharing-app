sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for the UI5 Application: com.ridesharing",
		defaults: {
			page: "ui5://test-resources/com/ridesharing/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "EN",
				theme: "sap_horizon"
			},
			coverage: {
				only: "com/ridesharing/",
				never: "test-resources/com/ridesharing/"
			},
			loader: {
				paths: {
					"com/ridesharing": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for com.ridesharing"
			},
			"integration/opaTests": {
				title: "Integration tests for com.ridesharing"
			}
		}
	};
});
