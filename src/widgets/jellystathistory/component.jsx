/* eslint-disable camelcase */
import { useTranslation } from "next-i18next";
import { DateTime } from "luxon";
import { useState } from "react";
import classNames from "classnames";

import Container from "components/services/widget/container";
import PlatformIcon from "utils/media/platformIcon";
import PlayStatusIcon from "utils/media/playStatusIcon";
import useWidgetAPI from "utils/proxy/use-widget-api";

function secondsToTime(secondsValue) {
  const milliseconds = secondsValue * 1000;
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  return { hours, minutes, seconds };
}

function secondsToString(secondsValue) {
  const { hours, minutes, seconds } = secondsToTime(secondsValue);
  let timeVal = "";
  if (hours > 0) {
    timeVal = hours.toString();
    timeVal += ":";
    timeVal += minutes.toString().padStart(2, "0");
  }
  else {
    timeVal += minutes.toString();
  }
  timeVal += ":";
  timeVal += seconds.toString().padStart(2, "0");
  return timeVal;
}

function RecordEntry({ record }) {
  const [hover, setHover] = useState(false);
  const { i18n } = useTranslation();
  const { NowPlayingItemName, Client, DeviceName, ActivityDateInserted, PlaybackDuration, PlayMethod, SeriesName, UserName } = record;

  let streamTitle = ""
  if (SeriesName) {
    streamTitle = `${SeriesName} - ${NowPlayingItemName}`;
  }
  else {
    streamTitle = NowPlayingItemName;
  }

  const playDate = DateTime.fromISO(ActivityDateInserted);
  const key = `record-${NowPlayingItemName}-${ActivityDateInserted}-${UserName}`;

  let platform = "";
  const lowerClient = Client.toLowerCase();
  if (lowerClient.includes("android")) {
    platform = "android";
  }
  else if (lowerClient.includes("roku")) {
    platform = "roku"
  }
  else if (lowerClient.includes("web")) {
    platform = "chrome";
  }
  else if (lowerClient.includes("apple")) {
    platform = "ios"
  }
  else if (lowerClient.includes("lg")) {
    platform = "lg"
  }

  let transcode_decision = "";
  if (PlayMethod === "DirectStream") {
    transcode_decision = "direct play";
  }

  // Requires setHover in each section since hover changes the right hand side
  return (
    <div className="flex flex-row text-theme-700 dark:text-theme-200 items-center text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
      <div 
        className="flex"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        key={key}>
        <div className="text-xs z-10 self-center ml-1 mr-1 h-4 grow">
          <div className="w-11 z-10 self-center overflow-hidden justify-start">{playDate.setLocale(i18n.language).toLocaleString({ month: "short", day: "numeric" })}</div>
        </div>
        {platform && <PlatformIcon platform={platform.toLowerCase()} opacity="opacity-70"/>}
        <div className="text-xs z-10 self-center ml-2 h-4 grow mr-1">
          <div className="w-16 z-10 self-center overflow-hidden justify-start">{UserName}</div>
        </div>
      </div>
      <div className="z-10 self-center ml-1 relative w-full h-4 grow mr-1">
          {!hover && 
            <div
              className="absolute text-xs w-full whitespace-nowrap text-ellipsis overflow-hidden"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              key={key}>{streamTitle}</div>
          }
          {hover &&
            <div 
              className="absolute text-xs w-full flex whitespace-nowrap text-ellipsis overflow-hidden"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              key={key}>
              <div className="w-5 self-center justify-start">
                <PlayStatusIcon videoDecision={transcode_decision} audioDecision={transcode_decision} opacity="opacity-70"/>
              </div>
              <div className="self-center ml-1 whitespace-nowrap text-ellipsis overflow-hidden">{DeviceName}</div>
              <div className="grow "/>
              <div className="self-center text-xs justify-end mr-0.5 pl-1">{PlaybackDuration && secondsToString(PlaybackDuration)}</div>
            </div>
          }
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const maxItems = widget?.maxItems ?? 10;

  const { data: historyData, error: historyError } = useWidgetAPI(widget, "getHistory");
  
  if (historyError) {
    return <Container service={service} error={historyError ?? { message: t("jellystathistory.connection_error") }} />;
  }

  if (!historyData || historyData.length === 0) {
    return (
      <div className={classNames("flex flex-col", (!historyData || historyData.length === 0) && "animate-pulse")}>
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">{t("jellystathistory.no_history")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-1 mx-1">
      { historyData.slice(0, maxItems).map((record) => (
        <RecordEntry 
          key={`record-entry-${record.NowPlayingItemName}-${record.UserName}-${record.Id}`}
          record={record} 
        />
      ))}
    </div>
  );
}
