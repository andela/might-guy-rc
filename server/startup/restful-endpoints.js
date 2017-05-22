import { Shops, Products, Orders, Cart, Shipping } from "/lib/collections";
import Reaction  from "/server/api/core";

const hasPermission = (user, role) => {
  return user.roles[Reaction.getShopId()].includes(role);
};

export default () => {
  // Global API configuration
  const Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  });

  const getApiOptions = (collectionName) => {
    return {
      routeOptions: {
        authRequired: true
      },

      endpoints: {
        // GET all items in collection
        get: {
          action() {
            if (hasPermission(this.user, "admin") ||
            hasPermission(this.user, "guest") ||
            hasPermission(this.user, "owner")) {
              const allRecords = collectionName.findOne(this.urlParams.id);
              if (!allRecords) {
                return { status: "fail",
                  message: "An error occurred. Record does not exist" };
              }
              return { statusCode: 200, status: "success", data: allRecords };
            }
          }
        },

        // POST into a collection
        post: {
          action() {
            if (!(hasPermission(this.user, "admin") ||
            hasPermission(this.user, "owner"))) {
              return { statusCode: 403, status: "fail",
                message: "You do not have permission to add a record" };
            }
            if (hasPermission(this.user, "admin") ||
            hasPermission(this.user, "owner")) {
              const isInserted = collectionName.insert(this.bodyParams);
              if (isInserted) {
                return { statusCode: 201, status: "success", data: isInserted };
              } return { statusCode: 400, status: "fail",
                message: "An error occurred. Post was not successful" };
            }
          }
        },

        // UPDATE a collection
        put: {
          action() {
            if (!(hasPermission(this.user, "admin") ||
            hasPermission(this.user, "owner"))) {
              return { statusCode: 403, status: "fail",
                message: "You do not have permission to edit this record" };
            }
            if (hasPermission(this.user, "admin") ||
            hasPermission(this.user, "owner")) {
              const isUpdated = collectionName.upsert({ _id: this.urlParams.id }, {
                $set: this.bodyParams
              });
              if (!isUpdated) {
                return { status: "fail", statusCode: 404,
                  message: "An error occurred. Record does not exist" };
              }
              const record = collectionName.findOne(this.urlParams.id);
              return { statusCode: 200, status: "success", data: isUpdated, record };
            }
          }
        },

        // DELETE a record in a collection
        delete: {
          action() {
            if (!(hasPermission(this.user, "admin") ||
            hasPermission(this.user, "owner"))) {
              return { statusCode: 403, status: "fail",
                message: "You do not have permission to delete this record" };
            }
            if (hasPermission(this.user, "admin") ||
            hasPermission(this.user, "owner")) {
              // we delete a product by setting the isDeleted flag
              if (collectionName._name === "Products") {
                // get collection from db
                const collection = collectionName.findOne(this.urlParams.id);
                // modify isDeleted flag
                collection.isDeleted = true;
                // update collection in db
                const isDeleted = collectionName.upsert({ _id: this.urlParams.id }, {
                  $set: collection
                });
                return { data: isDeleted, message: "product has been archived" };
                // other collections may be removed
              }
              const isDeleted = collectionName.remove({ _id: this.urlParams.id });
              return { status: "success", data: isDeleted,  message: "record is deleted" };
            }
          }
        }
      }
    };
  };

  Api.addCollection(Shops, getApiOptions(Shops));
  Api.addCollection(Products, getApiOptions(Products));
  Api.addCollection(Orders, getApiOptions(Orders));
  Api.addCollection(Cart, getApiOptions(Cart));
  Api.addCollection(Shipping, getApiOptions(Shipping));
};
