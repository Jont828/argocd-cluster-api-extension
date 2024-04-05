import * as React from "react";
// import Tree from "./components/Tree";
import { default as axios } from 'axios';
import ClusterView from "./components/ClusterView";

export const Extension = (props: any) => {
  const [apps, setApps] = React.useState(null);
  const [selected, setSelected] = React.useState("");

  React.useEffect(() => {
    async function fetchData() {
      let result = await getApplications();
      setApps(result.items);
    }
    fetchData();
  }, []);

  if (!apps) {
    return <div>Loading...</div>;
  }

  return (
    <div id="root">
      <h1>Applications:</h1>
      <ul>
        {apps.map(app => (
          <li key={app.metadata.name}>
            <button onClick={() => {setSelected(app.metadata.name)}}>{app.metadata.name}</button>
          </li>
        ))}
      </ul>
      {
        selected && <ClusterView name={selected} />
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
const getResource = (name: string | undefined, appNamespace : string | undefined, resource: any): Promise<any> => {
  const params = {
    name,
    appNamespace,
    namespace: resource.namespace,
    resourceName: resource.name,
    version: resource.version,
    kind: resource.kind,
    group: resource.group || ''
  };

  return axios.get(`/api/v1/applications/${name}/resource`, { params }).then(response => {
    const { manifest } = response.data;
    return JSON.parse(manifest);
  });
};

const getApplications = (): Promise<any> => {
  // const params = {
  //   name: name,
  //   refresh: refresh,
  //   projects: projects,
  //   resourceVersion: resourceVersion,
  //   selector: selector,
  //   repo: repo,
  //   appNamespace: appNamespace,
  //   project: project,
  // };

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