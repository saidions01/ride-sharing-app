sap.ui.define(["./BaseController",   "sap/m/MessageToast", "sap/ui/model/json/JSONModel",
], function (BaseController, MessageToast) {
	"use strict";

	return BaseController.extend("com.ridesharing.controller.App", {
	  onInit: function() {
      // Initialize model with sample data
      const oModel = new sap.ui.model.json.JSONModel({
        rides: [
          {
            rideId: 1,
            driverName: "John Doe",
            vehicle: "Toyota Camry",
            availableSeats: 3,
            pickupLocation: "Downtown",
            destination: "Airport"
          },
          {
            rideId: 2,
            driverName: "Jane Smith",
            vehicle: "Honda Accord",
            availableSeats: 2,
            pickupLocation: "University",
            destination: "Mall"
          }
        ],
        newRide: {
          rideId: "",
          driverName: "",
          vehicle: "",
          availableSeats: "",
          pickupLocation: "",
          destination: ""
        }
      });
      this.getView().setModel(oModel);
    },

    onAddRide: function() {
      const oModel = this.getView().getModel();
      const oNewRide = oModel.getProperty("/newRide");
      
      // Basic validation
      if (!oNewRide.rideId || !oNewRide.driverName || !oNewRide.vehicle || 
          !oNewRide.availableSeats || !oNewRide.pickupLocation || !oNewRide.destination) {
        MessageToast.show("Please fill all fields");
        return;
      }
      
      if (oNewRide.availableSeats <= 0) {
        MessageToast.show("Available seats must be positive");
        return;
      }
      
      // Add to rides array
      const aRides = oModel.getProperty("/rides");
      aRides.push({
        rideId: oNewRide.rideId,
        driverName: oNewRide.driverName,
        vehicle: oNewRide.vehicle,
        availableSeats: oNewRide.availableSeats,
        pickupLocation: oNewRide.pickupLocation,
        destination: oNewRide.destination
      });
      
      oModel.setProperty("/rides", aRides);
      
      // Clear form
      oModel.setProperty("/newRide", {
        rideId: "",
        driverName: "",
        vehicle: "",
        availableSeats: "",
        pickupLocation: "",
        destination: ""
      });
      
      MessageToast.show("Ride added successfully");
    },

    onDeleteRide: function(oEvent) {
      const oModel = this.getView().getModel();
      const oItem = oEvent.getSource().getBindingContext().getObject();
      const aRides = oModel.getProperty("/rides");
      
      const iIndex = aRides.findIndex(ride => ride.rideId === oItem.rideId);
      if (iIndex !== -1) {
        aRides.splice(iIndex, 1);
        oModel.setProperty("/rides", aRides);
        MessageToast.show("Ride deleted successfully");
      }
    }
	});
});
