/* eslint-disable camelcase */
import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";
import { BsCpu, BsFillCpuFill, BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { PiCpu, PiCpuFill } from "react-icons/pi";
import { MdOutlineSmartDisplay, MdSmartDisplay } from "react-icons/md";

import useWidgetAPI from "utils/proxy/use-widget-api";

function millisecondsToTime(milliseconds) {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  return { hours, minutes, seconds };
}

function millisecondsToString(milliseconds) {
  const { hours, minutes, seconds } = millisecondsToTime(milliseconds);

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

function generateStreamTitle(session, enableUser, showEpisodeNumber) {
  let stream_title = "";
  const { mediaType, mediaTitle, showTitle, seasonNumber, episodeNumber, username } = session;

  if (mediaType === "episode" && showEpisodeNumber) {
    const season_str = `S${seasonNumber.toString().padStart(2, "0")}`;
    const episode_str = `E${episodeNumber.toString().padStart(2, "0")}`;
    stream_title = `${showTitle}: ${season_str} · ${episode_str} - ${mediaTitle}`;
  } else if (mediaType === "episode") {
    stream_title = `${showTitle} - ${mediaTitle}`;
  } else {
    stream_title = mediaTitle;
  }

  return enableUser ? `${stream_title} (${username})` : stream_title;
}

function SingleSessionEntry({ session, enableUser, showEpisodeNumber }) {
  const { durationMs, progressMs, state, videoDecision, audioDecision } = session;

  const transcodingValid = session.transcodeInfo != null;
  const { hwEncoding } = session?.transcodeInfo || {
    hwEncoding: false
  };

  const progress_percent = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;
  const stream_title = generateStreamTitle(session, enableUser, showEpisodeNumber);

  let iconType = "play";
  if (transcodingValid) {
    if (videoDecision === "directplay" || videoDecision === "copy" || hwEncoding) {
      iconType = "cpu";
    }
    else {
      iconType = "cpuFilled";
    }
  }

  return (
    <>
      <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
        <div className="text-xs z-10 self-center ml-2 relative w-full h-4 grow mr-2">
          <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden" title={stream_title}>
            {stream_title}
          </div>
        </div>
        <div className="self-center text-lg flex justify-end pl-0.5">
          {(iconType === "play") && <MdOutlineSmartDisplay className="opacity-55" />}
          {(iconType === "cpu") && <PiCpu className="opacity-55" />}
          {(iconType === "cpuFilled") && <PiCpuFill className="opacity-55" />}
        </div>
      </div>

      <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
        <div
          className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
          style={{
            width: `${progress_percent}%`,
          }}
        />
        <div className="text-xs z-10 self-center ml-1">
          {state === "paused" && (
            <BsPauseFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
          )}
          {state !== "paused" && (
            <BsFillPlayFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
          )}
        </div>
        <div className="grow " />
        <div className="self-center text-xs flex justify-end mr-2 z-10">
          {millisecondsToString(progressMs)}
          <span className="mx-0.5 text-[8px]">/</span>
          {millisecondsToString(durationMs)}
        </div>
      </div>
    </>
  );
}

function SessionEntry({ session, enableUser, showEpisodeNumber }) {
  const { durationMs, progressMs, state, videoDecision, audioDecision } = session;
  const transcodingValid = session.transcodeInfo != null;
  const { hwEncoding } = session?.transcodeInfo || {
    hwEncoding: false
  };
  const progress_percent = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;
  const stream_title = generateStreamTitle(session, enableUser, showEpisodeNumber);

  let iconType = "play";
  if (transcodingValid) {
    if (videoDecision === "directplay" || videoDecision === "copy" || hwEncoding) {
      iconType = "cpu";
    }
    else {
      iconType = "cpuFilled";
    }
  }

  return (
    <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
      <div
        className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
        style={{
          width: `${progress_percent}%`,
        }}
      />
      <div className="text-xs z-10 self-center ml-1">
        {state === "paused" && (
          <BsPauseFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
        )}
        {state !== "paused" && (
          <BsFillPlayFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
        )}
      </div>
      <div className="text-xs z-10 self-center ml-2 relative w-full h-4 grow mr-2">
        <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden" title={stream_title}>
          {stream_title}
        </div>
      </div>
      <div className="self-center text-xs flex justify-end mr-2 z-10">{millisecondsToString(progressMs)}</div>
      <div className="self-center text-lg flex justify-end pl-0.5 z-10">
        {(iconType === "play") && <MdOutlineSmartDisplay className="opacity-55" />}
        {(iconType === "cpu") && <PiCpu className="opacity-55" />}
        {(iconType === "cpuFilled") && <PiCpuFill className="opacity-55" />}
      </div>
    </div>
  );
}

function SummaryView({ service, summary, t }) {
  return (
    <Container service={service}>
      <Block label="tracearr.streams" value={t("common.number", { value: summary.total })} />
      <Block label="tracearr.transcodes" value={t("common.number", { value: summary.transcodes })} />
      <Block label="tracearr.directplay" value={t("common.number", { value: summary.directPlays })} />
      <Block label="tracearr.bitrate" value={summary.totalBitrate} />
    </Container>
  );
}

function DetailsView({ playing, enableUser, showEpisodeNumber, expandOneStreamToTwoRows, t }) {
  if (playing.length === 0) {
    return (
      <div className="flex flex-col pb-1 mx-1">
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">{t("tracearr.no_active")}</span>
        </div>
        {expandOneStreamToTwoRows && (
          <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
            <span className="absolute left-2 text-xs mt-[2px]">-</span>
          </div>
        )}
      </div>
    );
  }

  if (expandOneStreamToTwoRows && playing.length === 1) {
    const session = playing[0];
    return (
      <div className="flex flex-col pb-1 mx-1">
        <SingleSessionEntry session={session} enableUser={enableUser} showEpisodeNumber={showEpisodeNumber} />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-1 mx-1">
      {playing.map((session) => (
        <SessionEntry
          key={session.id}
          session={session}
          enableUser={enableUser}
          showEpisodeNumber={showEpisodeNumber}
        />
      ))}
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: activityData, error: activityError } = useWidgetAPI(widget, "streams", {
    refreshInterval: 5000,
  });

  const enableUser = !!service.widget?.enableUser;
  const expandOneStreamToTwoRows = service.widget?.expandOneStreamToTwoRows !== false;
  const showEpisodeNumber = !!service.widget?.showEpisodeNumber;
  const view = service.widget?.view ?? "details";

  if (activityError) {
    return <Container service={service} error={activityError} />;
  }

  // Loading state
  if (!activityData || !activityData.data) {
    if (view === "summary") {
      return (
        <Container service={service}>
          <Block label="tracearr.streams" />
          <Block label="tracearr.transcodes" />
          <Block label="tracearr.directplay" />
          <Block label="tracearr.bitrate" />
        </Container>
      );
    }
    return (
      <div className="flex flex-col pb-1 mx-1">
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">-</span>
        </div>
        {expandOneStreamToTwoRows && (
          <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
            <span className="absolute left-2 text-xs mt-[2px]">-</span>
          </div>
        )}
      </div>
    );
  }

  const playing = activityData.data.sort((a, b) => a.progressMs - b.progressMs);
  const { summary } = activityData;

  if (view === "summary") {
    return <SummaryView service={service} summary={summary} t={t} />;
  }

  if (view === "both") {
    return (
      <>
        <SummaryView service={service} summary={summary} t={t} />
        <DetailsView
          playing={playing}
          enableUser={enableUser}
          showEpisodeNumber={showEpisodeNumber}
          expandOneStreamToTwoRows={expandOneStreamToTwoRows}
          t={t}
        />
      </>
    );
  }

  // Default: details view
  return (
    <DetailsView
      playing={playing}
      enableUser={enableUser}
      showEpisodeNumber={showEpisodeNumber}
      expandOneStreamToTwoRows={expandOneStreamToTwoRows}
      t={t}
    />
  );
}
