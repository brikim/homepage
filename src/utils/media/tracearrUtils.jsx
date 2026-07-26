import { MdOutlineSmartDisplay } from "react-icons/md";
import { PiCpu, PiCpuFill } from "react-icons/pi";
import { SiPlex, SiEmby, SiJellyfin } from "react-icons/si";

export function DecisionType(audio, video, hwEncoding) {
  let iconType = "play";
  if (video === "transcode" || audio === "transcode") {
    if (video !== "transcode" || hwEncoding) {
      iconType = "cpu";
    }
    else {
      iconType = "cpuFilled";
    }
  }
  return iconType;
}

function ServerType(serverName) {
  const lower_server_name = serverName.toLowerCase();
  let server_type = "";
  if (lower_server_name.includes("plex")) {
    server_type = "plex";
  } else if (lower_server_name.includes("emby")) {
    server_type = "emby";
  } else if (lower_server_name.includes("jellyfin")) {
    server_type = "jellyfin";
  }
  return server_type;
}

export function TracearrServerIcon({ serverName, opacity }) {
  const server_type = ServerType(serverName);
  return (
    <div className="self-center text-lg flex justify-end pl-0.5">
      {(server_type === "plex") && <SiPlex className={opacity} />}
      {(server_type === "emby") && <SiEmby className={opacity} />}
      {(server_type === "jellyfin") && <SiJellyfin className={opacity} />}
    </div>
  );
}

export function TracearrTranscodeState({ audio, video, hwEncoding }) {
  let iconType = "play";
  if (video === "transcode" || audio === "transcode") {
    if (video !== "transcode" || hwEncoding) {
      iconType = "cpu";
    }
    else {
      iconType = "cpuFilled";
    }
  }

  return (
    <div className="self-center text-lg flex justify-end pl-0.5 z-10">
      {(iconType === "play") && <MdOutlineSmartDisplay className="opacity-55" />}
      {(iconType === "cpu") && <PiCpu className="opacity-55" />}
      {(iconType === "cpuFilled") && <PiCpuFill className="opacity-55" />}
    </div>
  );
}