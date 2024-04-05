import * as React from "react";
// import Tree from "./components/Tree";
import { Button, Flex, Card } from "antd";


export default function WorkloadClusterList(props: any) {
  if (!props.clusters) {
    return <div>No clusters found</div>;
  }

  return (
    <div id="root">
      <Flex gap="middle" vertical>
        {props.clusters.map(cluster => (
          <Card 
            title={(cluster.metadata.namespace == "default" ? "" : cluster.metadata.namespace + "/") + cluster.metadata.name}
            key={cluster.metadata.name}
            style={{ width: 300 }}
          >
            <Button type="primary" onClick={() => { props.handleSelect(cluster.metadata.name) }}>{cluster.metadata.name}</Button>
          </Card>
        ))}
      </Flex>
    </div>
  )
}
