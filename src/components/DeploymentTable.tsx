
import { V1Deployment, V1DeploymentList } from '@kubernetes/client-node';
import * as React from 'react';
import { KubeObjectTable } from './KubeObjectTable';

export class DeploymentTable extends React.Component<DeploymentTable.Props> {
  render() {
    return (
      <KubeObjectTable<V1Deployment>
        {...this.props}
      />
    );
  }
}

export namespace DeploymentTable {
  export type Props = {
    list: V1DeploymentList;
  } & KubeObjectTable.Events<V1Deployment>;
}
