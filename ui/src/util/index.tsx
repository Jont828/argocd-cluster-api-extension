import { default as axios } from 'axios';

export const GetResource = (appName: string, appNamespace: string | undefined, resource: any): Promise<any> => {
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
