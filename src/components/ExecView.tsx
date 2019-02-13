import { Button, Overlay } from '@blueprintjs/core';
import { V1Pod } from '@kubernetes/client-node';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import * as React from 'react';
import { Terminal } from 'xterm';
import { kubeApi } from '../services/kube';

// import '../../node_modules/xterm/src/xterm.css';
import S from './ExecView.less';

function utf8_to_b64(str: string) {
  return window.btoa(window['unescape'](encodeURIComponent(str)));
}

function b64_to_utf8(str: string) {
  return decodeURIComponent(window['escape'](window.atob(str)));
}

const DEFAULT_COLS = 120;
const DEFAULT_ROWS = 25;

class ExecView extends React.Component<ExecView.Props> {
  private elXterm: HTMLDivElement | undefined | null;

  // https://github.com/kubernetes-ui/container-terminal/blob/master/container-terminal.js
  private ws: WebSocket | undefined;
  private xterm: Terminal;
  private cols: number;
  private rows: number;

  constructor(props: ExecView.Props) {
    super(props);
    this.cols = DEFAULT_COLS;
    this.rows = DEFAULT_ROWS;
    this.xterm = new Terminal({
      cols: this.cols,
      rows: this.rows,
    });
  }

  render() {
    const {
      containerName,
    } = this.props;
    return (
      <div>
        <Overlay isOpen={true} onOpened={this.handleOpened}>
          <div className={S.ExecView}>
            <div className={S.inner}>
              <h1 className={S.name}>{containerName}</h1>
              <div className={S.terminal} ref={(el) => (this.elXterm = el)} />
              <Button onClick={() => this.handleClose()}>Close</Button>
            </div>
          </div>
        </Overlay>
      </div>
    );
  }
  handleOpened = async () => {
    const { api, pod, containerName } = this.props;
    if (!api || !this.elXterm) {
      return;
    }
    try {
      this.xterm.open(this.elXterm);

      this.ws = api.pods().exec(
        pod,
        {
          container: containerName,
          command: ['/bin/sh', '-i'],
          stdin: true,
          stdout: true,
          stderr: true,
          tty: true
        },
      );

      let alive;
      let first = true;
      this.ws.onopen = (ev) => {
        alive = setInterval(() => this.ws && this.ws.send('0'), 30 * 1000);
      };
      this.ws.onmessage = (ev) => {
        const data = ev.data.slice(1);
        console.log('onmessage', data);
        switch (ev.data[0]) {
          case '1':
          case '2':
          case '3':
            this.xterm.write(b64_to_utf8(data));
            break;
          default:
        }
        if (first) {
          first = false;
          this.xterm.focus();
        }
      };
      this.ws.onclose = (ev) => {
        this.handleClose(ev.reason, first);
      };

      this.xterm.on('data', (data) => {
        // ws.emit('data', data);
        if (this.ws && this.ws.readyState === 1) {
          console.log('xterm.data', data);
          this.ws.send('0' + utf8_to_b64(data));
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  handleClose(message?: string, first?: boolean) {
    if (!message && first) {
        message = 'Could not connect to the container. Do you have sufficient privileges?';
    }
    if (!message) {
        message = 'disconnected';
    }
    if (!first) {
        message = '\r\n' + message;
    }
    if (this.ws) {
      this.ws.close();
    }
    this.xterm.write('\x1b[31m' + message + '\x1b[m\r\n');
    this.xterm.dispose();
    this.props.onClose();
  }
}

export namespace ExecView {
  export type Props = {
    api: ReturnType<typeof kubeApi>;
    pod: V1Pod;
    containerName: string;
    onClose: () => void;
  };
}

export default withStyles(S)(ExecView);
