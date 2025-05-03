import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

function fromUnits(value) {
  const units = ["B", "K", "M", "G", "T", "P"];
  const [number, unit] = value.split(" ");
  const index = units.indexOf(unit);
  if (index === -1) {
    return 0;
  }
  return parseFloat(number) * 1024 ** index;
}

function QueueEntry({ filename, percentage, size, timeleft }) {
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
        <div className="self-center text-xs flex justify-end mr-1.5 pl-1 z-10 text-ellipsis overflow-hidden whitespace-nowrap">
          {size}
        </div>
        <div className="self-center text-xs flex w-12 justify-end mr-1.5 pl-1 z-10 text-ellipsis overflow-hidden whitespace-nowrap">
          {timeleft}
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
  const { data: queueData, error: queueError } = useWidgetAPI(widget, "queue", {
    refreshInterval: Math.max(1000, refreshInterval),
  });

  if (queueError) {
    return <Container service={service} error={queueError} />;
  }

  if (!queueData) {
    return (
      <Container service={service}>
        <Block label="sabnzbd.rate" />
        <Block label="sabnzbd.queue" />
        <Block label="sabnzbd.timeleft" />
      </Container>
    );
  }

  const enableQueue = widget?.enableQueue && queueData.queue.noofslots > 0;

  return (
    <>
      <Container service={service}>
        <Block label="sabnzbd.rate" value={t("common.bibyterate", { value: fromUnits(queueData.queue.speed) })} />
        <Block label="sabnzbd.queue" value={t("common.number", { value: queueData.queue.noofslots })} />
        <Block label="sabnzbd.timeleft" value={queueData.queue.timeleft} />
      </Container>
      {enableQueue &&
        queueData.queue.slots.map((queueEntry) => (
          <QueueEntry
            key={queueEntry.nzoid}
            filename={queueEntry.filename}
            percentage={queueEntry.percentage}
            size={queueEntry.size}
            timeleft={queueEntry.timeleft}
          />
        ))}
    </>
  );
}
