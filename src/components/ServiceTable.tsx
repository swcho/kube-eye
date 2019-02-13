import { Cell, Column } from '@blueprintjs/table';
import { V1Service, V1ServiceList } from '@kubernetes/client-node';
import * as React from 'react';
import { KubeObjectTable } from './KubeObjectTable';

const renderClusterIP = (items: V1Service[]) => (index: number) => {
  const item = items[index];
  return (
    <Cell>{item.spec.clusterIP}</Cell>
  );
};

const renderExternalIP = (items: V1Service[]) => (index: number) => {
  const item = items[index];
  const {
    status: {
      loadBalancer
    },
    spec: {
      ports,
    }
  } = item;
  const port = ports && ports[0].targetPort || '';
  return (
    <Cell>{
      loadBalancer && loadBalancer.ingress && loadBalancer.ingress.map((ing, i) => {
        return <a key={i} href={`http://${ing.ip}:${port}`} target="blank">{ing.ip}</a>;
      })
    }</Cell>
  );
};

const renderPorts = (items: V1Service[]) => (index: number) => {
  const item = items[index];
  const {
    spec: {
      ports,
    }
  } = item;
  return (
    <Cell>{ports.map((p) => p.nodePort ? `${p.targetPort}:${p.nodePort}/${p.protocol}` : `${p.targetPort}`)}</Cell>
  );
};

export class ServiceTable extends React.Component<ServiceTable.Props> {

  render() {
    const {
      list,
    } = this.props;
    console.log(list.items);
    return (
      <KubeObjectTable<V1Service>
        {...this.props}
      >
        <Column
          name="Cluster IP"
          cellRenderer={renderClusterIP(list.items)}
        />
        <Column
          name="External IP"
          cellRenderer={renderExternalIP(list.items)}
        />
        <Column
          name="Port(S)"
          cellRenderer={renderPorts(list.items)}
        />
      </KubeObjectTable>
    );
  }
}

export namespace ServiceTable {
  export type Props = {
    list: V1ServiceList;
  } & KubeObjectTable.Events<V1Service>;
}
