import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { data: containersData, error: containersError } = useWidgetAPI(widget, "docker/containers");

  if (containersError) {
    return <Container service={service} error={containersError} />;
  }

  if (!containersData) {
    return (
      <Container service={service}>
        <Block label="arcane.running" />
        <Block label="arcane.stopped" />
        <Block label="arcane.total" />
      </Container>
    );
  }

  if (containersData.error || containersData.message) {
    // containersData can be itself an error object e.g. if environment fails
    return <Container service={service} error={containersData?.error ?? containersData} />;
  }

  return (
    <Container service={service}>
      <Block label="arcane.running" value={containersData.data.runningContainers} />
      <Block label="arcane.stopped" value={containersData.data.stoppedContainers} />
      <Block label="arcane.total" value={containersData.data.totalContainers} />
    </Container>
  );
}
