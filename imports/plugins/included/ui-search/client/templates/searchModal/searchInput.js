import { Template } from "meteor/templating";
import { ProductSearch } from "/lib/collections";

Template.searchInput.helpers({
  settings: function () {
    return {
      position: "bottom",
      limit: 10,
      rules: [
        {
          token: "",
          collection: ProductSearch,
          field: "title",
          options: "i",
          matchAll: true,
          template: Template.searchResult,
          noMatchTemplate: Template.noResult
        }
      ]
    };
  }
});
