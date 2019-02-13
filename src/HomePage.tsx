import { Button, InputGroup, Navbar } from '@blueprintjs/core';
import { InjectedProps } from '@jaredpalmer/after';
import { V1Pod, V1PodList, V1ReplicaSetList, V1Service, V1ServiceList, V1StatefulSetList } from '@kubernetes/client-node';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import * as yaml from 'js-yaml';
import React, { Component, SyntheticEvent } from 'react';
import { PodTable } from './components/PodTable';
import { ReplicaSetTable } from './components/ReplicaSetTable';
import { ServiceTable } from './components/ServiceTable';
import { StatefullSetTable } from './components/StatefulSetTable';
import S from './HomePage.less';
import logo from './react.svg';
import { InitialCtx } from './routes';
import { kubeApi } from './services/kube';
import { makeQuery } from './services/utils';

class Home extends Component<Home.Props, {
  urlYaml: string;
}> {

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

  constructor(props: Home.Props) {
    super(props);
    this.state = {
      urlYaml: '',
    };
  }

  private async getYaml(url: string) {
    // const txtYaml = await fetch(`/ncc/api/content${makeQuery({ url })}`).then((r) => r.text());
    const txtYaml = await fetch(url).then((r) => r.text());
    return yaml.loadAll(txtYaml);
  }

  private getAPIByKind(kind: string): any {
    if (!this.api) {
      return null;
    }
    if (kind === 'Deployment') {
      return this.api.deployments();
    }
    if (kind === 'Service') {
      return this.api.services();
    }
    if (kind === 'Pod') {
      return this.api.pods();
    }
    if (kind === 'ServiceAccount') {
      return this.api.serviceAccounts();
    }
    if (kind === 'Role') {
      return this.api.roles();
    }
    if (kind === 'RoleBinding') {
      return this.api.roleBindings();
    }
    if (kind === 'Ingress') {
      return this.api.ingresses();
    }
  }

  private handleCreate = async () => {
    const {
      urlYaml,
    } = this.state;
    const yamls = await this.getYaml(urlYaml);
    console.log(yamls);
    for (const yaml of yamls) {
      const api = this.getAPIByKind(yaml.kind);
      await api.create(yaml);
    }
  }

  private handleUpdate = async () => {
    const {
      urlYaml,
    } = this.state;
    const yamls = await this.getYaml(urlYaml);
    console.log(yamls);
    for (const yaml of yamls) {
      const api = this.getAPIByKind(yaml.kind);
      await api.update(yaml);
    }
  }

  private handleYamlURLChange = (e: React.FormEvent<HTMLInputElement>) => {
    const urlYaml = e.currentTarget.value;
    this.setState({ urlYaml });
  }

  private handlePodDelete = async (pod: V1Pod) => {
    if (this.api) {
      await this.api.pods().del(pod);
    }
  }

  private handleServiceDelete = async (service: V1Service) => {
    if (this.api) {
      await this.api.services().del(service);
    }
  }

  render() {
    const {
      podList,
      serviceList,
      replicaSetList,
      statefulSetList,
    } = this.props;
    const {
      urlYaml,
    } = this.state;
    // console.log('render', this.props);
    return (
      <div className={S.Home}>
        <Navbar/>
        <div>
          <InputGroup
            value={urlYaml}
            placeholder="YAML URL"
            onChange={this.handleYamlURLChange}
          />
          <Button text="Create" onClick={this.handleCreate}/>
          <Button text="Update" onClick={this.handleUpdate}/>
        </div>
        <h4>Pods</h4>
        {podList && <PodTable pods={podList} onDelete={this.handlePodDelete}/>}
        <h4>Services</h4>
        {serviceList && <ServiceTable serviceList={serviceList} onDelete={this.handleServiceDelete}/>}
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
