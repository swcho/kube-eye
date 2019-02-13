
import { Overlay, TextArea } from '@blueprintjs/core';
import { V1Pod } from '@kubernetes/client-node';
import * as React from 'react';
import { kubeApi } from '../services/kube';

export class LogView extends React.Component<LogView.Props, {
  logs: string;
}> {
  constructor(props: LogView.Props) {
    super(props);
    this.state = { logs: '' };
  }
  render() {
    const {
      logs,
    } = this.state;
    return (
      <div>
        <Overlay isOpen={true}>
          {/* <TextArea large={true} value={logs}/> */}
          <pre>
            {logs}
          </pre>
        </Overlay>
      </div>
    );
  }

  async componentDidMount() {
    const {
      api,
      pod,
    } = this.props;
    const {
      logs,
    } = this.state;
    if (api) {
      await api.pods().log(
        pod,
        (text) => {
          this.setState({ logs: logs + text});
        },
        {follow: true}
      );
    }
  }
}

export namespace LogView {
  export type Props = {
    api: ReturnType<typeof kubeApi>;
    pod: V1Pod;
  };
}
