import * as React from "react";
import Tree from "./components/Tree.jsx";
import { default as axios } from 'axios';

export const Extension = (props) => {
  const [apps, setApps] = React.useState(null);

  React.useEffect(async () => {
    let result = await getApplications();
    setApps(result.items);
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
            <h2>{app.metadata.name}</h2>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const component = Extension;

((window) => {
  window.extensionsAPI.registerSystemLevelExtension(
    component,
    "Cluster API",
    "/cluster-api",
    "fa-cloud"
  );
})(window);

const getResource = (name, appNamespace, resource) => {
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

const getApplications = () => {
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
    const { manifest } = response.data;
    return JSON.parse(manifest);
  }).catch(err => {
    console.log(err);
    return err;
  });
};