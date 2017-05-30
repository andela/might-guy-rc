import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "ActionableAnalytics",
  name: "reaction-actionable-analytics",
  icon: "fa fa-pie-chart",
  autoEnable: true,
  settings: {
    name: "ActionableAnalytics"
  },
  registry: [{
    route: "/dashboard/actionable_analytics",
    provides: "dashboard",
    workflow: "coreDashboardWorkflow",
    name: "actionableAnalytics",
    label: "Actionable Analytics",
    description: "View Actionable Analytics For Your Shop",
    icon: "fa fa-pie-chart",
    priority: 1,
    container: "core",
    template: "actionableAnalytics"
  }, {
    route: "/dashboard/actionablee_analytics",
    name: "actionable_analytics",
    provides: "shortcut",
    label: "Actionable Analytics",
    description: "View Actionable Analytics For Your Shop",
    icon: "fa fa-pie-chart",
    priority: 1
  }]
});
