
import { IToaster, Position, Toaster } from '@blueprintjs/core';
import copy from 'copy-to-clipboard';

let toaster: IToaster;

function appToaster() {
  if (!toaster) {
    toaster = Toaster.create({
      position: Position.TOP,
    });
  }
  return toaster;
}

export function copyToClipboard(text: string) {
  copy(text);
  appToaster().show({ message: 'Copied!'});
}
