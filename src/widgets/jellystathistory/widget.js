import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    getHistory: {
      endpoint: "getHistory",
      params: ["size"],
    },
  },
};

export default widget;
