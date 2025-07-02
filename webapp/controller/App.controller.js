sap.ui.define(
	["./BaseController", "sap/m/MessageToast", "sap/ui/model/json/JSONModel"],
	function (BaseController, MessageToast, JSONModel) {
		"use strict";

		return BaseController.extend("com.ridesharing.controller.App", {
			onInit: function () {
				
				let storedData = localStorage.getItem("rideData");

				if (!storedData) {
					// Default data
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
					};
					localStorage.setItem("rideData", JSON.stringify(storedData));
				} else {
					storedData = JSON.parse(storedData);
				}

				const oModel = new JSONModel(storedData);
				this.getView().setModel(oModel);
			},
			onAddRide: function () {
				const oModel = this.getView().getModel();
				const oNewRide = oModel.getProperty("/newRide");
				const aRides = oModel.getProperty("/rides") || [];

				// 🔢 Auto-increment rideId
				const maxId = aRides.reduce(
					(max, ride) => Math.max(max, parseInt(ride.rideId, 10)),
					0
				);
				const newId = maxId + 1;

				// Validation
				if (
					!oNewRide.driverName.trim() ||
					!oNewRide.vehicle.trim() ||
					!oNewRide.availableSeats ||
					!oNewRide.pickupLocation.trim() ||
					!oNewRide.destination.trim()
				) {
					MessageToast.show("Please fill all fields");
					return;
				}

				const seats = Number(oNewRide.availableSeats);
				if (isNaN(seats) || seats <= 0) {
					MessageToast.show("Available seats must be a positive number");
					return;
				}

				// Push the new ride with the auto-generated ID
				aRides.push({
					rideId: newId,
					driverName: oNewRide.driverName,
					vehicle: oNewRide.vehicle,
					availableSeats: seats,
					pickupLocation: oNewRide.pickupLocation,
					destination: oNewRide.destination,
				});

				oModel.setProperty("/rides", aRides);

				// Clear the form
				oModel.setProperty("/newRide", {
					rideId: "",
					driverName: "",
					vehicle: "",
					availableSeats: "",
					pickupLocation: "",
					destination: "",
				});

				// Persist to localStorage
				localStorage.setItem("rideData", JSON.stringify(oModel.getData()));

				MessageToast.show("Ride added successfully");
			},
			onDeleteRide: function (oEvent) {
				const oModel = this.getView().getModel();
				const oItem = oEvent.getSource().getBindingContext().getObject();
				const aRides = oModel.getProperty("/rides");

				const iIndex = aRides.findIndex((ride) => ride.rideId === oItem.rideId);
				if (iIndex !== -1) {
					aRides.splice(iIndex, 1);
					oModel.setProperty("/rides", aRides);
					MessageToast.show("Ride deleted successfully");
				}
			},

			onSearch: function (oEvent) {
				const sQuery = oEvent.getParameter("newValue").toLowerCase();
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
		});
	}
);
