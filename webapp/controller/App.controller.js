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
            showSearchResults: false 
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

        const maxId = aRides.reduce(
          (max, ride) => Math.max(max, parseInt(ride.rideId, 10)),
          0
        );
        const newId = maxId + 1;

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

        aRides.push({
          rideId: newId,
          driverName: oNewRide.driverName,
          vehicle: oNewRide.vehicle,
          availableSeats: seats,
          pickupLocation: oNewRide.pickupLocation,
          destination: oNewRide.destination,
        });

        oModel.setProperty("/rides", aRides);

        oModel.setProperty("/newRide", {
          rideId: "",
          driverName: "",
          vehicle: "",
          availableSeats: "",
          pickupLocation: "",
          destination: "",
        });

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
    });
  }
);
