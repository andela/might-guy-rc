import { Shops, Products, Orders, Cart, Accounts, Emails, Shipping }
from "/lib/collections";

export default () => {
  // Global API configuration
  const Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  });

  const getApiOptions = (collectionName, collectionString) => {
    let isAuth;
    if (collectionString === 'Products' || collectionString === 'Shops') {
      isAuth = false;
    } else { 
      isAuth = true;
    }
    return {
      routeOptions: {
        authRequired: isAuth
      },
      endpoints: {
        // GET all items in collection
        get: {
          action() {
            const allRecords = collectionName.find();
            if (allRecords) {
              return { statusCode: 201, status: "success", data: allRecords };
            }
            return {
              statusCode: 404,
              status: "fail",
              message: "error"
            };
          }
        },

        // GET an item in collections by id
        get: {
          action() {
            const oneRecord = collectionName.findOne(this.urlParams.id);
            if (oneRecord) {
              return { statusCode: 201, status: "success", data: oneRecord };
            }
            return {
              statusCode: 404,
              status: "fail",
              message: "record does not exist"
            };
          }
        },

        // POST into a collection
        post: {
          authRequired: true,
          action() {
            const isInserted = collectionName.insert(this.bodyParams);
            if (isInserted) {
              return { statusCode: 201, status: "success", data: isInserted };
            }
            return { status: "fail", message: "error" };
          }
        },

        // UPDATE a collection
        put: {
          authRequired: true,
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

  Api.addCollection(Shops, getApiOptions(Shops, 'Shops'));
  Api.addCollection(Products, getApiOptions(Products, 'Products'));
  Api.addCollection(Orders, getApiOptions(Orders, 'Orders'));
  Api.addCollection(Cart, getApiOptions(Cart, 'Cart'));
  Api.addCollection(Accounts, getApiOptions(Accounts, 'Accounts'));
  Api.addCollection(Emails, getApiOptions(Emails, 'Emails'));
  Api.addCollection(Shipping, getApiOptions(Shipping, 'Shipping'));
};