
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

const renderName = <T extends KubeObject>(items: T[]) => (index: number) => {
  const name = items[index].metadata.name;
  return (
    <Cell>
      <React.Fragment>
        <Button icon="clipboard" onClick={() => copyToClipboard(name)}/>
      </React.Fragment>
      {name}
    </Cell>
  );
};

const renderStringList = (strs: string[]) => {
  return (
    <React.Fragment>
      <select>
        {strs.map((str, i) => <option key={i}>{str}</option>)}
      </select>
    </React.Fragment>
  );
};

const renderLabels = <T extends KubeObject>(items: T[]) => (index: number) => {
  const labels = items[index].metadata.labels;
  const contents = Object.keys(labels).map((key) => `${key}: ${labels[key]}`);
  return (
    <Cell>{renderStringList(contents)}</Cell>
  );
};

const renderAnnots = <T extends KubeObject>(items: T[]) => (index: number) => {
  const annotations = items[index].metadata.annotations;
  const contents = annotations ? Object.keys(annotations).map((key) => `${key}: ${annotations[key]}`) : [];
  return (
    <Cell>{renderStringList(contents)}</Cell>
  );
};

const renderButtons = <T extends KubeObject>(props: KubeObjectTable.Props<T>) => (index: number) => {
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
};

export class KubeObjectTable<T extends KubeObject> extends React.Component<KubeObjectTable.Props<T>> {
  render() {
      const {
        list,
        children,
      } = this.props;
      const cols = [
        <Column
          key="Name"
          name="Name"
          cellRenderer={renderName(list.items)}
        />,
        <Column
          key="Labels"
          name="Labels"
          cellRenderer={renderLabels(list.items)}
        />,
        <Column
          key="Annot."
          name="Annot."
          cellRenderer={renderAnnots(list.items)}
        />,
      ];
      if (children) {
        cols.push(children as any);
      }
      cols.push((
        <Column
          key="btns"
          name=""
          cellRenderer={renderButtons(this.props)}
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
  export type Events<T> = {
    onDelete: (kubeObj: T) => void;
    onLog?: (kubeObj: T) => void;
    onExec?: (kubeObj: T) => void;
  };
  export type Props<T extends KubeObject> = {
    list: KubeObjectList<T>;
  } & Events<T>;
}
