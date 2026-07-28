/* eslint-disable camelcase */
import { useTranslation } from "next-i18next/pages";
import { DateTime } from "luxon";
import { useState, useMemo } from "react";
import { BiCircle, BiSolidCircle, BiSolidCircleHalf, BiSolidCircleQuarter, BiSolidCircleThreeQuarter } from "react-icons/bi";
import classNames from "classnames";
import Container from "components/services/widget/container";
import PlatformIcon from "utils/media/platformIcon";

import { TracearrServerIcon, TracearrTranscodeState } from "utils/media/tracearrUtils";
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
  const { id, mediaTitle, platform, product, player, startedAt, serverName, durationMs, totalDurationMs, showTitle, stoppedAt, videoDecision, audioDecision } = record;
  const user = record.user.username;

  let streamTitle = ""
  if (showTitle) {
    streamTitle = `${showTitle} - ${mediaTitle}`;
  }
  else {
    streamTitle = mediaTitle;
  }

  const playDate = DateTime.fromISO(stoppedAt ?? startedAt);
  const extraInfo = `${product} - ${player}`;

  let watched_status = null;
  const percent = durationMs / totalDurationMs;
  if (percent >= 0.1 && percent < 0.35) {
    watched_status = 0.25;
  } else if (percent >= 0.35 && percent < 0.65) {
    watched_status = 0.5;
  } else if (percent >= 0.65 && percent < 0.9) {
    watched_status = 0.75;
  }
  else if (percent >= 0.9) {
    watched_status = 1;
  }

  // Requires setHover in each section since hover changes the right hand side
  return (
    <div className="flex flex-row text-theme-700 dark:text-theme-200 items-center text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
      <div
        className="flex"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        key={id}>
        <div className="text-xs z-10 self-center ml-1 mr-1 h-4 grow">
          <div className="w-11 z-10 self-center overflow-hidden justify-start">{playDate.setLocale(i18n.language).toLocaleString({ month: "short", day: "numeric" })}</div>
        </div>
        {serverName && <TracearrServerIcon serverName={serverName} opacity="opacity-70" />}
        {platform && <PlatformIcon platform={platform.toLowerCase()} opacity="opacity-70" />}
        <div className="text-xs z-10 self-center ml-2 h-4 grow mr-1">
          <div className="w-16 z-10 self-center overflow-hidden justify-start">{user}</div>
        </div>
      </div>
      <div className="z-10 self-center ml-1 relative w-full h-4 grow mr-1">
        {!hover &&
          <div
            className="absolute text-xs w-full whitespace-nowrap text-ellipsis overflow-hidden"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            key={id}>{streamTitle}</div>
        }
        {hover &&
          <div
            className="absolute text-xs w-full flex whitespace-nowrap text-ellipsis overflow-hidden"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            key={id}>
            <div className="w-5 self-center justify-start">
              <TracearrTranscodeState audio={audioDecision} video={videoDecision} hwEncoding={false} />
            </div>
            <div className="self-center ml-1 whitespace-nowrap text-ellipsis overflow-hidden">{extraInfo}</div>
            <div className="grow " />
            <div className="self-center text-xs justify-end mr-0.5 pl-1">{durationMs && secondsToString(durationMs / 1000)}</div>
            <div className="self-center flex justify-end mr-0.5 pl-0.5">
              <div className="text-base"><BiCircle className="opacity-40" /></div>
              <div className="absolute self-center">
                {watched_status === 0.25 &&
                  <div className="text-xs mr-0.5"><BiSolidCircleQuarter className="opacity-60" /></div>}
                {watched_status === 0.5 &&
                  <div className="text-xs mr-0.5"><BiSolidCircleHalf className="opacity-60" /></div>}
                {watched_status === 0.75 &&
                  <div className="text-xs mr-0.5"><BiSolidCircleThreeQuarter className="opacity-60" /></div>}
                {watched_status === 1 &&
                  <div className="text-xs mr-0.5"><BiSolidCircle className="opacity-60" /></div>}
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const serverId = widget?.serverId ?? "";
  const maxItems = widget?.maxItems ?? 10;

  // params for API fetch
  let params = null;
  let api = null;
  if (serverId !== "") {
    api = "history_server";
    params = useMemo(() => {
      const constructedParams = {
        serverId: "",
        state: "stopped",
        page: 1,
        pageSize: 0,
      };

      constructedParams.serverId = serverId;
      constructedParams.pageSize = maxItems + 10;

      return constructedParams;
    }, [serverId, maxItems]);
  } else {
    api = "history_noserver";
    params = useMemo(() => {
      const constructedParams = {
        state: "stopped",
        page: 1,
        pageSize: 0,
      };

      constructedParams.pageSize = maxItems + 10;

      return constructedParams;
    }, [maxItems]);
  }

  const { data: historyData, error: historyError } = useWidgetAPI(widget, api, params);

  if (historyError) {
    return <Container service={service} error={historyError ?? { message: t("tracearr.connection_error") }} />;
  }

  if (!historyData || historyData.data.length === 0) {
    return (
      <div className={classNames("flex flex-col", (!historyData || historyData.length === 0) && "animate-pulse")}>
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">{t("tracearr.no_history")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-1 mx-1">
      {historyData?.data
        ?.filter((record) => record.state === "stopped") // Keep only stopped items
        .slice(0, maxItems)                              // Keep only the first maxItems .map((record) => (
        .map((record) => (
          <RecordEntry
            key={`record-entry-${record.id}`}
            record={record}
          />
        ))}
    </div>
  );
}
