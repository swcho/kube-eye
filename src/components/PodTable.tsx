
import { Button, ButtonGroup } from '@blueprintjs/core';
import { Cell, Column, Table } from '@blueprintjs/table';
import { V1Pod, V1PodList } from '@kubernetes/client-node';
import * as React from 'react';
import { KubeObject, KubeObjectTable } from './KubeObjectTable';

export class PodTable extends React.Component<PodTable.Props> {
  render() {
      const {
        pods,
        onDelete,
      } = this.props;
      return (
        <KubeObjectTable list={pods} onDelete={onDelete}/>
      );
    }
}

export namespace PodTable {
  export type Props = {
    pods: V1PodList;
    onDelete: (pod: KubeObject) => void;
  };
}
