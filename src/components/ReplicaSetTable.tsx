
import { Cell, Column, Table } from '@blueprintjs/table';
import { V1ReplicaSet, V1ReplicaSetList } from '@kubernetes/client-node';
import * as React from 'react';

export class ReplicaSetTable extends React.Component<ReplicaSetTable.Props> {
  static renderName = (pods: V1ReplicaSet[]) => (index: number) => {
    return (
      <Cell>{pods[index].metadata.name}</Cell>
    );
  }

  render() {
      const {
        replicaSetList,
      } = this.props;
      return (
        <div>
          <Table numRows={replicaSetList.items.length}>
            <Column name="Name" cellRenderer={ReplicaSetTable.renderName(replicaSetList.items)}/>
          </Table>
        </div>
      );
    }
}

export namespace ReplicaSetTable {
  export type Props = {
    replicaSetList: V1ReplicaSetList;
  };
}
