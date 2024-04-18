import * as React from "react";
// import Tree from "./components/Tree";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  AppstoreFilled
} from '@ant-design/icons';
import { Flex, Card, Tag, Space, Tooltip } from "antd";

import Icon from '@mdi/react';
import { mdiDocker } from '@mdi/js';

require("./cluster-list.scss");

interface Condition {
  type: string
  status: string
  lastTransitionTime?: string
  message?: string
  reason?: string
  severity?: string
}

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
          // const readyCondition = cluster.status.conditions.find((condition: any) => condition.type === "Ready");
          let conditions = cluster.status.conditions;
          console.log("Conditions are", conditions);
          const { Meta } = Card;
          return (
            <Card
              key={cluster.metadata.name}
              style={{ width: 300 }}
              hoverable
              onClick={() => { props.handleSelect(clusterApp) }}
            >
              <Meta 
                title={<Flex justify="space-between" align="center">
                  <span>{cluster.metadata.name}</span>
                  <Icon path={mdiDocker} size={1} color="#1677FF" />
                  {/* TODO: Import icons so it's not just MDI Docker */}
                </Flex>}
                description={cluster.metadata.namespace ? cluster.metadata.namespace : "default"}
              />
              {/* <Flex className="app-name-wrap" align="center">
                <Icon path={mdiApplicationBraces} size="1em" />
                <p style={{marginLeft: "4px"}}>{app.metadata.name}</p>
              </Flex> */}
              <Space size={[0, 4]} wrap className="app-name-wrap">
                <Tag color="default"><AppstoreFilled /> {app.metadata.name}</Tag>
                { getPhaseTag(cluster.status.phase) }
              </Space>
              
              <p>Conditions:</p>
              <Space size={[0, 4]} wrap>
                {conditions.map((condition : Condition) => getConditionTag(condition) )}
              </Space>
              {/* <p>Infra: {'infrastructureRef' in cluster.spec ? cluster.spec.infrastructureRef.kind : "Unknown"}</p>
              <p>Ready: {readyCondition ? readyCondition.status : "Unknown"}</p> */}
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
      // icon = <ExclamationCircleOutlined />;
      icon = <CloseCircleOutlined />;
      break;
    default:
      color = "default";
      icon = <QuestionCircleOutlined />;
      break;
  }

  return <Tag color={color}>{icon} {phase}</Tag>;
}



function getConditionTag(condition : Condition) : any {
  var color;
  var icon;
  if (condition.status === "True") {
    color = "success";
    icon = <CheckCircleOutlined />;
    return <Tag color={color}>{icon} {condition.type}</Tag>;
  } else {
    switch (condition.severity) {
      case "Info":
        color = "processing";
        icon = <InfoCircleOutlined />;
        break;
      case "Warning":
        color = "warning";
        icon = <ExclamationCircleOutlined />;
        break;
      case "Error":
        color = "error";
        icon = <CloseCircleOutlined />;
        break;
      default:
        color = "default";
        icon = <QuestionCircleOutlined />;
        break;
    }
  }

  return (
    <Tooltip
      placement="bottom"
      overlayClassName="tooltip-wrapper"
      overlayInnerStyle={{lineHeight: "18px", padding: "4px 6px", minHeight: "28px"}}
      title={<span className="tooltip-text">{condition.reason}</span>}>
      <Tag color={color}>{icon} {condition.type}</Tag>
    </Tooltip>
  );
}