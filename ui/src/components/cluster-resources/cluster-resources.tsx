import * as React from "react";
import { useNavigate } from "react-router-dom";
import { default as axios } from 'axios';
import Tree from 'react-d3-tree';

import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import { Button, Typography, Card, Flex } from "antd";
import { blue, gold, green, purple, red, gray } from '@ant-design/colors';
import { TreeNode } from "antd/es/tree-select";

import { GetResource } from "../../util/index";

import Badge from "../badge/badge";

require("./cluster-resources.scss");

const badgeSize = 20;

export default function ClusterResources(props) {
  console.log("ClusterResources props are", props);

  const [tree, setTree] = React.useState(null);
  
  React.useEffect(() => {
    async function fetchData() {
      let result = await getResourceTree(props.app, props.namespace);
      console.log("result is", result);
      if ("nodes" in result) {
        let nodeMap = new Map<string, any>();
        for (let node of result.nodes) {
          if (!nodeMap.has(node.uid)) {
            nodeMap.set(node.uid, node);
          }
        }
        let uniqueNodes = Array.from(nodeMap.values());
        
        // TODO: filter duplicates from result.nodes first.
        let nodes = await fetchResourcesForNodes(props.app, props.namespace, uniqueNodes);
        // TODO: check error
        let tree = convertNodeListToD3ResourceTree(nodes);
        setTree(tree);
      } else {
        console.error("No nodes found in result", result);
      }
    }
    fetchData();
  }, []);

  const navigate = useNavigate();
  const { translate, containerRef } = useCenteredTree();
  
  const objSize = { x: 170, y: 50 };
  const nodeSize = { x: objSize.x + badgeSize/2, y: 200 };
  const foreignObjectProps = {
    width: objSize.x + badgeSize/2, 
    height: objSize.y + badgeSize/2, 
    x: -objSize.x/2,
    y: -objSize.y/2
  };
  // Note: y position is computed from the css size of the card, not the node height.


  if (tree == null) {
    return <div>Nothing to show yet...</div>;
  }
  
  return (
    <div id="cluster-resources-wrap">
      <div id="relative-wrap">
        <div id="header">
          <Flex align="center">
            <Button
              className="back-button"
              type="primary"
              shape="circle"
              icon={<ArrowLeftOutlined />} 
              onClick={() => {
                navigate("/cluster-api");
              }}
            />
            <Typography.Title className="header-title">Cluster Resources: {props.cluster}</Typography.Title>
          </Flex>
        </div>
        <div className="tree-wrapper" ref={containerRef}>
          <Tree 
            collapsible={false}
            zoomable={false}
            orientation="vertical"
            data={tree} 
            nodeSize={nodeSize}
            translate={translate}
            renderCustomNodeElement={(rd3tProps) =>
              renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
            }
          />
        </div>
      </div>
    </div>
  );
}

const providerColorMap = {
  cluster: blue[5],
  bootstrap: gold[4],
  controlplane: purple[4],
  infrastructure: green[4],
  addons: red[5],
  virtual: gray[5],
}

const renderForeignObjectNode = ({
  nodeDatum,
  toggleNode,
  foreignObjectProps
}) => {

  return (
    <g>
      {/* `foreignObject` requires width & height to be explicitly set. */}
      <foreignObject {...foreignObjectProps}>
        <div style={{marginTop: badgeSize/2 + "px"}}>
          <Card
            size="small"
            bordered={false}
            className="tree-node"
            onClick={toggleNode}
            styles={{ body: { height: "100%", padding: 0, borderRadius: "8px", backgroundColor: providerColorMap[nodeDatum.attributes.provider] } }}
          >
            <div className="card-inner">
              <Flex align="center" justify="center" vertical className="card-inner-flex">
                <Typography.Paragraph className="tree-node-text" strong>{nodeDatum.attributes?.kind}</Typography.Paragraph>
                <Typography.Paragraph className="tree-node-text" italic>{nodeDatum.name}</Typography.Paragraph>
              </Flex>
              <Badge size={badgeSize} ready={true} />
            </div>
          </Card>
        </div>
      </foreignObject>
    </g>
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

interface ConditionNode extends ArgoNode {
  hasReady: boolean
  ready?: boolean
  severity?: string
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

async function fetchResourcesForNodes(appName : string, appNamespace : string, nodes: ArgoNode[]): Promise<ConditionNode[]> {
  let conditionNodes = [];
  for (let node of nodes) {
    let result = await GetResource(appName, appNamespace, node);
    console.log("getResource() result is", result);
    // TODO: catch error
    // TODO: search for status.ready and status.severity in non-CAPI resoruces.
    const readyCondition = result.status?.conditions?.find((condition: any) => condition.type === "Ready");
    const conditionNode = {
      ...node,
      hasReady: readyCondition ? true : false,
      ready: readyCondition ? readyCondition.status : "Unknown",
      severity: readyCondition ? readyCondition.severity : "Unknown"
    };

    conditionNodes.push(conditionNode);
  }

  return conditionNodes;
}

function convertNodeListToD3ResourceTree(nodes: ConditionNode[]): TreeNode {
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

function convertArgoNodeToTreeNode(node: ConditionNode, uidToNode : any, ownership : OwnershipMap): TreeNode {
  console.log("ArgoNode is", node);
  let treeNode = {
    name: node.name,
    attributes: {
      group: node.group,
      kind: node.kind,
      namespace: node.namespace,
      uid: node.uid,
      version: node.version,
      provider: getProvider(node.group),
      hasReady: node.hasReady,
      ready: node.ready,
      severity: node.severity,
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
  if (!group || !(group.includes("cluster.x-k8s.io"))) {
      return "virtual";
  }

  let providerIndex = group.indexOf(".");
  if (providerIndex == -1) {
    return "virtual";
  } 

  return group.substring(0, providerIndex);
}

export const useCenteredTree = () => {
  const [translate, setTranslate] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useCallback((containerElem) => {
    if (containerElem !== null) {
      const dim =  containerElem.getBoundingClientRect();
      setTranslate({ x: dim.width / 2, y: 100 });
    }
  }, []);
  return {translate, containerRef};
};
