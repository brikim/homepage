import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import QueueEntry from "../../components/widgets/queue/queueEntry";

import useWidgetAPI from "utils/proxy/use-widget-api";

function OwnQueueEntry({ filename, percentage, size, downloadRate }) {
  return (
      <div className="text-theme-700 dark:text-theme-200 relative h-5 rounded-md bg-theme-200/50 dark:bg-theme-900/20 m-1 px-1 flex">
        <div
          className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0 -ml-1"
          style={{
            width: `${percentage}%`,
          }}
        />
        <div className="text-xs z-10 self-center ml-1 relative h-4 grow mr-1">
          <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden text-left">{filename}</div>
        </div>
        <div className="self-center text-xs flex justify-end mr-2 pl-1 z-10 text-ellipsis overflow-hidden whitespace-nowrap">
          {downloadRate}
        </div>
        <div className="self-center text-xs flex w-12 justify-end mr-1.5 pl-1.5 z-10 text-ellipsis overflow-hidden whitespace-nowrap">
          {size}
        </div>
        <div className="self-center text-xs flex w-8 justify-end mr-1.5 z-10 text-ellipsis overflow-hidden whitespace-nowrap">
          {`${percentage}%`}
        </div>
      </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { refreshInterval = 5000 } = widget;
  const { data: torrentData, error: torrentError } = useWidgetAPI(widget, "torrents", {
    refreshInterval: Math.max(1000, refreshInterval),
  });

  if (torrentError) {
    return <Container service={service} error={torrentError} />;
  }

  if (!torrentData) {
    return (
      <Container service={service}>
        <Block label="qbittorrent.leech" />
        <Block label="qbittorrent.download" />
        <Block label="qbittorrent.seed" />
        <Block label="qbittorrent.upload" />
      </Container>
    );
  }

  let rateDl = 0;
  let rateUl = 0;
  let completed = 0;
  const leechTorrents = [];

  for (let i = 0; i < torrentData.length; i += 1) {
    const torrent = torrentData[i];
    rateDl += torrent.dlspeed;
    rateUl += torrent.upspeed;
    if (torrent.progress === 1) {
      completed += 1;
    }
    if (torrent.state.includes("DL") || torrent.state === "downloading") {
      leechTorrents.push(torrent);
    }
  }

  const leech = torrentData.length - completed;
  const enableQueue = widget?.enableQueue && torrentData.length > 0;
  const statePriority = [
    "downloading",
    "forcedDL",
    "metaDL",
    "forcedMetaDL",
    "checkingDL",
    "stalledDL",
    "queuedDL",
    "pausedDL",
  ];

  leechTorrents.sort((firstTorrent, secondTorrent) => {
    const firstStateIndex = statePriority.indexOf(firstTorrent.state);
    const secondStateIndex = statePriority.indexOf(secondTorrent.state);
    if (firstStateIndex !== secondStateIndex) {
      return firstStateIndex - secondStateIndex;
    }
    return secondTorrent.progress - firstTorrent.progress;
  });

  return (
    <>
      <Container service={service}>
        <Block label="qbittorrent.leech" value={t("common.number", { value: leech })} />
        <Block label="qbittorrent.download" value={t("common.bibyterate", { value: rateDl, decimals: 1 })} />
        <Block label="qbittorrent.seed" value={t("common.number", { value: completed })} />
        <Block label="qbittorrent.upload" value={t("common.bibyterate", { value: rateUl, decimals: 1 })} />
      </Container>
      {widget?.enableLeechProgress &&
        leechTorrents.map((queueEntry) => (
          <QueueEntry
            progress={queueEntry.progress * 100}
            timeLeft={t("common.duration", { value: queueEntry.eta })}
            title={queueEntry.name}
            activity={queueEntry.state}
            key={`${queueEntry.name}-${queueEntry.amount_left}`}
          />
      ))}
      {enableQueue &&
      torrentData.map((queueEntry) => (
        <OwnQueueEntry
          key={queueEntry.hash}
          filename={queueEntry.name}
          percentage={Math.round(queueEntry.progress * 100).toString()}
          size={t("common.bbytes", { value: queueEntry.total_size, decimals: 1 })}
          downloadRate={t("common.bibyterate", { value: queueEntry.dlspeed, decimals: 1 })}
        />
      ))}
    </>
  );
}
