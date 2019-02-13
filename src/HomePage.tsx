import { Button, InputGroup, Navbar } from '@blueprintjs/core';
import { InjectedProps } from '@jaredpalmer/after';
import { V1beta1IngressList, V1DeploymentList, V1PersistentVolumeClaimList, V1Pod, V1PodList, V1ReplicaSetList, V1RoleBindingList, V1RoleList, V1ServiceAccountList, V1ServiceList, V1StatefulSetList } from '@kubernetes/client-node';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import * as yaml from 'js-yaml';
import React, { Component } from 'react';
import { DeploymentTable } from './components/DeploymentTable';
import ExecView from './components/ExecView';
import { IngressTable } from './components/IngressTable';
import LogView from './components/LogView';
import { PodTable } from './components/PodTable';
import { PvcTable } from './components/PvcTable';
import { ReplicaSetTable } from './components/ReplicaSetTable';
import { RoleBindingTable } from './components/RoleBindingTable';
import { RoleTable } from './components/RoleTable';
import { ServiceAccountTable } from './components/ServiceAccountTable';
import { ServiceTable } from './components/ServiceTable';
import { StatefullSetTable } from './components/StatefulSetTable';
import { YamlEditor } from './components/YamlEditor';
import S from './HomePage.less';
import logo from './react.svg';
import { InitialCtx } from './routes';
import { kubeApi } from './services/kube';

class Home extends Component<Home.Props, {
  txtYaml: string;
  urlYaml: string;
  podForLog?: V1Pod;
  podForExec?: V1Pod;
}> {

  private api: ReturnType<typeof kubeApi> | undefined;

  private yamlEditor: YamlEditor | undefined | null;

  private podTable: PodTable | undefined | null;

  static async getInitialProps(props: InitialCtx): Promise<Home.OwnProps> {
    const {
      namespace
    } = props;
    const api = kubeApi({ namespace });
    const podList = await api.pods().list();
    const serviceList = await api.services().list();
    const ingressList = await api.ingresses().list();
    const pvcList = await api.pvcs().list();
    const replicaSetList = await api.replicaSets().list();
    const statefulSetList = await api.statefulSets().list();
    const deploymentList = await api.deployments().list();
    const serviceAccountList = await api.serviceAccounts().list();
    const roleList = await api.roles().list();
    const roleBindingList = await api.roleBindings().list();
    return {
      namespace,
      podList, serviceList, ingressList, pvcList,
      replicaSetList, statefulSetList, deploymentList,
      serviceAccountList, roleList, roleBindingList,
    };
  }

  constructor(props: Home.Props) {
    super(props);
    this.state = {
      txtYaml: '',
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
    if (kind === 'StatefulSet') {
      return this.api.statefulSets();
    }
    if (kind === 'PersistentVolumeClaims') {
      return this.api.pvcs();
    }
  }

  private async getYamls(): Promise<any[]> {
    const {
      urlYaml,
    } = this.state;
    if (this.yamlEditor && this.yamlEditor.editor) {
      const txt = this.yamlEditor.editor.getValue();
      return yaml.loadAll(txt);
    }
    return this.getYaml(urlYaml);
  }

  private handleCreate = async () => {
    const yamls = await this.getYamls();
    for (const yaml of yamls) {
      const api = this.getAPIByKind(yaml.kind);
      await api.create(yaml);
    }
  }

  private handleUpdate = async () => {
    const yamls = await this.getYamls();
    for (const yaml of yamls) {
      const api = this.getAPIByKind(yaml.kind);
      await api.update(yaml);
    }
  }

  private handleYamlURLChange = (e: React.FormEvent<HTMLInputElement>) => {
    const urlYaml = e.currentTarget.value;
    this.setState({ urlYaml });
  }

  private handleDelete = (kind: string) => async (obj: any) => {
    const api = this.getAPIByKind(kind);
    await api.del(obj);
  }
  renderPodList() {
    const {
      podList,
    } = this.props;
    return podList && (
      <PodTable
        ref={(ref) => this.podTable = ref}
        list={podList}
        onDelete={this.handleDelete('Pod')}
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
        onDelete={this.handleDelete('Service')}
      />
    );
  }

  renderIngressList() {
    const {
      ingressList,
    } = this.props;
    return ingressList && (
      <IngressTable
        list={ingressList}
        onDelete={this.handleDelete('Ingress')}
      />
    );
  }

  renderPvcList() {
    const {
      pvcList,
    } = this.props;
    return pvcList && (
      <PvcTable
        list={pvcList}
        onDelete={this.handleDelete('PersistentVolumeClaims')}
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
        onDelete={this.handleDelete('ReplicaSet')}
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
        onDelete={this.handleDelete('StatefulSet')}
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
        onDelete={this.handleDelete('Deployment')}
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
        onDelete={this.handleDelete('ServiceAccount')}
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
        onDelete={this.handleDelete('Role')}
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
        onDelete={this.handleDelete('RoleBinding')}
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
        containerName={this.podTable ? this.podTable.getSelectedContainerName(podForExec) : ''}
        onClose={() => this.setState({ podForExec: undefined })}
      />
    );
  }

  render() {
    const {
      txtYaml,
      urlYaml,
    } = this.state;
    // console.log('render', this.props);
    return (
      <div className={S.Home}>
        <Navbar/>
        <YamlEditor
          className={S.editor}
          value={txtYaml}
          ref={(ref) => this.yamlEditor = ref}
          onChange={(txtYaml) => this.setState({ txtYaml })}
        />
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
        <h4>Deployments</h4>
        {this.renderDeploymentList()}
        <h4>Replica sets</h4>
        {this.renderReplicaSetList()}
        <h4>Stateful sets</h4>
        {this.renderStatefulSetList()}

        <h4>Services</h4>
        {this.renderServiceList()}
        <h4>Ingress</h4>
        {this.renderIngressList()}

        <h4>PVCs</h4>
        {this.renderPvcList()}

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
    ingressList: V1beta1IngressList;
    pvcList: V1PersistentVolumeClaimList;
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
