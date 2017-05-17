/* eslint-disable consistent-return, no-unused-vars */
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import * as Schemas from "/lib/collections/schemas";
import * as Collections from "/lib/collections";

Meteor.methods({
  "insert/review"(review) {
    check(review, Schemas.Reviews);
    Meteor.publish("Reviews");
    return Collections.Reviews.insert(review);
  },

  "delete/review"(reviewID) {
    check(reviewID, String);
    return Collections.Reviews.remove({
      _id: reviewID
    });
  },

  "find/review"(productID) {
    check(productID, String);
    return Collections.Reviews.find({ productId: productID }).fetch();
  },

  "averageRating/review"(productID) {
    check(productID, String);
    const reviews = Collections.Reviews.find({ productId: productID, username: !"Admin" }).fetch();
    const average = Object.keys(reviews).reduce((previous, key) => {
      return previous + reviews[key].rating;
    }, 0) / reviews.length;
    return (isNaN(average) ?  "Not rated" : average.toFixed(1));
  },

  "current/user"(userID) {
    check(userID, String);
    return Collections.Accounts.findOne({ _id: userID });
  }
});
