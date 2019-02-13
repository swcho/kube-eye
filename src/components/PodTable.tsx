
import { Cell, Column } from '@blueprintjs/table';
import { V1ContainerStatus, V1Pod, V1PodList } from '@kubernetes/client-node';
import moment from 'moment';
import * as React from 'react';
import { KubeObjectTable } from './KubeObjectTable';

export const renderAge = (items: V1Pod[]) => (index: number) => {
  const item = items[index];
  const startTime = new Date(item.status.startTime);
  return (
    <Cell>{moment.duration(Date.now() - startTime.getTime()).humanize()}</Cell>
  );
};

const statusStr = (status: V1ContainerStatus) => {
  // return Object.keys(status)[0];
  const state = Object.keys(status.state)[0];
  return `${status.name}: ${state}`;
};

const renderContainers = (items: V1Pod[], selected: (pod: V1Pod, containerName: string) => void) => (index: number) => {
  const item = items[index];
  const containerStatuses = item.status.containerStatuses || [];
  return (
    <Cell>
      <React.Fragment>
        <select
          onChange={
            (e) => {
              const containerName = e.target.value;
              selected(item, containerName);
            }
          }
        >
          {containerStatuses.map((cs) => <option key={cs.containerID} value={cs.name}>{statusStr(cs)}</option>)}
        </select>
      </React.Fragment>
    </Cell>
  );
};

export class PodTable extends React.Component<PodTable.Props> {
  private selectedContainerName = {};
  getSelectedContainerName(pod: V1Pod) {
    return this.selectedContainerName[pod.metadata.name] || pod.status.containerStatuses[0].name;
  }

  render() {
      const {
        list,
      } = this.props;
      return (
        <KubeObjectTable<V1Pod>
          list={list}
          {...this.props}
        >
          <Column
            // key="cip"
            name="Age"
            cellRenderer={renderAge(list.items)}
          />
          <Column
            // key="cip"
            name="Containers"
            cellRenderer={renderContainers(list.items, (pod, containerName) => {
              this.selectedContainerName[pod.metadata.name] = containerName;
            })}
          />
        </KubeObjectTable>
      );
    }
}

export namespace PodTable {
  export type Props = {
    list: V1PodList;
  } & KubeObjectTable.Events<V1Pod>;
}
