import { Shops, Products, Orders, Cart, Accounts, Emails, Shipping }
from "/lib/collections";
import { Roles } from "meteor/alanning:roles";
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
              return { statusCode: 200, status: "success", data: allRecords };
            }
            return { statusCode: 404, status: "fail", message: "record does not exist" };
          }
        },

        // POST into a collection
        post: {
          action() {
            if (hasPermission(this.user, "admin") ||
            hasPermission(this.user, "guest") ||
            hasPermission(this.user, "owner")) {
              const isInserted = collectionName.insert(this.bodyParams);
              return { statusCode: 201, status: "success", data: isInserted };
            }
            return { status: "fail",
              message: "An error occurred. Post was not successful" };
          }
        },

        // UPDATE a collection
        put: {
          action() {
            if (hasPermission(this.user, "admin")) {
              const isUpdated = collectionName.update(this.urlParams.id, {
                $set: this.bodyParams
              });
              return { statusCode: 200, status: "success", data: isUpdated };
            }
            return { status: "fail", message: "record does not exist" };
          }
        },

        // DELETE a record in a collection
        delete: {
          action() {
            if (hasPermission(this.user, "admin")) {
              collectionName.remove(this.urlParams.id);
              return { status: "success", data: { message: "record is deleted" } };
            }
            return { statusCode: 404, status: "fail", message: "record does not exist" };
          }
        }
      }
    };
  };

  Api.addRoute("Emails", { authRequired: true }, {
    get: function () {
      const email = this.user.emails[0].address;
      const query = hasPermission(this.user, "admin") ? {} :
      { $or: [{ to: email  }, { from: email }] };
      const allRecords = Emails.find(query).fetch();
      return { statusCode: 200, status: "success", data: allRecords };
    },
    // POST into Emails collection
    post: function () {
      if (hasPermission(this.user, "admin") ||
        hasPermission(this.user, "guest") ||
        hasPermission(this.user, "owner")) {
        const isInserted = collectionName.insert(this.bodyParams);
        return { statusCode: 201, status: "success", data: isInserted };
      }
      return { status: "fail",
        message: "An error occurred. Post was not successful" };
    },
    // UPDATE an Email collection
    put: function () {
      if (hasPermission(this.user, "admin")) {
        const isUpdated = collectionName.update(this.urlParams.id, {
          $set: this.bodyParams
        });
        return { statusCode: 200, status: "success", data: isUpdated };
      }
      return { status: "fail", message: "record does not exist" };
    },
    // DELETE a record in Emails collection
    delete:
      function () {
        if (hasPermission(this.user, "admin")) {
          collectionName.remove(this.urlParams.id);
          return { status: "success", data: { message: "record is deleted" } };
        }
        return { statusCode: 404, status: "fail", message: "record does not exist" };
      }
  });

  Api.addRoute("Accounts", { authRequired: true }, {
    get: function () {
      const user = this.user._id;
      const query = hasPermission(this.user, "admin") ? {} :
      { userId: user };
      const allRecords = Accounts.find(query).fetch();
      return { statusCode: 200, status: "success", data: allRecords };
    },
    // POST into Accounts collection
    post: function () {
      if (hasPermission(this.user, "admin") ||
        hasPermission(this.user, "guest") ||
        hasPermission(this.user, "owner")) {
        const isInserted = collectionName.insert(this.bodyParams);
        return { statusCode: 201, status: "success", data: isInserted };
      }
      return { status: "fail",
        message: "An error occurred. Post was not successful" };
    },
    // UPDATE an Account collection
    put: function () {
      if (hasPermission(this.user, "admin")) {
        const isUpdated = collectionName.update(this.urlParams.id, {
          $set: this.bodyParams
        });
        return { statusCode: 200, status: "success", data: isUpdated };
      }
      return { status: "fail", message: "record does not exist" };
    },
    // DELETE a record in Account collection
    delete:
      function () {
        if (hasPermission(this.user, "admin")) {
          collectionName.remove(this.urlParams.id);
          return { status: "success", data: { message: "record is deleted" } };
        }
        return { statusCode: 404, status: "fail", message: "record does not exist" };
      }
  });

  Api.addCollection(Shops, getApiOptions(Shops));
  Api.addCollection(Products, getApiOptions(Products));
  Api.addCollection(Orders, getApiOptions(Orders));
  Api.addCollection(Cart, getApiOptions(Cart));
  Api.addCollection(Shipping, getApiOptions(Shipping));
};
