
import { V1Deployment, V1DeploymentList, V1ServiceAccount, V1ServiceAccountList } from '@kubernetes/client-node';
import * as React from 'react';
import { KubeObjectTable } from './KubeObjectTable';

export class ServiceAccountTable extends React.Component<ServiceAccountTable.Props> {
  render() {
    return (
      <KubeObjectTable<V1ServiceAccount>
        {...this.props}
      />
    );
  }
}

export namespace ServiceAccountTable {
  export type Props = {
    list: V1ServiceAccountList;
  } & KubeObjectTable.Events<V1ServiceAccount>;
}
