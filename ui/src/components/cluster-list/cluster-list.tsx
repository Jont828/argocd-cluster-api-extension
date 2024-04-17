import * as React from "react";
// import Tree from "./components/Tree";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Flex, Card, Tag } from "antd";

require("./cluster-list.scss");

export default function ClusterList(props: any) {
  if (props.clusterApps.length === 0) {
    return <div>No clusters found</div>;
  }

  let cards = [];
  for (let i = 0; i < 10; i++) {
    cards.push(<Card
      title={"Cluster " + i}
      key={i}
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
      <Flex gap="middle" align="flex-start" justify="flex-start" wrap="wrap">
        {props.clusterApps.map(clusterApp => {
          const { cluster, app } = clusterApp;
          const readyCondition = cluster.status.conditions.find((condition: any) => condition.type === "Ready");
          const { Meta } = Card;
          return (
            <Card
              key={cluster.metadata.name}
              style={{ width: 300 }}
              hoverable
              onClick={() => { props.handleSelect(clusterApp) }}
            >
              <Meta 
                title={cluster.metadata.name}
                description={cluster.metadata.namespace ? cluster.metadata.namespace : "default"}
              />
              <p>App: {app.metadata.name}</p>
              { getPhaseTag(cluster.status.phase) }
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

function getPhaseTag(phase : string) : any {
  var color;
  var icon;
  switch (phase) {
    case "Provisioned":
      color = "success";
      icon = <CheckCircleOutlined />;
      break;
    case "Provisioning":
      color = "processing";
      icon = <SyncOutlined spin />;
      break;
    case "Pending":
    case "Deleting":
      icon = <SyncOutlined spin />;
      color = "warning";
      break;
    case "Failed":
    case "Unknown":
      color = "error";
      icon = <ExclamationCircleOutlined />;
      // icon = <CloseCircleOutlined />;
      break;
    default:
      color = "default";
      icon = <QuestionCircleOutlined />;
      break;
  }

  return <Tag color={color}>{icon} {phase}</Tag>;
}