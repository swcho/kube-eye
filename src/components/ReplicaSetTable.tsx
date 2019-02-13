
import { Cell } from '@blueprintjs/table';
import { V1ReplicaSet, V1ReplicaSetList } from '@kubernetes/client-node';
import * as React from 'react';
import { KubeObjectTable } from './KubeObjectTable';

export class ReplicaSetTable extends React.Component<ReplicaSetTable.Props> {
  static renderName = (pods: V1ReplicaSet[]) => (index: number) => {
    return (
      <Cell>{pods[index].metadata.name}</Cell>
    );
  }

  render() {
      const {
        list,
      } = this.props;
      return (
        <KubeObjectTable<V1ReplicaSet>
          list={list}
          {...this.props}
        />
      );
    }
}

export namespace ReplicaSetTable {
  export type Props = {
    list: V1ReplicaSetList;
  } & KubeObjectTable.Events<V1ReplicaSet>;
}
