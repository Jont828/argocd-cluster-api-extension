import * as React from "react";
import { createSearchParams, useNavigate } from "react-router-dom";

import { default as axios } from 'axios';

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
  const [clusterApps, setClusterApps] = React.useState([]); // [cluster1, cluster2, ...

  React.useEffect(() => {
    async function fetchData() {
      let result = await getClusterApps();
      setClusterApps(result);
    }
    fetchData();
  }, []);

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

  const navigate = useNavigate();

  return (
    <div id="cluster-list-wrap">
      <Flex gap="middle" align="flex-start" justify="flex-start" wrap="wrap">
        {clusterApps.map(clusterApp => {
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
              onClick={() => {
                navigate({
                  pathname: "/cluster-api",
                  search: createSearchParams({
                    cluster: cluster.metadata.name,
                    app: app.metadata.name,
                    namespace: app.metadata.namespace ? app.metadata.namespace : "default",
                  }).toString()
                });
              }}
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

// @ts-ignore
const getResource = (appName: string, appNamespace: string | undefined, resource: any): Promise<any> => {
  const params = {
    name: appName,
    appNamespace,
    namespace: resource.namespace,
    resourceName: resource.name,
    version: resource.version,
    kind: resource.kind,
    group: resource.group || ''
  };

  return axios.get(`/api/v1/applications/${appName}/resource`, { params }).then(response => {
    const { manifest } = response.data;
    return JSON.parse(manifest);
  });
};

interface ClusterApp {
  cluster: any;
  app: any;
}

async function getClusterApps(): Promise<ClusterApp[]> {
  let result = await getApplications();
  const apps = result.items;
  let clusterApps = [];
  for (const app of apps) {
    if ("resources" in app.status) {
      let resources = app.status.resources;
      const found = resources.find((resource: any) => resource.kind === "Cluster" && resource.group === "cluster.x-k8s.io");
      if (found) {
        let result = await getResource(app.metadata.name, app.metadata.namespace, found);
        console.log("getResource() result is", result);
        clusterApps.push({
          cluster: result,
          app: app // Make sure this isn't an implicit loop variable issue.
        });
      }
    }
  };

  return clusterApps;
}

const getApplications = (): Promise<any> => {
  return axios.get(`/api/v1/applications`).then(response => {
    const result = response.data;
    console.log("getApplications() result is");
    console.log(result);
    return result;
  }).catch(err => {
    console.log(err);
    return err;
  });
};


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
    return <Tag key={condition.type} color={color}>{icon} {condition.type}</Tag>;
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
      title={<span className="tooltip-text">{condition.reason}</span>}
      key={condition.type}
    >
      <Tag color={color}>{icon} {condition.type}</Tag>
    </Tooltip>
  );
}