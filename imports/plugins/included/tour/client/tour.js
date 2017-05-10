import Shepherd from "tether-shepherd";
import "/node_modules/tether-shepherd/dist/css/shepherd-theme-arrows.css";
import { Accounts } from "/lib/collections";
import { Template } from "meteor/templating";
import "./tour.html";

function options(whoseTour) {
  return { defaults: {
    showCancelLink: true,
    scrollTo: true,
    classes: "shepherd-theme-arrows",
    buttons: [getButton(whoseTour).back, getButton(whoseTour).next] }
  };
}

export const vendorTour = new Shepherd.Tour(options("vendorTour"));
export const buyerTour = new Shepherd.Tour(options("buyerTour"));

function getButton(whichTour) {
  let actionBack;
  let actionHide;
  let actionNext;
  let actionNextTime;
  if (whichTour === "vendorTour") {
    actionNext = ()=>{
      vendorTour.next();
    };
    actionHide = ()=>{
      vendorTour.back();
    };
    actionNextTime = ()=>{
      vendorTour.show("toViewnextTime");
    };
  }  else if (whichTour === "buyerTour") {
    actionNext = () => {
      buyerTour.next();
    };
    actionHide = () => {
      buyerTour.hide();
    };
    actionBack = () => {
      buyerTour.back();
    };
    actionNextTime = () =>{
      buyerTour.show("toViewnextTime");
    };
  }

  const allButtons = {
    nexttime:
    {
      text: "Skip Tour",
      classes: "shepherd-button-secondary",
      action: () => {
        Accounts.update({ _id: Meteor.userId() }, { $set: { takenTour: true } });
        return actionNextTime();
      }
    },
    next:
    {
      text: "Next",
      action: actionNext,
      classes: "shepherd-button-secondary"
    },
    back:
    {
      text: "Back",
      action: actionBack,
      classes: "shepherd-button-secondary"
    },
    finish:
    {
      text: "Finish",
      action: actionHide,
      classes: "shepherd-button-secondary"
    }
  };
  return allButtons;
}
const template = {};

Template.tour.onRendered(function () {
  template.welcomeText = this.$(".welcomeText").html();
  template.aboutDashboard = this.$(".aboutDashboard").html();
  template.product = this.$(".product").html();
  template.profileOrdersAccounts = this.$(".profileOrdersAccounts").html();
  template.shop = this.$(".shop").html();
  template.retakeTour = this.$(".retakeTour").html();
  template.welcomeBuyer = this.$(".welcomeBuyer").html();
  template.profile = this.$(".profile").html();
  template.cart = this.$(".cart").html();
  template.shopBuyer = this.$(".shopBuyer").html();

  vendorTour.addStep("Welcome", {
    title: "Welcome to Reaction Commerce",
    text: template.welcomeText,
    buttons: [getButton("vendorTour").nexttime, getButton("vendorTour").next]
  });

  vendorTour.addStep("toDashboard", {
    title: "View Dashboard",
    text: template.aboutDashboard,
    attachTo: ".tour-accounts bottom",
    advanceOn: "#dropown-apps-dashboard click"
  });

  vendorTour.addStep("newProduct", {
    title: "Create New Product",
    text: template.product,
    attachTo: ".tour-create-content left"
  });

  vendorTour.addStep("profileOrdersAccounts", {
    title: "Orders",
    text: template.profileOrdersAccounts,
    attachTo: ".tour-accounts bottom"
  });

  vendorTour.addStep("visitShop", {
    title: "Shop",
    text: template.shop,
    attachTo: ".rui.tag.link bottom"
  });

  vendorTour.addStep("toViewnextTime", {
    title: "Information",
    text: template.retakeTour,
    attachTo: ".tour-accounts bottom",
    buttons: [getButton("vendorTour").back, getButton("vendorTour").finish ]
  });

  buyerTour.addStep("welcomeBuyer", {
    title: "Welcome",
    text: template.welcomeBuyer,
    buttons: [getButton("buyerTour").nexttime, getButton("buyerTour").next]
  });

  buyerTour.addStep("shopBuyer", {
    title: "Shop",
    text: template.shopBuyer,
    attachTo: ".rui.tag.link bottom"
  });

  buyerTour.addStep("profile", {
    title: "Profile",
    text: template.profile,
    attachTo: ".tour-accounts bottom"
  });

  buyerTour.addStep("Cart", {
    title: "Cart",
    text: template.cart,
    attachTo: ".cart-icon bottom"
  });

  buyerTour.addStep("toViewnextTime", {
    title: "Information",
    text: template.retakeTour,
    buttons: [getButton("buyerTour").finish ]
  });
});
