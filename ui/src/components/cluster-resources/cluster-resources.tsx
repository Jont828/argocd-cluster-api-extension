import * as React from "react";
import { useNavigate } from "react-router-dom";
import { default as axios } from 'axios';
import Tree from 'react-d3-tree';

import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import { Button, Typography, Card, Flex } from "antd";
import { TreeNode } from "antd/es/tree-select";

// import RawNodeDatum from 'react-d3-tree';

require("./cluster-resources.scss");


export default function ClusterResources(props) {
  console.log("ClusterResources props are", props);

  const [tree, setTree] = React.useState(null);
  
  React.useEffect(() => {
    async function fetchData() {
      let result = await getResourceTree(props.app, props.namespace);
      console.log("result is", result);
      if ("nodes" in result) {
        let tree = convertNodeListToD3ResourceTree(result.nodes);
        setTree(tree);
      } else {
        console.error("No nodes found in result", result);
      }
    }
    fetchData();
  }, []);

  const navigate = useNavigate();

  if (tree == null) {
    return <div>Nothing to show yet...</div>;
  }
  
  const nodeSize = { x: 170, y: 200 };
  const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: -nodeSize.x/2, y: -50/2};
  // Note: y position is computed from the css size of the card, not the node height.
  return (
    <div id="cluster-resources-wrap">
      <Button 
        type="primary"
        shape="circle"
        icon={<ArrowLeftOutlined />} 
        onClick={() => {
          navigate("/cluster-api");
        }}
      />
      <Typography.Title>Cluster Resources: {props.cluster}</Typography.Title>
      <div className="tree-wrapper">
        <Tree 
          orientation="vertical"
          data={tree} 
          nodeSize={nodeSize}
          renderCustomNodeElement={(rd3tProps) =>
            renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
          }
        />
      </div>
    </div>
  );
}

const renderForeignObjectNode = ({
  nodeDatum,
  toggleNode,
  foreignObjectProps
}) => (
  <g>
    {/* `foreignObject` requires width & height to be explicitly set. */}
    <foreignObject {...foreignObjectProps}>
      <Card
        size="small"
        className="tree-node"
        onClick={toggleNode}
        styles={{ body: { padding: "0.8px 0 0 0" }}}
      >
        <Flex align="center" vertical>
          <Typography.Paragraph className="tree-node-text" strong>{nodeDatum.attributes?.kind}</Typography.Paragraph>
          <Typography.Paragraph className="tree-node-text" italic>{nodeDatum.name}</Typography.Paragraph>
        </Flex>
      </Card>
    </foreignObject>
  </g>
);

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

// TODO: should this be a Map<string, Set<string>>?
interface OwnershipMap {
  [key: string]: Set<string>
}

interface TreeNode {
  name: string,
  children: TreeNode[]
  attributes? : any
}

function convertNodeListToD3ResourceTree(nodes: ArgoNode[]): TreeNode {
  let ownership : OwnershipMap = {}; // Map of parent UID to set of children UIDs.
  let uidToNode = {}; // Map of UID to node.
  let root = null;
  for (let node of nodes) {
    if (!(node.uid in uidToNode)) {
      uidToNode[node.uid] = node;
    }

    if ("parentRefs" in node) {
      // TODO: figure out transitive owners later on.
      if (node.parentRefs.length > 1) {
        console.error("Node has more than one parentRefs", node);
      }
      const parentUID = node.parentRefs[0].uid;
      if (!(parentUID in ownership)) {
        ownership[parentUID] =  new Set<string>();
      }
      ownership[parentUID].add(node.uid);
    } else {
      console.log("Found root", node);
      if (node.kind == "Cluster") {
        root = node;
      }
      ownership[node.uid] = new Set<string>();
    }
  }

  for(const uid in ownership) {
    console.log("node is", uidToNode[uid]);
    ownership[uid].forEach((childUID : string) => {
      console.log("child is", uidToNode[childUID]);
    });
  }

  return convertArgoNodeToTreeNode(root, uidToNode, ownership);
}

function convertArgoNodeToTreeNode(node: ArgoNode, uidToNode : any, ownership : OwnershipMap): TreeNode {
  let treeNode = {
    name: node.name,
    attributes: {
      group: node.group,
      kind: node.kind,
      namespace: node.namespace,
      uid: node.uid,
      version: node.version,
      provider: getProvider(node.group)
    },
    children: []
  };

  if (node.uid in ownership) {
    ownership[node.uid].forEach((childUID : string) => {
      treeNode.children.push(convertArgoNodeToTreeNode(uidToNode[childUID], uidToNode, ownership));
    });
  }

  return treeNode;
}

function getProvider(group: string): string {
  if (!group.includes("cluster.x-k8s.io")) {
      return "virtual";
  }

  let providerIndex = group.indexOf(".");
  if (providerIndex == -1) {
    return "virtual";
  } 

  return group.substring(0, providerIndex);
}