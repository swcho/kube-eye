
import { Cell, Column, Table } from '@blueprintjs/table';
import { V1StatefulSet, V1StatefulSetList } from '@kubernetes/client-node';
import * as React from 'react';
import { KubeObjectTable } from './KubeObjectTable';

export class StatefullSetTable extends React.Component<StatefullSetTable.Props> {
  static renderName = (pods: V1StatefulSet[]) => (index: number) => {
    return (
      <Cell>{pods[index].metadata.name}</Cell>
    );
  }

  render() {
      const {
        list,
      } = this.props;
      return (
        <KubeObjectTable<V1StatefulSet>
          list={list}
          {...this.props}
        />
      );
    }
}

export namespace StatefullSetTable {
  export type Props = {
    list: V1StatefulSetList;
  } & KubeObjectTable.Events<V1StatefulSet>;
}
