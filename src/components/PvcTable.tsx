
import { V1PersistentVolumeClaim, V1PersistentVolumeClaimList } from '@kubernetes/client-node';
import * as React from 'react';
import { KubeObjectTable } from './KubeObjectTable';

export class PvcTable extends React.Component<PvcTable.Props> {
  render() {
    return (
      <KubeObjectTable<V1PersistentVolumeClaim>
        {...this.props}
      />
    );
  }
}

export namespace PvcTable {
  export type Props = {
    list: V1PersistentVolumeClaimList;
  } & KubeObjectTable.Events<V1PersistentVolumeClaim>;
}
