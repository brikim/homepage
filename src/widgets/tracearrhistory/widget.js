import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v2/public/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    history_server: {
      endpoint: "history",
      params: ["serverId", "pageSize"],
    },
    history_noserver: {
      endpoint: "history",
      params: ["pageSize"],
    },
  },
};

export default widget;
