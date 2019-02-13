
import { V1Role, V1RoleList } from '@kubernetes/client-node';
import * as React from 'react';
import { KubeObjectTable } from './KubeObjectTable';

export class RoleTable extends React.Component<RoleTable.Props> {
  render() {
    return (
      <KubeObjectTable<V1Role>
        {...this.props}
      />
    );
  }
}

export namespace RoleTable {
  export type Props = {
    list: V1RoleList;
  } & KubeObjectTable.Events<V1Role>;
}
