
import { Cell, Column } from '@blueprintjs/table';
import { V1Pod, V1PodList } from '@kubernetes/client-node';
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

export class PodTable extends React.Component<PodTable.Props> {
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
        </KubeObjectTable>
      );
    }
}

export namespace PodTable {
  export type Props = {
    list: V1PodList;
  } & KubeObjectTable.Events<V1Pod>;
}
