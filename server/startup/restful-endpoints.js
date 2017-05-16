import { Shops, Products, Orders, Cart, Shipping, Emails, Accounts } from "/lib/collections";
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
              const isUpdated = collectionName.update({ _id: this.urlParams.id }, {
                $set: this.bodyParams
              });
              if (!isUpdated) {
                return { status: "fail", statusCode: 404,
                  message: "An error occurred. Record does not exist" };
              } return { statusCode: 200, status: "success", data: isUpdated };
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
              const isDeleted = collectionName.remove({ _id: this.urlParams.id });
              if (isDeleted) {
                return { status: "success", data: { message: "record is deleted" } };
              } return { statusCode: 404, status: "fail",
                message: "record does not exist" };
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
  Api.addCollection(Emails, getApiOptions(Emails));
  Api.addCollection(Accounts, getApiOptions(Accounts));
};
