import _ from "lodash";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { ProductSearch, Tags, OrderSearch, AccountSearch, Orders } from "/lib/collections";
import { IconButton } from "/imports/plugins/core/ui/client/components";

/*
 * searchModal extra functions
 */
function tagToggle(arr, val) {
  if (arr.length === _.pull(arr, val).length) {
    arr.push(val);
  }
  return arr;
}

function extractAnalyticsItems(allOrders) {
  const analytics = {};
  allOrders.forEach((order) => {
    if (order.workflow.status !== "canceled") {
      order.items.forEach((item) => {
        if (analytics[item.title]) {
          analytics[item.title].quantitySold += item.quantity;
          analytics[item.title].totalSales += item.variants.price * item.quantity;
        } else {
          analytics[item.title] = {
            quantitySold: item.quantity,
            totalSales: item.variants.price * item.quantity
          };
        }
      });
    }
  });
  return { analytics };
}
/*
 * searchModal onCreated
 */
Template.searchModal.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    initialLoad: true,
    slug: "",
    canLoadMoreProducts: false,
    searchQuery: "",
    productSearchResults: [],
    analytics: {},
    tagSearchResults: []
  });
  // Allow modal to be closed by clicking ESC
  // Must be done in Template.searchModal.onCreated and not in Template.searchModal.events
  $(document).on("keyup", (event) => {
    if (event.keyCode === 27) {
      const view = this.view;
      $(".js-search-modal").fadeOut(400, () => {
        $("body").css("overflow", "visible");
        Blaze.remove(view);
      });
    }
  });

  function sortProductsOnPrice(products, sortBy) {
    let sortOrder;
    if (sortBy === "lowest") {
      sortOrder = 1;
    } else if (sortBy === "highest") {
      sortOrder = -1;
    }

    return products.sort((firstProduct, nextProduct) => {
      const result = (firstProduct.price.min < nextProduct.price.min) ? -1 :
        (firstProduct.price.min > nextProduct.price.min) ? 1 : 0;
      return result * sortOrder;
    });
  }

  function sortProductsByBestSeller(productResults) {
    const bestSelling = () => {
      const instance = Template.instance();
      const products = [];
      const analytics = instance.state.get("analytics");
      Object.keys(analytics).forEach((key) => {
        products.push({
          product: key,
          quantitySold: analytics[key].quantitySold
        });
      });
      return _.orderBy(
        products,
        product => product.quantitySold,
        "desc"
      );
    };
    bestSellers = bestSelling();
    bestSellers = bestSellers.map((product) => {
      return product.product;
    });

    bestSellers = bestSellers.filter((product) => {
      return product;
    });

    productList = productResults.map((product) => {
      return product.title;
    });

    productList = productList.filter((product) => {
      return product;
    });

    const common = $.grep(bestSellers, function (element) {
      return $.inArray(element, productList) !== -1;
    });

    // there is a better way to do this
    const finalResult = [];
    common.forEach((title) => {
      productResults.forEach((product) => {
        if (title === product.title) {
          finalResult.push(product);
        }
      });
    });

    common.forEach((title) => {
      productResults.forEach((product) => {
        if (product.title !== title) {
          if (!finalResult.includes(product)) {
            finalResult.push(product);
          }
        }
      });
    });
    return finalResult;
  }

  function filterByPrice(products, limits) {
    // for 1000 and above, one item sits in the limits array
    if (!limits[1]) {
      return products.filter((product) => {
        if (product.price) {
          if (product.price.max >= limits[0]) {
            return product;
          }
        }
      });
    }
    return products.filter((product) => {
      if (product.price) {
        if (product.price.min >= limits[0] && product.price.max <= limits[1]) {
          return product;
        }
      }
    });
  }

  function sortProductsByDate(products, sortBy) {
    const sortedProducts = products.sort((firstProduct, nextProduct) => {
      return firstProduct.createdAt - nextProduct.createdAt;
    });

    if (sortBy === "oldest") {
      return sortedProducts;
    } else if (sortBy === "newest") {
      return sortedProducts.reverse();
    }
  }

  this.autorun(() => {
    const searchCollection = this.state.get("searchCollection") || "products";
    const searchQuery = this.state.get("searchQuery");
    const facets = this.state.get("facets") || [];
    const sub = this.subscribe("SearchResults", searchCollection, searchQuery, facets);
    const sortBy = Session.get("sortBy");
    const vendorChoice = Session.get("vendorChoice");
    const productChoice = Session.get("productChoice");
    const priceFilter = Session.get("priceFilter");
    const brandChoice = Session.get("brandChoice");
    const orderSub = this.subscribe("Orders");

    if (sub.ready()) {
      /*
       * Product Search
       */
      if (searchCollection === "products") {
        let productResults = ProductSearch.find().fetch();
        // Display sort and filter options if there are search results/search query
        if (productResults.length > 0 && searchQuery.length > 0) {
          Session.set("displaySortandFilter", true);
        } else {
          Session.set("displaySortandFilter", false);
        }

        if (sortBy !== "default") {
          if (sortBy === "lowest" || sortBy === "highest") {
            productResults = sortProductsOnPrice(productResults, sortBy);
          } else if (sortBy === "newest" || sortBy === "oldest") {
            productResults =  sortProductsByDate(productResults, sortBy);
          } else if (sortBy === "best-seller") {
            productResults = sortProductsByBestSeller(productResults);
          }
        }

        // get all vendors for products in search result
        let vendors = productResults.map((product) => {
          return product.vendor;
        });

        // remove vendor if vendor == null
        vendors = vendors.filter((vendor) => {
          return vendor;
        });

        const productVendors = [...new Set(vendors)];
        Session.set("vendors", productVendors);

        if (vendorChoice !== "allVendors") {
          productResults = productResults.filter((product) => {
            return product.vendor === vendorChoice;
          });
        }
        // some changes
        const bestSelling = () => {
          const instance = Template.instance();
          const products = [];
          const analytics = instance.state.get("analytics");
          Object.keys(analytics).forEach((key) => {
            products.push({
              product: key,
              quantitySold: analytics[key].quantitySold
            });
          });
          return _.orderBy(
            products,
            product => product.quantitySold,
            "desc"
          );
        };

        let products = bestSelling();
        products = products.map((product) => {
          return product.product;
        });

        // remove product if product == null
        // do we need this?
        products = products.filter((product) => {
          return product;
        });

        const productNames = [...new Set(products)];
        Session.set("products", productNames);

        if (productChoice !== "allProducts") {
          productResults = productResults.filter((product) => {
            return product.title === productChoice;
          });
        }
        if (priceFilter !== "all") {
          let range = priceFilter.split("-");
          range = range.map((limit) => {
            return Number(limit);
          });
          productResults = filterByPrice(productResults, range);
        }

        // get all brands for products in search result
        let brands = productResults.map((product) => {
          if (product.brand) {
            return product.brand;
          }
        });

        // if brand is null, remove it
        brands = brands.filter((brand) => {
          return brand;
        });
        const productBrands = [...new Set(brands)];
        Session.set("brands", productBrands);

        if (brandChoice !== "allBrands") {
          productResults = productResults.filter((product) => {
            return product.brand === brandChoice;
          });
        }

        const productResultsCount = productResults.length;
        this.state.set("productSearchResults", productResults);
        this.state.set("productSearchCount", productResultsCount);

        const hashtags = [];
        for (const product of productResults) {
          if (product.hashtags) {
            for (const hashtag of product.hashtags) {
              if (!_.includes(hashtags, hashtag)) {
                hashtags.push(hashtag);
              }
            }
          }
        }
        const tagResults = Tags.find({
          _id: { $in: hashtags }
        }).fetch();
        this.state.set("tagSearchResults", tagResults);

        // TODO: Do we need this?
        this.state.set("accountSearchResults", "");
        this.state.set("orderSearchResults", "");
      }

      /*
       * Account Search
       */
      if (searchCollection === "accounts") {
        const accountResults = AccountSearch.find().fetch();
        const accountResultsCount = accountResults.length;
        this.state.set("accountSearchResults", accountResults);
        this.state.set("accountSearchCount", accountResultsCount);

        // TODO: Do we need this?
        this.state.set("orderSearchResults", "");
        this.state.set("productSearchResults", "");
        this.state.set("tagSearchResults", "");
      }

      /*
       * Order Search
       */
      if (searchCollection === "orders") {
        const orderResults = OrderSearch.find().fetch();
        const orderResultsCount = orderResults.length;
        this.state.set("orderSearchResults", orderResults);
        this.state.set("orderSearchCount", orderResultsCount);


        // TODO: Do we need this?
        this.state.set("accountSearchResults", "");
        this.state.set("productSearchResults", "");
        this.state.set("tagSearchResults", "");
      }
    }

    if (orderSub.ready()) {
      const allOrders = Orders.find().fetch();
      if (allOrders) {
        const analyticsItems = extractAnalyticsItems(allOrders);
        this.state.set("analytics", analyticsItems.analytics);
      }
    }
  });
});


/*
 * searchModal helpers
 */
Template.searchModal.helpers({
  getProductVendors() {
    return Session.get("vendors");
  },
  displaySortandFilter() {
    return Session.get("displaySortandFilter");
  },
  getProductBrands() {
    return Session.get("brands");
  },
  getProductNames() {
    return Session.get("products");
  },

  IconButtonComponent() {
    const instance = Template.instance();
    const view = instance.view;

    return {
      component: IconButton,
      icon: "fa fa-times",
      onClick() {
        $(".js-search-modal").fadeOut(400, () => {
          $("body").css("overflow", "visible");
          Blaze.remove(view);
        });
      }
    };
  },
  productSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("productSearchResults");
    return results;
  },
  tagSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("tagSearchResults");
    return results;
  },
  showSearchResults() {
    return false;
  }
});


/*
 * searchModal events
 */
Template.searchModal.events({
  // on type, reload Reaction.SaerchResults
  "keyup input": (event, templateInstance) => {
    event.preventDefault();
    // initialize vendorChoice to allVendors
    Session.set("vendorChoice", "allVendors");

    // initialize productChoice to allProducts
    Session.set("productChoice", "allProducts");

    // initialize sortBy to default
    Session.set("sortBy", "default");

    // initialize priceFilter to all
    Session.set("priceFilter", "all");

    // initialize brandChoice to allBrands
    Session.set("brandChoice", "allBrands");

    const searchQuery = templateInstance.find("#search-input").value;
    templateInstance.state.set("searchQuery", searchQuery);
    $(".search-modal-header:not(.active-search)").addClass(".active-search");
    if (!$(".search-modal-header").hasClass("active-search")) {
      $(".search-modal-header").addClass("active-search");
    }
  },
  "click [data-event-action=filter]": function (event, templateInstance) {
    event.preventDefault();
    const instance = Template.instance();
    const facets = instance.state.get("facets") || [];
    const newFacet = $(event.target).data("event-value");

    tagToggle(facets, newFacet);

    $(event.target).toggleClass("active-tag btn-active");

    templateInstance.state.set("facets", facets);
  },

  // get sort query
  "change #vendor-choice"(event) {
    event.preventDefault();
    // Set vendorChoice to user selected choice
    Session.set("vendorChoice", event.target.value);
  },

  "change #best-choice"(event) {
    event.preventDefault();
    // Set productChoice to user selected choice
    Session.set("productChoice", event.target.value);
  },

  "change #price-filter"(event) {
    event.preventDefault();
    // Set priceFilter to user selected choice
    Session.set("priceFilter", event.target.value);
  },

  "change #sort-choice"(event) {
    event.preventDefault();
    // Set sortBy to user selected choice
    Session.set("sortBy", event.target.value);
  },

  "change #brand-choice"(event) {
    event.preventDefault();
    // if user selects a brand, set brandChoice to that choice
    Session.set("brandChoice", event.target.value);
  },

  "click [data-event-action=productClick]": function () {
    const instance = Template.instance();
    const view = instance.view;
    $(".js-search-modal").delay(400).fadeOut(400, () => {
      Blaze.remove(view);
    });
  },
  "click [data-event-action=clearSearch]": function (event, templateInstance) {
    $("#search-input").val("");
    $("#search-input").focus();
    const searchQuery = templateInstance.find("#search-input").value;
    templateInstance.state.set("searchQuery", searchQuery);
  },
  "click [data-event-action=searchCollection]": function (event, templateInstance) {
    event.preventDefault();
    const searchCollection = $(event.target).data("event-value");

    $(".search-type-option").not(event.target).removeClass("search-type-active");
    $(event.target).addClass("search-type-active");

    $("#search-input").focus();

    templateInstance.state.set("searchCollection", searchCollection);
  }
});


/*
 * searchModal onDestroyed
 */
Template.searchModal.onDestroyed(() => {
  // Kill Allow modal to be closed by clicking ESC, which was initiated in Template.searchModal.onCreated
  $(document).off("keyup");
});
