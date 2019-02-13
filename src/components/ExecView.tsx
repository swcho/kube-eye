import { Button, Overlay } from '@blueprintjs/core';
import { V1Pod } from '@kubernetes/client-node';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import * as React from 'react';
import { Terminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';
import { kubeApi } from '../services/kube';

// import '../../node_modules/xterm/src/xterm.css';
import S from './ExecView.less';

function utf8_to_b64(str: string) {
  return window.btoa(window['unescape'](encodeURIComponent(str)));
}

function b64_to_utf8(str: string) {
  return decodeURIComponent(window['escape'](window.atob(str)));
}

class ExecView extends React.Component<ExecView.Props> {
  private elXterm: HTMLDivElement | undefined | null;
  render() {
    const { onClose } = this.props;
    return (
      <div>
        <Overlay isOpen={true} onOpened={this.handleOpened}>
          <div className={S.ExecView}>
            <div className={S.inner}>
              <div className={S.terminal} ref={(el) => (this.elXterm = el)} />
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </Overlay>
      </div>
    );
  }

  handleOpened = async () => {
    const { api, pod } = this.props;
    if (!api || !this.elXterm) {
      return;
    }
    try {
      const defaultCols = 120;
      const defaultRows = 25;
      const cols = defaultCols;
      const rows = defaultRows;
      const xterm = new Terminal({
        cols,
        rows,
      });
      xterm.open(this.elXterm);

      const container = pod.spec.containers[0].name;
      const ws = api.pods().exec(
        pod,
        {
          container,
          command: ['/bin/sh', '-i'],
          stdin: true,
          stdout: true,
          stderr: true,
          tty: true
        },
      );

      let alive;
      let first = true;
      ws.onopen = (ev) => {
        alive = setInterval(() => ws.send('0'), 30 * 1000);
      };
      ws.onmessage = (ev) => {
        const data = ev.data.slice(1);
        console.log('onmessage', data);
        switch (ev.data[0]) {
          case '1':
          case '2':
          case '3':
            xterm.write(b64_to_utf8(data));
            break;
          default:
        }
        if (first) {
          first = false;
          xterm.focus();
        }
      };

      xterm.on('data', (data) => {
        // ws.emit('data', data);
        if (ws.readyState === 1) {
          console.log('xterm.data', data);
          ws.send('0' + utf8_to_b64(data));
        }
      });
    } catch (e) {
      console.error(e);
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
