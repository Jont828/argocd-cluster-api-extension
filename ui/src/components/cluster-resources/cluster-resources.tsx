import * as React from "react";

import { default as axios } from 'axios';

// import RawNodeDatum from 'react-d3-tree';

export default function ClusterResources(props) {
  console.log("ClusterResources props are", props);
  React.useEffect(() => {
    async function fetchData() {
      let result = await getResourceTree(props.app.metadata.name, props.app.metadata.namespace);
      console.log("result is", result);
      if ("nodes" in result) {
        convertNodeListToD3ResourceTree(result.nodes);
      } else {
        console.error("No nodes found in result", result);
      }
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

interface ArgoNode {
  resourceVersion: string,
  group: string,
  kind: string,
  name: string,
  namespace: string,
  uid: string,
  version: string
  parentRefs?: ArgoParentRef[]
}

interface ArgoParentRef {
  group: string,
  kind: string,
  name: string,
  namespace: string,
  uid: string,
  version: string
}

function convertNodeListToD3ResourceTree(nodes: ArgoNode[]): any {
  let nodeToChildren = {};
  for (let node of nodes) {
    if ("parentRefs" in node) {
      // TODO: figure out transitive owners later on.
      if (node.parentRefs.length > 1) {
        console.error("Node has more than one parentRefs", node);
      }
      const parentUID = node.parentRefs[0].uid;
      if (!(parentUID in nodeToChildren)) {
        nodeToChildren[parentUID] = [];
      }
      nodeToChildren[parentUID].push(node);
    } else {
      console.log("Found root", node);
      nodeToChildren[node.uid] = [];
    }
  }


  for(const uid in nodeToChildren) {
    console.log("uid has children:", uid);
    nodeToChildren[uid].forEach((node: ArgoNode) => {
      console.log("child node is", node);
    });
  }
}
