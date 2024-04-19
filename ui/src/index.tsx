import * as React from "react";
// import Tree from "./components/Tree";

import { BrowserRouter, useSearchParams } from 'react-router-dom';

import ClusterResources from "./components/cluster-resources/cluster-resources";
import ClusterList from "./components/cluster-list/cluster-list";

export const Extension = (props: any) => {
  return (
    <div id="root">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </div>
  )
}

export const App = (props: any) => {
  // const [apps, setApps] = React.useState(null);
  // const [selected, setSelected] = React.useState(null);

  const [searchParams, _] = useSearchParams();
  const clusterName = searchParams.get("cluster");
  const appName = searchParams.get("app");
  const appNamespace = searchParams.get("namespace");

  React.useEffect(() => {
    // logic to run when id value updates
  }, [clusterName, appName, appNamespace]);
  // TODO: can we assume cluster namespace is the same as app namespace?

  if (appName) {
    return (
      <ClusterResources cluster={clusterName} app={appName} namespace={appNamespace} />
    )
  }
  return (
    <ClusterList  />
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

