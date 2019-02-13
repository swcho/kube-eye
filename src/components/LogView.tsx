
import { Button, Overlay, TextArea } from '@blueprintjs/core';
import { V1Pod } from '@kubernetes/client-node';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import * as React from 'react';
import { kubeApi } from '../services/kube';
import S from './LogView.less';

class LogView extends React.Component<LogView.Props, {
  logs: string;
}> {

  private reader: ReadableStreamReader | undefined;

  private elLog: HTMLPreElement | undefined | null;
  constructor(props: LogView.Props) {
    super(props);
    this.state = { logs: '' };
  }

  render() {
    const {
      onClose,
    } = this.props;
    const {
      logs,
    } = this.state;
    return (
      <div>
        <Overlay isOpen={true}>
          <div className={S.LogView}>
            <div className={S.inner}>
              <pre ref={(el) => this.elLog = el}>
                {logs}
              </pre>
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
    const {
      logs,
    } = this.state;
    if (api) {
      await api.pods().log(
        pod,
        (reader) => {
          this.reader = reader;
        },
        (logs) => {
          this.setState({ logs });
        },
        {follow: true}
      );
    }
  }

  componentDidUpdate() {
    if (this.elLog) {
      this.elLog.scrollTo({ top: this.elLog.scrollHeight });
    }
  }

  componentWillUnmount() {
    if (this.reader) {
      this.reader.cancel();
    }
  }
}

export namespace LogView {
  export type Props = {
    api: ReturnType<typeof kubeApi>;
    pod: V1Pod;
    onClose: () => void;
  };
}

export default withStyles(S)(LogView);
