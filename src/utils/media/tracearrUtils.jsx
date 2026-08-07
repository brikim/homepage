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

export function TracearrServerIcon({ server_type, opacity }) {
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

export function TracearrWebPlatform({ player }) {
  const lower_player_name = player.toLowerCase();
  let web_player_name = lower_player_name;
  if (lower_player_name.includes("firefox")) {
    web_player_name = "firefox";
  } else if (lower_player_name.includes("chrome")) {
    web_player_name = "chrome";
  } else if (lower_player_name.includes("safari")) {
    web_player_name = "safari";
  } else if (lower_player_name.includes("microsoft edge")) {
    web_player_name = "microsoft edge";
  }
  return web_player_name;
}