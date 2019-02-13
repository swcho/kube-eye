import { Cell, Column } from '@blueprintjs/table';
import { V1Service, V1ServiceList } from '@kubernetes/client-node';
import * as React from 'react';
import { KubeObjectTable } from './KubeObjectTable';

const renderClusterIP = (items: V1Service[]) => (index: number) => {
  const item = items[index];
  return <Cell>{item.spec.clusterIP}</Cell>;
};

const renderExternalIP = (items: V1Service[]) => (index: number) => {
  const item = items[index];
  const {
    status: { loadBalancer },
    spec: { ports }
  } = item;
  const port = (ports && ports[0].targetPort) || '';
  return (
    <Cell>
      <React.Fragment>
        {loadBalancer &&
          loadBalancer.ingress &&
          loadBalancer.ingress.map((ing, i) => {
            return (
              <a key={i} href={`http://${ing.ip}:${port}`} target="blank">
                {ing.ip}:{port}
              </a>
            );
          })}
      </React.Fragment>
    </Cell>
  );
};

const renderPorts = (items: V1Service[]) => (index: number) => {
  const item = items[index];
  const {
    spec: { ports }
  } = item;
  return (
    <Cell>
      {ports.map((p) =>
        p.nodePort
          ? `${p.targetPort}:${p.nodePort}/${p.protocol}`
          : `${p.targetPort}`
      )}
    </Cell>
  );
};

export class ServiceTable extends React.Component<ServiceTable.Props> {
  render() {
    const { list } = this.props;
    const cols = [
      <Column
        key="cip"
        name="Cluster IP"
        cellRenderer={renderClusterIP(list.items)}
      />,
      <Column
        key="eip"
        name="External IP"
        cellRenderer={renderExternalIP(list.items)}
      />,
      <Column
        key="ports"
        name="Port(S)"
        cellRenderer={renderPorts(list.items)}
      />,
    ];
    return <KubeObjectTable<V1Service> {...this.props}>{cols}</KubeObjectTable>;
  }
}

export namespace ServiceTable {
  export type Props = {
    list: V1ServiceList;
  } & KubeObjectTable.Events<V1Service>;
}
