import * as React from "react";
// import Tree from "./components/Tree";
import { Button, Flex, Card } from "antd";


export default function WorkloadClusterList(props: any) {
  if (props.clusterApps.length === 0) {
    return <div>No clusters found</div>;
  }

  return (
    <div id="root">
      <Flex gap="middle" vertical>
        {props.clusterApps.map(clusterApp => {
          const { cluster, app } = clusterApp;
          const readyCondition = cluster.status.conditions.find((condition: any) => condition.type === "Ready");
          return (
            <Card
              title={(cluster.metadata.namespace == "default" ? "" : cluster.metadata.namespace + "/") + cluster.metadata.name}
              key={cluster.metadata.name}
              style={{ width: 300 }}
            >
              <p>App: {app.metadata.name}</p>
              <p>Phase: {cluster.status.phase}</p>
              <p>Infra: {'infrastructureRef' in cluster.spec ? cluster.spec.infrastructureRef.kind : "Unknown"}</p>
              <p>Ready: {readyCondition ? readyCondition.status : "Unknown"}</p>
              <Button type="primary" onClick={() => { props.handleSelect(cluster.metadata.name) }}>{cluster.metadata.name}</Button>
            </Card>
          )
        })}
      </Flex>
    </div>
  )
}
