
import { Cell, Column, Table } from '@blueprintjs/table';
import { V1Service, V1ServiceList } from '@kubernetes/client-node';
import * as React from 'react';

export class ServiceTable extends React.Component<ServiceTable.Props> {
  static renderName = (pods: V1Service[]) => (index: number) => {
    return (
      <Cell>{pods[index].metadata.name}</Cell>
    );
  }

  render() {
      const {
        serviceList,
      } = this.props;
      return (
        <div>
          <Table numRows={serviceList.items.length}>
            <Column name="Name" cellRenderer={ServiceTable.renderName(serviceList.items)}/>
          </Table>
        </div>
      );
    }
}

export namespace ServiceTable {
  export type Props = {
    serviceList: V1ServiceList;
  };
}
