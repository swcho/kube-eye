import { Button, InputGroup, Navbar, Overlay } from '@blueprintjs/core';
import { InjectedProps } from '@jaredpalmer/after';
import { V1Deployment, V1DeploymentList, V1Pod, V1PodList, V1ReplicaSet, V1ReplicaSetList, V1Role, V1RoleBinding, V1RoleBindingList, V1RoleList, V1Service, V1ServiceAccount, V1ServiceAccountList, V1ServiceList, V1StatefulSet, V1StatefulSetList } from '@kubernetes/client-node';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import * as yaml from 'js-yaml';
import React, { Component } from 'react';
import { DeploymentTable } from './components/DeploymentTable';
import ExecView from './components/ExecView';
import LogView from './components/LogView';
import { PodTable } from './components/PodTable';
import { ReplicaSetTable } from './components/ReplicaSetTable';
import { RoleBindingTable } from './components/RoleBindingTable';
import { RoleTable } from './components/RoleTable';
import { ServiceAccountTable } from './components/ServiceAccountTable';
import { ServiceTable } from './components/ServiceTable';
import { StatefullSetTable } from './components/StatefulSetTable';
import S from './HomePage.less';
import logo from './react.svg';
import { InitialCtx } from './routes';
import { kubeApi } from './services/kube';

class Home extends Component<Home.Props, {
  urlYaml: string;
  podForLog?: V1Pod;
  podForExec?: V1Pod;
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
    const deploymentList = await api.deployments().list();
    const serviceAccountList = await api.serviceAccounts().list();
    const roleList = await api.roles().list();
    const roleBindingList = await api.roleBindings().list();
    return {
      namespace,
      podList, serviceList, replicaSetList, statefulSetList, deploymentList,
      serviceAccountList, roleList, roleBindingList,
    };
  }

  constructor(props: Home.Props) {
    super(props);
    this.state = {
      urlYaml: '',
    };
  }

  private async getYaml(url: string) {
    const txtYaml = await fetch(`${url}?${Date.now()}`).then((r) => r.text());
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

  private handleReplicaSetDelete = async (replicaSet: V1ReplicaSet) => {
    if (this.api) {
      await this.api.replicaSets().del(replicaSet);
    }
  }

  private handleStatefulSetDelete = async (statefulSet: V1StatefulSet) => {
    if (this.api) {
      await this.api.statefulSets().del(statefulSet);
    }
  }

  private handleDeploymentDelete = async (deployment: V1Deployment) => {
    if (this.api) {
      await this.api.deployments().del(deployment);
    }
  }

  private handleServiceAccountDelete = async (serviceAccount: V1ServiceAccount) => {
    if (this.api) {
      await this.api.serviceAccounts().del(serviceAccount);
    }
  }

  private handleRoleDelete = async (role: V1Role) => {
    if (this.api) {
      await this.api.roles().del(role);
    }
  }

  private handleRoleBindingDelete = async (roleBinding: V1RoleBinding) => {
    if (this.api) {
      await this.api.roleBindings().del(roleBinding);
    }
  }

  renderPodList() {
    const {
      podList,
    } = this.props;
    return podList && (
      <PodTable
        list={podList}
        onDelete={(pod) => this.handlePodDelete(pod as any)}
        onLog={(podForLog) => this.setState({ podForLog })}
        onExec={(podForExec) => this.setState({ podForExec })}
      />
    );
  }

  renderServiceList() {
    const {
      serviceList,
    } = this.props;
    return serviceList && (
      <ServiceTable
        list={serviceList}
        onDelete={(service) => this.handleServiceDelete(service as any)}
      />
    );
  }

  renderReplicaSetList() {
    const {
      replicaSetList,
    } = this.props;
    return replicaSetList && (
      <ReplicaSetTable
        list={replicaSetList}
        onDelete={(replicaSet) => this.handleReplicaSetDelete(replicaSet as any)}
      />
    );
  }

  renderStatefulSetList() {
    const {
      statefulSetList,
    } = this.props;
    return statefulSetList && (
      <StatefullSetTable
        list={statefulSetList}
        onDelete={(statefulSet) => this.handleStatefulSetDelete(statefulSet as any)}
      />
    );
  }

  renderDeploymentList() {
    const {
      deploymentList,
    } = this.props;
    return deploymentList && (
      <DeploymentTable
        list={deploymentList}
        onDelete={(deployment) => this.handleDeploymentDelete(deployment as any)}
      />
    );
  }

  renderServiceAccountList() {
    const {
      serviceAccountList,
    } = this.props;
    return serviceAccountList && (
      <ServiceAccountTable
        list={serviceAccountList}
        onDelete={(serviceAccount) => this.handleServiceAccountDelete(serviceAccount as any)}
      />
    );
  }

  renderRoleList() {
    const {
      roleList,
    } = this.props;
    return roleList && (
      <RoleTable
        list={roleList}
        onDelete={(role) => this.handleRoleDelete(role as any)}
      />
    );
  }

  renderRoleBindingList() {
    const {
      roleBindingList,
    } = this.props;
    return roleBindingList && (
      <RoleBindingTable
        list={roleBindingList}
        onDelete={(roleBinding) => this.handleRoleBindingDelete(roleBinding as any)}
      />
    );
  }

  renderLogView() {
    const {
      podForLog,
    } = this.state;
    return this.api && podForLog && (
      <LogView
        api={this.api}
        pod={podForLog}
        onClose={() => this.setState({ podForLog: undefined })}
      />
    );
  }

  renderExecView() {
    const {
      podForExec,
    } = this.state;
    return this.api && podForExec && (
      <ExecView
        api={this.api}
        pod={podForExec}
        onClose={() => this.setState({ podForExec: undefined })}
      />
    );
  }

  render() {
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
        {this.renderPodList()}
        <h4>Services</h4>
        {this.renderServiceList()}
        <h4>Replica sets</h4>
        {this.renderReplicaSetList()}
        <h4>Stateful sets</h4>
        {this.renderStatefulSetList()}
        <h4>Deployments</h4>
        {this.renderDeploymentList()}

        <h4>Service accounts</h4>
        {this.renderServiceAccountList()}
        <h4>Roles</h4>
        {this.renderRoleList()}
        <h4>Role bindings</h4>
        {this.renderRoleBindingList()}

        {this.renderLogView()}
        {this.renderExecView()}
      </div>
    );
  }

  componentDidMount() {
    const {
      namespace,
    } = this.props;
    this.api = kubeApi({ namespace });
    const podForLog = this.props.podList.items[1];
    // this.setState({ podForLog });
  }
}

namespace Home {
  export type OwnProps = {
    namespace: string;
    podList: V1PodList
    serviceList: V1ServiceList;
    replicaSetList: V1ReplicaSetList;
    statefulSetList: V1StatefulSetList;
    deploymentList: V1DeploymentList;
    serviceAccountList: V1ServiceAccountList;
    roleList: V1RoleList;
    roleBindingList: V1RoleBindingList;
  };

  export type InitialProps = InitialCtx & OwnProps;

  export type Props = InjectedProps<InitialProps>;
}

export default withStyles(S)(Home);
