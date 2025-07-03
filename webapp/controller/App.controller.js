sap.ui.define(
	["./BaseController", "sap/m/MessageToast", "sap/ui/model/json/JSONModel"],
	function (BaseController, MessageToast, JSONModel) {
		"use strict";

		return BaseController.extend("com.ridesharing.controller.App", {
			onInit: function () {
				let storedData = localStorage.getItem("rideData");

				if (!storedData) {
					storedData = {
						rides: [],
						newRide: {
							rideId: "",
							driverName: "",
							vehicle: "",
							availableSeats: "",
							pickupLocation: "",
							destination: "",
						},
						showSearchResults: false,
					};
					localStorage.setItem("rideData", JSON.stringify(storedData));
				} else {
					storedData = JSON.parse(storedData);
					// Make sure the property exists after loading
					if (typeof storedData.showSearchResults === "undefined") {
						storedData.showSearchResults = false;
					}
				}

				const oModel = new JSONModel(storedData);
				this.getView().setModel(oModel);
			},

			onAddRide: function () {
				const oModel = this.getView().getModel();
				const oNewRide = oModel.getProperty("/newRide");
				const aRides = oModel.getProperty("/rides") || [];
				const oView = this.getView();
				let bHasError = false;

				// Helper to mark inputs as error or none
				const markInput = (sId, bError) => {
					const oInput = oView.byId(sId);
					if (oInput) {
						oInput.setValueState(bError ? "Error" : "None");
					}
				};

				// Validate fields and mark errors
				markInput("driverNameInput", !oNewRide.driverName.trim());
				markInput("vehicleInput", !oNewRide.vehicle.trim());
				markInput(
					"seatsInput",
					!oNewRide.availableSeats ||
						isNaN(oNewRide.availableSeats) ||
						oNewRide.availableSeats <= 0
				);
				markInput("pickupInput", !oNewRide.pickupLocation.trim());
				markInput("destinationInput", !oNewRide.destination.trim());

				if (
					!oNewRide.driverName.trim() ||
					!oNewRide.vehicle.trim() ||
					!oNewRide.availableSeats ||
					isNaN(oNewRide.availableSeats) ||
					oNewRide.availableSeats <= 0 ||
					!oNewRide.pickupLocation.trim() ||
					!oNewRide.destination.trim()
				) {
					bHasError = true;
				}

				if (bHasError) {
					sap.m.MessageBox.error("Please correct the highlighted fields.");
					return;
				}

				// Calculate next rideId
				const maxId = aRides.reduce(
					(max, ride) => Math.max(max, parseInt(ride.rideId, 10)),
					0
				);
				const newId = maxId + 1;

				// Add new ride
				aRides.push({
					rideId: newId,
					driverName: oNewRide.driverName,
					vehicle: oNewRide.vehicle,
					availableSeats: Number(oNewRide.availableSeats),
					pickupLocation: oNewRide.pickupLocation,
					destination: oNewRide.destination,
				});

				oModel.setProperty("/rides", aRides);

				// Reset form fields and value states
				oModel.setProperty("/newRide", {
					rideId: "",
					driverName: "",
					vehicle: "",
					availableSeats: "",
					pickupLocation: "",
					destination: "",
				});
				// Reset ValueStates
				markInput("driverNameInput", false);
				markInput("vehicleInput", false);
				markInput("seatsInput", false);
				markInput("pickupInput", false);
				markInput("destinationInput", false);

				// Save to localStorage
				localStorage.setItem("rideData", JSON.stringify(oModel.getData()));

				sap.m.MessageToast.show("Ride added successfully");
			},
			onRidePress: function (oEvent) {
				const oContext = oEvent.getSource().getBindingContext();
				const oData = oContext.getObject();

				if (!this._oDialog) {
					this._oDialog = new sap.m.Dialog({
						title: "Ride Details",
						content: [
							new sap.m.Text({ text: `Driver: ${oData.driverName}` }),
							new sap.m.Text({ text: `Vehicle: ${oData.vehicle}` }),
							new sap.m.Text({
								text: `Available Seats: ${oData.availableSeats}`,
							}),
							new sap.m.Text({
								text: `Pickup Location: ${oData.pickupLocation}`,
							}),
							new sap.m.Text({ text: `Destination: ${oData.destination}` }),
							new sap.m.Button({
								text: "Close",
								press: () => this._oDialog.close(),
							}),
						],
						afterClose: () => this._oDialog.destroy(),
					});
				} else {
					// Update dialog content dynamically if reusing
					const aContent = this._oDialog.getContent();
					aContent[0].setText(`Driver: ${oData.driverName}`);
					aContent[1].setText(`Vehicle: ${oData.vehicle}`);
					aContent[2].setText(`Available Seats: ${oData.availableSeats}`);
					aContent[3].setText(`Pickup Location: ${oData.pickupLocation}`);
					aContent[4].setText(`Destination: ${oData.destination}`);
				}

				this._oDialog.open();
			},
			onDeleteRide: function (oEvent) {
				const oModel = this.getView().getModel();
				const oItem = oEvent.getSource().getBindingContext().getObject();
				const aRides = oModel.getProperty("/rides");

				const iIndex = aRides.findIndex((ride) => ride.rideId === oItem.rideId);
				if (iIndex !== -1) {
					aRides.splice(iIndex, 1);
					oModel.setProperty("/rides", aRides);
					localStorage.setItem("rideData", JSON.stringify(oModel.getData()));
					MessageToast.show("Ride deleted successfully");
				}
			},

			onSearch: function (oEvent) {
				const sQuery = oEvent.getParameter("newValue").toLowerCase();
				const oModel = this.getView().getModel();

				if (!sQuery || sQuery.length === 0) {
					oModel.setProperty("/showSearchResults", false);

					const oList = this.byId("rideList");
					oList.getBinding("items").filter([]);
					return;
				}

				oModel.setProperty("/showSearchResults", true);

				const oList = this.byId("rideList");
				const oBinding = oList.getBinding("items");

				oBinding.filter([
					new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter(
								"driverName",
								sap.ui.model.FilterOperator.Contains,
								sQuery
							),
							new sap.ui.model.Filter(
								"pickupLocation",
								sap.ui.model.FilterOperator.Contains,
								sQuery
							),
						],
						and: false,
					}),
				]);
			},
			onSearchClear: function (oEvent) {
				if (!oEvent.getParameter("query")) {
					// Clear search results when cleared via X or search button
					const oModel = this.getView().getModel();
					const oList = this.byId("rideList");
					oModel.setProperty("/showSearchResults", false);
					oList.getBinding("items").filter([]);
				}
			},
		});
	}
);
