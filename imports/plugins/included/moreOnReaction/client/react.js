import { Template } from "meteor/templating";
import "./react.html";

const template = {};

Template.tour.onRendered(function () {
  template.welcomeText = this.$(".welcomeText").html();
});
