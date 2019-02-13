
import { V1RoleBinding, V1RoleBindingList } from '@kubernetes/client-node';
import * as React from 'react';
import { KubeObjectTable } from './KubeObjectTable';

export class RoleBindingTable extends React.Component<RoleBindingTable.Props> {
  render() {
    return (
      <KubeObjectTable<V1RoleBinding>
        {...this.props}
      />
    );
  }
}

export namespace RoleBindingTable {
  export type Props = {
    list: V1RoleBindingList;
  } & KubeObjectTable.Events<V1RoleBinding>;
}
