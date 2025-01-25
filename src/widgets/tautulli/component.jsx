/* eslint-disable camelcase */
import { useTranslation } from "next-i18next";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";

import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";
import PlatformIcon from "utils/media/platformIcon";
import PlayStatusIcon from "utils/media/playStatusIcon";
import MillisecondsToString from "utils/media/timeToString"

function generateStreamTitle(session, enableUser, showEpisodeNumber) {
  let stream_title = "";
  const { media_type, parent_media_index, media_index, title, grandparent_title, full_title, friendly_name } = session;
  if (media_type === "episode" && showEpisodeNumber) {
    const season_str = `S${parent_media_index.toString().padStart(2, "0")}`;
    const episode_str = `E${media_index.toString().padStart(2, "0")}`;
    stream_title = `${grandparent_title}: ${season_str} · ${episode_str} - ${title}`;
  } 
  else {
    stream_title = full_title;
  }

  return enableUser ? `${stream_title} (${friendly_name})` : stream_title;
}

function SingleSessionEntry({ session, enableUser, showEpisodeNumber }) {
  const { duration, view_offset, progress_percent, state, video_decision, audio_decision, transcode_decision, transcode_max_offset_available, platform } = session;

  const stream_title = generateStreamTitle(session, enableUser, showEpisodeNumber);
  let transcodeProgress = Number(progress_percent);
  if (video_decision === "transcode" || audio_decision === "transcode") {
    transcodeProgress = Math.round((Number(transcode_max_offset_available) * 1000) / Number(duration) * 100);
  }

  return (
    <>
      <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
        <PlatformIcon platform={platform.toLowerCase()} opacity="opacity-60"/>
        <div className="text-xs z-10 self-center ml-1 relative w-full h-4 grow mr-2">
          <div className="inline-flex absolute w-full whitespace-nowrap text-ellipsis overflow-hidden" title={stream_title}>
            {stream_title}
          </div>
        </div>
        <PlayStatusIcon videoDecision={video_decision} audioDecision={audio_decision} transcodeDecision={transcode_decision} opacity="opacity-60"/>
      </div>

      <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
        <div className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/25 z-0"
          style={{
            width: `${transcodeProgress}%`,
          }}
        />
        <div
          className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/50 z-0"
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
        <div className="self-center text-xs flex justify-end mr-1 z-10">
          {MillisecondsToString(view_offset)}
          <span className="mx-0.5 text-[8px]">/</span>
          {MillisecondsToString(duration)}
        </div>
      </div>
    </>
  );
}

function SessionEntry({ session, enableUser, showEpisodeNumber }) {
  const { duration, view_offset, progress_percent, state, video_decision, audio_decision, transcode_decision, transcode_max_offset_available, platform } = session;

  const stream_title = generateStreamTitle(session, enableUser, showEpisodeNumber);
  let transcodeProgress = Number(progress_percent);
  if (video_decision === "transcode" || audio_decision === "transcode") {
    transcodeProgress = Math.round((Number(transcode_max_offset_available) * 1000) / Number(duration) * 100);
  }

  return (
    <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
      <div className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/25 z-0"
          style={{
            width: `${transcodeProgress}%`,
          }}
      />
      <div
        className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/50 z-0"
        style={{
          width: `${progress_percent}%`,
        }}
      />
      <div className="text-xs w-4 z-10 self-center ml-1">
        {state === "paused" && (
          <BsPauseFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] opacity-80" />
        )}
        {state !== "paused" && (
          <BsFillPlayFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
        )}
      </div>
      <PlatformIcon platform={platform.toLowerCase()} opacity="opacity-60"/>
      <div className="text-xs z-10 self-center ml-1 relative w-full h-4 grow mr-2">
        <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden" title={stream_title}>
          {stream_title}
        </div>
      </div>
      <div className="self-center text-xs flex justify-end mr-1 pl-1 z-10">{MillisecondsToString(view_offset)}</div>
      <PlayStatusIcon videoDecision={video_decision} audioDecision={audio_decision} transcodeDecision={transcode_decision} opacity="opacity-60"/>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: activityData, error: activityError } = useWidgetAPI(widget, "get_activity", {
    refreshInterval: 5000,
  });

  const enableUser = !!service.widget?.enableUser; // default is false
  const expandOneStreamToTwoRows = service.widget?.expandOneStreamToTwoRows !== false; // default is true
  const showEpisodeNumber = !!service.widget?.showEpisodeNumber; // default is false

  if (activityError || (activityData && Object.keys(activityData.response.data).length === 0)) {
    return <Container service={service} error={activityError ?? { message: t("tautulli.plex_connection_error") }} />;
  }

  if (!activityData) {
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

  const playing = activityData.response.data.sessions.sort((a, b) => {
    if (a.view_offset > b.view_offset) {
      return 1;
    }
    if (a.view_offset < b.view_offset) {
      return -1;
    }
    return 0;
  });

  if (playing.length === 0) {
    return (
      <div className="flex flex-col pb-1 mx-1">
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">{t("tautulli.no_active")}</span>
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
          key={session.session_key}
          session={session}
          enableUser={enableUser}
          showEpisodeNumber={showEpisodeNumber}
        />
      ))}
    </div>
  );
}
