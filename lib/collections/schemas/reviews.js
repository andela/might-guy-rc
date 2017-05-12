import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const Reviews = new SimpleSchema({
  productId: {
    type: String,
    optional: true
  },
  username: {
    type: String,
    optional: true
  },
  userID: {
    type: String,
    optional: true
  },
  rating: {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  comment: {
    type: String,
    optional: true
  }
});
