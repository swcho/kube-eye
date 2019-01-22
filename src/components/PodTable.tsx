
import { Button, ButtonGroup } from '@blueprintjs/core';
import { Cell, Column, Table } from '@blueprintjs/table';
import { V1Pod, V1PodList } from '@kubernetes/client-node';
import * as React from 'react';

export class PodTable extends React.Component<PodTable.Props> {
  static renderName = (pods: V1Pod[]) => (index: number) => {
    return (
      <Cell>{pods[index].metadata.name}</Cell>
    );
  }

  static renderButtons = ({pods, onDelete}: PodTable.Props) => (index: number) => {
    const pod = pods.items[index];
    return (
      <Cell>
        <React.Fragment>
          <ButtonGroup>
            <Button small={true} icon="trash" onClick={() => onDelete(pod)}/>
            <Button small={true} icon="application"/>
            <Button small={true} icon="pulse"/>
          </ButtonGroup>
        </React.Fragment>
      </Cell>
    );
  }

  render() {
      const {
        pods,
      } = this.props;
      return (
        <Table numRows={pods.items.length}>
          <Column
            name="Name"
            cellRenderer={PodTable.renderName(pods.items)}
          />
          <Column
             name=""
             cellRenderer={PodTable.renderButtons(this.props)}
          />
        </Table>
      );
    }
}

export namespace PodTable {
  export type Props = {
    pods: V1PodList;
    onDelete: (pod: V1Pod) => void;
  };
}
