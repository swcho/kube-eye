
import { Button, Overlay } from '@blueprintjs/core';
import { V1Pod } from '@kubernetes/client-node';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import * as React from 'react';
import { kubeApi } from '../services/kube';
import S from './ExecView.less';

class ExecView extends React.Component<ExecView.Props> {
  render() {
    const {
      onClose,
    } = this.props;
    return (
      <div>
        <Overlay isOpen={true}>
          <div className={S.ExecView}>
            <div className={S.inner}>
              <pre></pre>
              <Button
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </Overlay>
      </div>
    );
  }

  async componentDidMount() {
    const {
      api,
      pod,
    } = this.props;
    if (api) {
      try {
        const container = pod.spec.containers[0].name;
        await api.pods().exec(
          pod,
          {
            container,
            command: '/bin/bash',
            stdin: true,
            stdout: true,
            stderr: true,
            tty: true,
          },
          null,
          null,
        );
      } catch (e) {
        console.error(e);
      }
    }
  }

}

export namespace ExecView {
  export type Props = {
    api: ReturnType<typeof kubeApi>;
    pod: V1Pod;
    onClose: () => void;
  };
}

export default withStyles(S)(ExecView);