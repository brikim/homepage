import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
//import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,
  //proxyHandler: genericProxyHandler,

  mappings: {
    "docker/containers": {
      endpoint: "environments/{env}/containers/counts",
    },
  },
};

export default widget;
 