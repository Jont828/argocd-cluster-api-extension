import * as React from "react";
// import Tree from "./components/Tree";
import { Flex, Card } from "antd";

export default function ClusterList(props: any) {
  if (props.clusterApps.length === 0) {
    return <div>No clusters found</div>;
  }

  let cards = [];
  for (let i = 0; i < 10; i++) {
    cards.push(<Card
      title={"Cluster " + i}
      style={{ width: 300 }}
      hoverable
    >
      <p>Lorem ipsum</p>
      <p>Lorem ipsum</p>
      <p>Lorem ipsum</p>
      <p>Lorem ipsum</p>
    </Card>);
  }

  return (
    <div id="cluster-list-wrap">
      <Flex gap="small" align="flex-start" justify="flex-start" wrap="wrap">
        {props.clusterApps.map(clusterApp => {
          const { cluster, app } = clusterApp;
          const readyCondition = cluster.status.conditions.find((condition: any) => condition.type === "Ready");
          return (
            <Card
              title={(cluster.metadata.namespace == "default" ? "" : cluster.metadata.namespace + "/") + cluster.metadata.name}
              key={cluster.metadata.name}
              style={{ width: 300 }}
              hoverable
              onClick={() => { props.handleSelect(clusterApp) }}
            >
              <p>App: {app.metadata.name}</p>
              <p>Phase: {cluster.status.phase}</p>
              <p>Infra: {'infrastructureRef' in cluster.spec ? cluster.spec.infrastructureRef.kind : "Unknown"}</p>
              <p>Ready: {readyCondition ? readyCondition.status : "Unknown"}</p>
            </Card>
          )
        })}
        {cards}
      </Flex>
    </div>
  )
}
