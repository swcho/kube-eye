
import { editor } from 'monaco-editor';
import * as React from 'react';

export class YamlEditor extends React.Component<YamlEditor.Props> {

  private elEditor: HTMLDivElement | undefined | null;

  editor: editor.IStandaloneCodeEditor | undefined;
  constructor(props: YamlEditor.Props) {
    super(props);
    this.state = {
      branch: null,
      notFound: false,
      nccYaml: null,
    };
  }
  render() {
    return (
      <div ref={(el) => this.elEditor = el} className={this.props.className}/>
    );
  }
  private async setUpEditor() {
    if (this.elEditor) {
      const monaco = await import('monaco-editor');
      this.editor = monaco.editor.create(this.elEditor, {
        language: 'yaml',
      });
      const {
        value,
      } = this.props;
      if (value) {
        this.editor.setValue(value);
      }
    }
  }

  componentDidMount() {
    this.setUpEditor();
  }

  componentWillReceiveProps(nextProps: YamlEditor.Props) {
    const {
      value,
    } = nextProps;
    if (this.editor && value && this.props.value !== value) {
      this.editor.setValue(value);
    }
  }
}

export namespace YamlEditor {
  export type Props = {
    className?: string;
    value: string;
    onChange: (value: string) => void;
  };
}
