import Shepherd from "tether-shepherd";
 import "/node_modules/tether-shepherd/dist/css/shepherd-theme-arrows.css";
 import { Accounts } from "/lib/collections";
 import { Template } from "meteor/templating";
 import { Meteor } from "meteor/meteor";
 import "./tour.html";
 
 function options(whoseTour) {
   return {defaults: {
     showCancelLink: true,
     scrollTo: true,
     classes: "shepherd-theme-arrows",
     buttons: [getButton(whoseTour).back, getButton(whoseTour).next]}
   };
 }
 
 export const vendorTour = new Shepherd.Tour(options("vendorTour"));
 export const buyerTour = new Shepherd.Tour(options("buyerTour"));
 
 function getButton(whichTour) {
   let actionBack;