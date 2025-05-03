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
  const { data: torrentData, error: torrentError } = useWidgetAPI(widget, "customApi", {
    refreshInterval: Math.max(1000, refreshInterval),
  });

  if (torrentError) {
    return <Container service={service} error={torrentError} />;
  }

  if (!torrentData) {
    return (
      <Container service={service}>
        <Block label="deluge.leech" />
        <Block label="deluge.download" />
        <Block label="deluge.seed" />
        <Block label="deluge.upload" />
      </Container>
    );
  }

  const { torrents } = torrentData;
  const keys = torrents ? Object.keys(torrents) : [];

  const torrentDownloads = [];
  let rateDl = 0;
  let rateUl = 0;
  let completed = 0;
  const leechTorrents = [];

  for (let i = 0; i < keys.length; i += 1) {
    const torrent = torrents[keys[i]];
    rateDl += torrent.download_payload_rate;
    rateUl += torrent.upload_payload_rate;
    completed += torrent.total_remaining === 0 ? 1 : 0;
    if (torrent.state === "Downloading") {
      leechTorrents.push(torrent);
    }

    const key = keys[i];
    const { name } = torrent;
    const progress = Math.floor(torrent.progress);
    const totalWanted = t("common.bbytes", { value: torrent.total_wanted });
    const downloadRate = t("common.bibyterate", { value: torrent.download_payload_rate })
    torrentDownloads.push({ downloadRate, key, name, progress, totalWanted });
  }

  const leech = keys.length - completed || 0;
  const enableQueue = widget?.enableQueue && torrentDownloads.length > 0;

  return (
    <>
      <Container service={service}>
        <Block label="deluge.leech" value={t("common.number", { value: leech })} />
        <Block label="deluge.download" value={t("common.bibyterate", { value: rateDl })} />
        <Block label="deluge.seed" value={t("common.number", { value: completed })} />
        <Block label="deluge.upload" value={t("common.bibyterate", { value: rateUl })} />
      </Container>
      {widget?.enableLeechProgress &&
        leechTorrents.map((queueEntry) => (
          <QueueEntry
            progress={queueEntry.progress}
            timeLeft={t("common.duration", { value: queueEntry.eta })}
            title={queueEntry.name}
            activity={queueEntry.state}
            key={`${queueEntry.name}-${queueEntry.total_remaining}`}
          />
        ))}
        {enableQueue &&
        torrentDownloads.map((queueEntry) => (
          <OwnQueueEntry
            key={queueEntry.key}
            filename={queueEntry.name}
            percentage={queueEntry.progress}
            size={queueEntry.totalWanted}
            downloadRate={queueEntry.downloadRate}
          />
        ))}
    </>
  );
}
