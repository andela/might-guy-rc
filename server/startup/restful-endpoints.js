import { Shops, Products, Orders, Cart, Accounts, Emails, Shipping }
from "/lib/collections";
import { Roles } from "meteor/alanning:roles";
import Reaction  from "/server/api/core";

const hasPermission = (user, role) => {
  return user.roles[Reaction.getShopId()].includes(role)
}

export default () => {
  // Global API configuration
  const Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    },
  });

  const getApiOptions = (collectionName) => {
    return {
      routeOptions: {
        authRequired: true
      },
      
      endpoints: {
        // POST into a collection
        post: {
          authRequired: true,
          roleRequired: ["admin", "owner", "guest"],
          action() {
            const isInserted = collectionName.insert(this.bodyParams);
            if (isInserted) {
              return { statusCode: 201, status: "success", data: isInserted };
            }
            return { status: "fail", message: "post was not successful" };
          }
        },

        // UPDATE a collection
        put: {
          authRequired: true,
          roleRequired: ["admin", "owner", "guest"],
          action() {
            const isUpdated = collectionName.update(this.urlParams.id, {
              $set: this.bodyParams
            });
            if (isUpdated) {
              return { statusCode: 201, status: "success", data: isUpdated };
            }
            return { status: "fail", message: "record not found" };
          }
        },

        // DELETE a record in a collection
        delete: {
          authRequired: true,
          roleRequired: ["admin"],
          action() {
            const isDeleted = collectionName.remove(this.urlParams.id);
            if (isDeleted) {
              return { status: "success", data: { message: "record deleted" } };
            }
            return { status: "fail", message: "record not found" };
          } 
        }
      }
    };
  };
  
  Api.addRoute('Emails', { authRequired: true}, {
    get: function() {
      const email = this.user.emails[0].address;
      const query = hasPermission(this.user, "admin") ? {} :
      { $or: [{to : email  }, {from : email }]}
      const allRecords = Emails.find(query).fetch();
        return { data: allRecords };
    } 
  });

  Api.addRoute('Accounts', { authRequired: true}, {
    get: function() {
      const email = this.user.emails[0].address;
      const query = hasPermission(this.user, "admin") ? {} :
      { emails : email }
      const allRecords = Accounts.find(query).fetch();
        return { data: allRecords };
    } 
  });

  Api.addCollection(Shops, getApiOptions(Shops));
  Api.addCollection(Products, getApiOptions(Products));
  Api.addCollection(Orders, getApiOptions(Orders));
  Api.addCollection(Cart, getApiOptions(Cart));
  Api.addCollection(Shipping, getApiOptions(Shipping));
};
