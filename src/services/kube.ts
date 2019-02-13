
// tslint:disable-next-line
import { V1beta1CronJobList, V1beta1Ingress, V1Deployment, V1DeploymentList, V1HorizontalPodAutoscalerList, V1JobList, V1ListMeta, V1ObjectMeta, V1Pod, V1PodList, V1ReplicaSet, V1ReplicaSetList, V1Role, V1RoleBinding, V1Service, V1ServiceAccount, V1ServiceList, V1StatefulSet, V1StatefulSetList } from '@kubernetes/client-node';
import { WebSocketHandler } from '@kubernetes/client-node/dist/web-socket-handler';
import { makeQuery } from './utils';

const HOST = typeof window === 'undefined' ? 'http://localhost:8080' : '/api/kube';

const makeBaseUrl = (hostPrefix?: string) => hostPrefix || HOST;

let NAMESPACE = 'default';

export const setNamespace = (namespace: string) => NAMESPACE = namespace;

type KubeObject = {
  metadata: V1ObjectMeta;
};

type ListLike<T extends KubeObject> = {
  apiVersion: string;
  items: T[];
  kind: string;
  metadata: V1ListMeta;
};

const CRUD = <T extends KubeObject>(baseUrl: string, config: RequestInit = {}) => {
  return {
    list: () => {
      return fetch(baseUrl, config).then<ListLike<T>>((r) => r.json());
    },
    create: (item: T) => {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers['Content-Type'] = 'application/json';
      return fetch(
        baseUrl,
        { method: 'POST', body: JSON.stringify(item), ...config }).then<T>((r) => r.json());
    },
    update: (item: T) => {
      // https://github.com/kubernetes/community/blob/master/contributors/devel/api-conventions.md#patch-operations
      if (!config.headers) {
        config.headers = {};
      }
      config.headers['Content-Type'] = 'application/strategic-merge-patch+json';
      return fetch(
        `${baseUrl}/${item.metadata.name}`,
        { method: 'PATCH', body: JSON.stringify(item), ...config }).then<T>((r) => r.json());
    },
    del: (item: T) => {
      return fetch(
        `${baseUrl}/${item.metadata.name}`,
        { method: 'DELETE', ...config }).then<T>((r) => r.json());
    },
  };
};

export type ExecParams = {
  container: string;
  command: string;
  stdin?: boolean;
  stdout?: boolean;
  stderr?: boolean;
  tty?: boolean;
};

export const kubeApi = ({
    namespace = NAMESPACE,
    hostPrefix,
    token,
  }: kubeApi.Params = { namespace: NAMESPACE }) => {
  const config: RequestInit = {
    headers: {
      Accept: 'application/json',
    },
  };
  if (config && config.headers && token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  const baseUrl = makeBaseUrl(hostPrefix);
  return {
    pods: () => {
      // return axios.get<V1PodList>(`${baseUrl}/api/v1/namespaces/${namespace}/pods`, config).then(r => r.data);
      const baseUrlPods = `${baseUrl}/api/v1/namespaces/${namespace}/pods`;
      return {
        ...CRUD<V1Pod>(baseUrlPods, config),
        log(pod: V1Pod) {
          return fetch(`${baseUrlPods}/${pod.metadata.name}/log`, config)
            .then((r) => r.text());
        },
        attach(pod: V1Pod, params: ExecParams) {
          return fetch(`${baseUrlPods}/${pod.metadata.name}/attach${makeQuery(params)}`, { method: 'POST', ...config})
            .then((r) => r.text());
        },
        exec(pod: V1Pod, params: ExecParams) {
          // tslint:disable-next-line
          const url = `wss://${location.hostname}${baseUrl}/api/v1/namespaces/${namespace}/pods/${pod.metadata.name}/exec${makeQuery(params)}`;
          const ws = new WebSocket(url);
          return ws;
        },
        shell(pod: V1Pod) {
          return fetch(`${baseUrlPods}/${pod.metadata.name}/shell`, config)
            .then((r) => r.text());
        },
      };
    },
    services: () => {
      return CRUD<V1Service>(`${baseUrl}/api/v1/namespaces/${namespace}/services`, config);
    },
    replicaSets: () => {
      return CRUD<V1ReplicaSet>(`${baseUrl}/apis/apps/v1/namespaces/${namespace}/replicasets`, config);
    },
    statefulSets: () => {
      return CRUD<V1StatefulSet>(`${baseUrl}/apis/apps/v1/namespaces/${namespace}/statefulsets`, config);
    },
    horizontalPodAuthScalers: () => {
      return fetch(`${baseUrl}/api/v1/namespaces/${namespace}/horizontalpodautoscalers`, config)
        .then<V1HorizontalPodAutoscalerList>((r) => r.json());
    },
    jobs: () => {
      return fetch(`${baseUrl}/api/v1/namespaces/${namespace}/jobs`, config)
        .then<V1JobList>((r) => r.json());
    },
    cronJobs: () => {
      return fetch(`${baseUrl}/api/v1/namespaces/${namespace}/cronjobs`, config)
        .then<V1beta1CronJobList>((r) => r.json());
    },
    deployments: () => {
      return CRUD<V1Deployment>(`${baseUrl}/apis/apps/v1/namespaces/${namespace}/deployments`, config);
    },
    serviceAccounts: () => {
      return CRUD<V1ServiceAccount>(`${baseUrl}/api/v1/namespaces/${namespace}/serviceaccounts`, config);
    },
    roles: () => {
      return CRUD<V1Role>(`${baseUrl}/apis/rbac.authorization.k8s.io/v1beta1/namespaces/${namespace}/roles`, config);
    },
    roleBindings: () => {
      // tslint:disable-next-line
      return CRUD<V1RoleBinding>(`${baseUrl}/apis/rbac.authorization.k8s.io/v1beta1/namespaces/${namespace}/rolebindings`, config);
    },
    ingresses: () => {
      return CRUD<V1beta1Ingress>(`${baseUrl}/apis/extensions/v1beta1/namespaces/${namespace}/ingresses`, config);
    },
  };
};

export namespace kubeApi {
  export type Params = {
    namespace?: string;
    hostPrefix?: string;
    token?: string;
  };
}
