import * as React from "react";
// import Tree from "./components/Tree";
import { default as axios } from 'axios';

import ClusterView from "./components/ClusterView";
import WorkloadClusterList from "./components/WorkloadClusterList";

export const Extension = (props: any) => {
  // const [apps, setApps] = React.useState(null);
  const [clusterApps, setClusterApps] = React.useState([]); // [cluster1, cluster2, ...
  const [selected, setSelected] = React.useState(null);

  React.useEffect(() => {
    async function fetchData() {
      let result = await getClusterApps();
      setClusterApps(result);
    }
    fetchData();
  }, []);

  if (clusterApps.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div id="root">
      <WorkloadClusterList clusterApps={clusterApps} handleSelect={(name: string) => setSelected(name)} />
      {
        selected && <ClusterView name={selected.cluster.name} />
      }
    </div>
  )
}

export const component = Extension;

((window: any) => {
  window.extensionsAPI.registerSystemLevelExtension(
    component,
    "Cluster API",
    "/cluster-api",
    "fa-cloud"
  );
})(window);

// @ts-ignore
const getResource = (appName: string, appNamespace : string | undefined, resource: any): Promise<any> => {
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
    let resources = app.status.resources;
    const found = resources.find((resource: any) => resource.kind === "Cluster" && resource.group === "cluster.x-k8s.io");
    if (found) {
      let result = await getResource(app.metadata.name, app.metadata.namespace, found);
      console.log("Result is", result);
      clusterApps.push({
        cluster: result,
        app: app // Make sure this isn't an implicit loop variable issue.
      });
    }
  };

  return clusterApps;
}

const getApplications = (): Promise<any> => {
  return axios.get(`/api/v1/applications`).then(response => {
    const result = response.data;
    console.log("Result is");
    console.log(result);
    return result;
  }).catch(err => {
    console.log(err);
    return err;
  });
};
