
import { V1beta1Ingress, V1beta1IngressList } from '@kubernetes/client-node';
import * as React from 'react';
import { KubeObjectTable } from './KubeObjectTable';

export class IngressTable extends React.Component<IngressTable.Props> {
  render() {
    return (
      <KubeObjectTable<V1beta1Ingress>
        {...this.props}
      />
    );
  }
}

export namespace IngressTable {
  export type Props = {
    list: V1beta1IngressList;
  } & KubeObjectTable.Events<V1beta1Ingress>;
}
