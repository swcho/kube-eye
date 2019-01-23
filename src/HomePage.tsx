import { Navbar } from '@blueprintjs/core';
import { Ctx, InjectedProps } from '@jaredpalmer/after';
import { V1Pod, V1PodList, V1ReplicaSetList, V1ServiceList, V1StatefulSetList } from '@kubernetes/client-node';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { PodTable } from './components/PodTable';
import { ReplicaSetTable } from './components/ReplicaSetTable';
import { ServiceTable } from './components/ServiceTable';
import { StatefullSetTable } from './components/StatefulSetTable';
import S from './HomePage.less';
import logo from './react.svg';
import { InitialCtx } from './routes';
import { kubeApi } from './services/kube';

class Home extends Component<Home.Props> {

  private api: ReturnType<typeof kubeApi> | undefined;

  static async getInitialProps(props: InitialCtx): Promise<Home.OwnProps> {
    const {
      namespace
    } = props;
    const api = kubeApi({ namespace });
    const podList = await api.pods().list();
    const serviceList = await api.services().list();
    const replicaSetList = await api.replicaSets().list();
    const statefulSetList = await api.statefulSets().list();
    return { podList, serviceList, replicaSetList, statefulSetList, };
  }

  private onPodDelete = async (pod: V1Pod) => {
    if (this.api) {
      await this.api.pods().del(pod);
    }
  }

  render() {
    const {
      podList,
      serviceList,
      replicaSetList,
      statefulSetList,
    } = this.props;
    // console.log('render', this.props);
    return (
      <div className={S.Home}>
        <Navbar/>
        <h4>Pods</h4>
        {podList && <PodTable pods={podList} onDelete={this.onPodDelete}/>}
        <h4>Services</h4>
        {serviceList && <ServiceTable serviceList={serviceList}/>}
        <h4>Replica sets</h4>
        {replicaSetList && <ReplicaSetTable replicaSetList={replicaSetList}/>}
        <h4>Stateful sets</h4>
        {statefulSetList && <StatefullSetTable statefulSetList={statefulSetList}/>}
      </div>
    );
  }

  componentDidMount() {
    this.api = kubeApi({ namespace: 'swtest' });
  }
}

namespace Home {
  export type OwnProps = {
    podList: V1PodList
    serviceList: V1ServiceList;
    replicaSetList: V1ReplicaSetList;
    statefulSetList: V1StatefulSetList;
  };

  export type InitialProps = InitialCtx & OwnProps;

  export type Props = InjectedProps<InitialProps>;
}

export default withStyles(S)(Home);
