
import { Button, ButtonGroup } from '@blueprintjs/core';
import { Cell, Column, Table } from '@blueprintjs/table';
import { V1Service, V1ServiceList } from '@kubernetes/client-node';
import * as React from 'react';

export class ServiceTable extends React.Component<ServiceTable.Props> {
  static renderName = (pods: V1Service[]) => (index: number) => {
    return (
      <Cell>{pods[index].metadata.name}</Cell>
    );
  }

  static renderButtons = ({serviceList, onDelete}: ServiceTable.Props) => (index: number) => {
    const service = serviceList.items[index];
    return (
      <Cell>
        <React.Fragment>
          <ButtonGroup>
            <Button small={true} icon="trash" onClick={() => onDelete(service)}/>
          </ButtonGroup>
        </React.Fragment>
      </Cell>
    );
  }
  render() {
      const {
        serviceList,
      } = this.props;
      return (
        <Table numRows={serviceList.items.length}>
          <Column name="Name" cellRenderer={ServiceTable.renderName(serviceList.items)}/>
          <Column
            name=""
            cellRenderer={ServiceTable.renderButtons(this.props)}
          />
        </Table>
      );
    }
}

export namespace ServiceTable {
  export type Props = {
    serviceList: V1ServiceList;
    onDelete: (pod: V1Service) => void;
  };
}
