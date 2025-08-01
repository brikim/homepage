import { getSettings } from "utils/config/config";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import validateWidgetData from "utils/proxy/validate-widget-data";
import widgets from "widgets/widgets";

const logger = createLogger("credentialedProxyHandler");

export default async function credentialedProxyHandler(req, res, map) {
  const { group, service, endpoint, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

      const headers = {
        "Content-Type": "application/json",
      };

      if (widget.type === "stocks") {
        const { providers } = getSettings();
        if (widget.provider === "finnhub" && providers?.finnhub) {
          headers["X-Finnhub-Token"] = `${providers?.finnhub}`;
        }
      } else if (widget.type === "coinmarketcap") {
        headers["X-CMC_PRO_API_KEY"] = `${widget.key}`;
      } else if (widget.type === "gotify") {
        headers["X-gotify-Key"] = `${widget.key}`;
      } else if (widget.type === "checkmk") {
        headers["Accept"] = `application/json`;
        headers.Authorization = `Bearer ${widget.username} ${widget.password}`;
      } else if (
        [
          "argocd",
          "authentik",
          "cloudflared",
          "ghostfolio",
          "headscale",
          "hoarder",
          "karakeep",
          "linkwarden",
          "mealie",
          "netalertx",
          "tailscale",
          "tandoor",
          "pterodactyl",
          "vikunja",
          "firefly",
        ].includes(widget.type)
      ) {
        headers.Authorization = `Bearer ${widget.key}`;
      } else if (widget.type === "truenas") {
        if (widget.key) {
          headers.Authorization = `Bearer ${widget.key}`;
        } else {
          headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
        }
      } else if (widget.type === "proxmox") {
        headers.Authorization = `PVEAPIToken=${widget.username}=${widget.password}`;
      } else if (widget.type === "proxmoxbackupserver") {
        delete headers["Content-Type"];
        headers.Authorization = `PBSAPIToken=${widget.username}:${widget.password}`;
      } else if (["autobrr", "jellystat"].includes(widget.type)) {
        headers["X-API-Token"] = `${widget.key}`;
      } else if (widget.type === "tubearchivist") {
        headers.Authorization = `Token ${widget.key}`;
      } else if (widget.type === "miniflux") {
        headers["X-Auth-Token"] = `${widget.key}`;
      } else if (widget.type === "nextcloud") {
        if (widget.key) {
          headers["NC-Token"] = `${widget.key}`;
        } else {
          headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
        }
      } else if (widget.type === "paperlessngx") {
        if (widget.key) {
          headers.Authorization = `Token ${widget.key}`;
        } else {
          headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
        }
      } else if (widget.type === "azuredevops") {
        headers.Authorization = `Basic ${Buffer.from(`$:${widget.key}`).toString("base64")}`;
      } else if (widget.type === "glances") {
        headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
      } else if (widget.type === "plantit") {
        headers.Key = `${widget.key}`;
      } else if (widget.type === "myspeed") {
        headers.Password = `${widget.password}`;
      } else if (widget.type === "esphome") {
        if (widget.username && widget.password) {
          headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
        } else if (widget.key) {
          headers.Cookie = `authenticated=${widget.key}`;
        }
      } else if (widget.type === "wgeasy") {
        if (widget.username && widget.password) {
          headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
        } else {
          headers.Authorization = widget.password;
        }
      } else if (widget.type === "gitlab") {
        headers["PRIVATE-TOKEN"] = widget.key;
      } else if (widget.type === "speedtest") {
        if (widget.key) {
          // v1 does not require a key
          headers.Authorization = `Bearer ${widget.key}`;
        }
      } else {
        headers["X-API-Key"] = `${widget.key}`;
      }

      const [status, contentType, data] = await httpProxy(url, {
        method: req.method,
        withCredentials: true,
        credentials: "include",
        headers,
      });

      let resultData = data;

      if (resultData.error?.url) {
        resultData.error.url = sanitizeErrorURL(url);
      }

      if (status === 204 || status === 304) {
        return res.status(status).end();
      }

      if (status >= 400) {
        logger.error("HTTP Error %d calling %s", status, url.toString());
      }

      if (status === 200) {
        if (!validateWidgetData(widget, endpoint, resultData)) {
          return res
            .status(500)
            .json({ error: { message: "Invalid data", url: sanitizeErrorURL(url), data: resultData } });
        }
        if (map) resultData = map(resultData);
      }

      if (contentType) res.setHeader("Content-Type", contentType);
      return res.status(status).send(resultData);
    }
  }

  logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
  return res.status(400).json({ error: "Invalid proxy service type" });
}
