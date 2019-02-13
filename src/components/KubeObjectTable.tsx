
import { Button, ButtonGroup } from '@blueprintjs/core';
import { Cell, Column, Table } from '@blueprintjs/table';
import { V1ObjectMeta } from '@kubernetes/client-node';
import * as React from 'react';

export type KubeObject = {
  metadata: V1ObjectMeta;
};

export type KubeObjectList<T extends KubeObject> = {
  items: T[];
};

export class KubeObjectTable<T extends KubeObject> extends React.Component<KubeObjectTable.Props<T>> {
  static renderName = <T extends KubeObject>(items: T[]) => (index: number) => {
    return (
      <Cell>{items[index].metadata.name}</Cell>
    );
  }

  static renderLabels = <T extends KubeObject>(items: T[]) => (index: number) => {
    return (
      <Cell>{JSON.stringify(items[index].metadata.labels, null, 2)}</Cell>
    );
  }

  static renderAnnots = <T extends KubeObject>(items: T[]) => (index: number) => {
    return (
      <Cell>{JSON.stringify(items[index].metadata.annotations, null, 2)}</Cell>
    );
  }

  static renderButtons = <T extends KubeObject>({list, onDelete}: KubeObjectTable.Props<T>) => (index: number) => {
    const kubeObj = list.items[index];
    return (
      <Cell>
        <React.Fragment>
          <ButtonGroup>
            <Button small={true} icon="trash" onClick={() => onDelete(kubeObj)}/>
            <Button small={true} icon="application"/>
            <Button small={true} icon="pulse"/>
          </ButtonGroup>
        </React.Fragment>
      </Cell>
    );
  }

  render() {
      const {
        list,
      } = this.props;
      return (
        <Table numRows={list.items.length}>
          <Column
            name="Name"
            cellRenderer={KubeObjectTable.renderName(list.items)}
          />
          <Column
            name="Labels"
            cellRenderer={KubeObjectTable.renderLabels(list.items)}
          />
          <Column
            name="Annot."
            cellRenderer={KubeObjectTable.renderAnnots(list.items)}
          />
          <Column
             name=""
             cellRenderer={KubeObjectTable.renderButtons(this.props)}
          />
        </Table>
      );
    }
}

export namespace KubeObjectTable {
  export type Props<T extends KubeObject> = {
    list: KubeObjectList<T>;
    onDelete: (kubeObj: KubeObject) => void;
  };
}
