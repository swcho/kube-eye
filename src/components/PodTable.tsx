
import { V1PodList } from '@kubernetes/client-node';
import * as React from 'react';
import { KubeObjectTable } from './KubeObjectTable';

export class PodTable extends React.Component<PodTable.Props> {
  render() {
      const {
        pods,
      } = this.props;
      return (
        <KubeObjectTable
          list={pods}
          {...this.props}
        />
      );
    }
}

export namespace PodTable {
  export type Props = {
    pods: V1PodList;
  } & KubeObjectTable.Events;
}
