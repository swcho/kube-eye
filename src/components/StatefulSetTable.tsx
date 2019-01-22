
import { Cell, Column, Table } from '@blueprintjs/table';
import { V1StatefulSet, V1StatefulSetList } from '@kubernetes/client-node';
import * as React from 'react';

export class StatefullSetTable extends React.Component<StatefullSetTable.Props> {
  static renderName = (pods: V1StatefulSet[]) => (index: number) => {
    return (
      <Cell>{pods[index].metadata.name}</Cell>
    );
  }

  render() {
      const {
        statefulSetList,
      } = this.props;
      return (
        <div>
          <Table numRows={statefulSetList.items.length}>
            <Column name="Name" cellRenderer={StatefullSetTable.renderName(statefulSetList.items)}/>
          </Table>
        </div>
      );
    }
}

export namespace StatefullSetTable {
  export type Props = {
    statefulSetList: V1StatefulSetList;
  };
}
