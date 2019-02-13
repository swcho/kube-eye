
import { Button, ButtonGroup } from '@blueprintjs/core';
import { Cell, Column, Table } from '@blueprintjs/table';
import { V1ObjectMeta } from '@kubernetes/client-node';
import * as React from 'react';
import { copyToClipboard } from './uiutils';

export type KubeObject = {
  metadata: V1ObjectMeta;
};

export type KubeObjectList<T extends KubeObject> = {
  items: T[];
};

export class KubeObjectTable<T extends KubeObject> extends React.Component<KubeObjectTable.Props<T>> {
  static renderName = <T extends KubeObject>(items: T[]) => (index: number) => {
    const name = items[index].metadata.name;
    return (
      <Cell onKeyPress={(e) => {console.log(e); }}>
        <Button small={true} icon="clipboard" onClick={() => copyToClipboard(name)}/>
        {name}
      </Cell>
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

  static renderButtons = <T extends KubeObject>(props: KubeObjectTable.Props<T>) => (index: number) => {
    const {
      list, onDelete, onExec, onLog,
    } = props;
    const kubeObj = list.items[index];
    return (
      <Cell>
        <React.Fragment>
          <ButtonGroup>
            <Button small={true} icon="trash" onClick={() => onDelete(kubeObj)}/>
            {onExec && <Button small={true} icon="application" onClick={() => onExec(kubeObj)}/>}
            {onLog && <Button small={true} icon="pulse" onClick={() => onLog(kubeObj)}/>}
          </ButtonGroup>
        </React.Fragment>
      </Cell>
    );
  }

  render() {
      const {
        list,
        children,
      } = this.props;
      const cols = [
        <Column
          key="Name"
          name="Name"
          cellRenderer={KubeObjectTable.renderName(list.items)}
        />,
        <Column
          key="Labels"
          name="Labels"
          cellRenderer={KubeObjectTable.renderLabels(list.items)}
        />,
        <Column
          key="Annot."
          name="Annot."
          cellRenderer={KubeObjectTable.renderAnnots(list.items)}
        />,
      ];
      if (children) {
        cols.push(children as any);
      }
      cols.push((
        <Column
          key="btns"
          name=""
          cellRenderer={KubeObjectTable.renderButtons(this.props)}
        />
      ));
      return (
        <Table numRows={list.items.length}>
          {cols}
        </Table>
      );
    }
}

export namespace KubeObjectTable {
  export type Events = {
    onDelete: (kubeObj: KubeObject) => void;
    onLog?: (kubeObj: KubeObject) => void;
    onExec?: (kubeObj: KubeObject) => void;
  };
  export type Props<T extends KubeObject> = {
    list: KubeObjectList<T>;
  } & Events;
}
