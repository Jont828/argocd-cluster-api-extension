import * as React from "react";

import { default as axios } from 'axios';

export default function ClusterResources(props) {
  console.log("ClusterResources props are", props);
  React.useEffect(() => {
    async function fetchData() {
      let result = await getResourceTree(props.app.metadata.name, props.app.metadata.namespace);
      console.log("result is", result);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Cluster Resources: {props.cluster.name}</h1>
      <p>Coming soon...</p>
    </div>
  );
}

const getResourceTree = (appName: string, appNamespace: string | undefined): Promise<any> => {
  const params = {
    name: appName,
    appNamespace,
  };

  return axios.get(`/api/v1/applications/${appName}/resource-tree`, { params }).then(response => {
    const result = response.data;
    console.log("getResourceTree() result is");
    console.log(result);
    return result;
  }).catch(err => {
    console.log(err);
    return err;
  });
};
