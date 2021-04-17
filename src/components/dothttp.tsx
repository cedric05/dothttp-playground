import 'bootstrap/dist/css/bootstrap.css';
import * as monaco from 'monaco-editor';
import React from 'react';
import { Button, Nav, NavDropdown } from 'react-bootstrap';
import MonacoEditor from 'react-monaco-editor';
import * as dothttp from '../lang/dothttp';
import { KIND } from '../utils/utils';
import templates from './templates';
import { eventInstance, executeCode } from './worker.client';


monaco.languages.register({ id: 'dothttp' })
monaco.languages.setMonarchTokensProvider('dothttp', dothttp.language)
monaco.languages.setLanguageConfiguration('dothttp', dothttp.conf)


// @ts-ignore
self.MonacoEnvironment = {
	getWorkerUrl: function (_moduleId: any, label: string) {
		if (label === 'json') {
			return './json.worker.bundle.js';
		}
		return './editor.worker.bundle.js';
	}
};


type state = {
	status: number;
	statusColor: string;
	jsonEditorData: string;
	dothttpEditorData: string;
};

export class DothttpEditor extends React.Component<{}, state> {
	dothttpCodeEditor: monaco.editor.IStandaloneCodeEditor;
	jsonCodeEditor: monaco.editor.IStandaloneCodeEditor;
	constructor(props) {
		super(props);
		this.state = {
			status: 200,
			statusColor: "outline-success",
			jsonEditorData: "{}",
			dothttpEditorData: templates[0].template,
		};
	}

	dothttpWillMount(editor) {
		this.dothttpCodeEditor = editor;
		const elementRef = this;
		eventInstance.addEventListener(KIND.EXECUTE, (event) => {
			elementRef.setState({ jsonEditorData: event.data.results.content, status: event.data.results.status })
			monaco.editor.setModelLanguage(elementRef.jsonCodeEditor.getModel(), event.data.results.lang || 'text');
			elementRef.changeStatus();
		})
	}

	jsonWillMount(editor) {
		this.jsonCodeEditor = editor;
	}

	render() {

		const baseEditorOptions = {
			scrollBeyondLastLine: false,
			automaticLayout: true,
			theme: "vs-dark",
			minimap: {
				enabled: false,
			},
		}
		return <div className="parentdev">
			<Nav>
				<NavDropdown id="dropdown-item-button" title="Try Requests here">
					{templates.map(aOption => (
						<NavDropdown.Item onClick={this.updateTemplate.bind(this)} key={aOption.name} value={aOption.template} >{aOption.name}</NavDropdown.Item>
					))}
				</NavDropdown>

				<Button variant="primary" size="sm" onClick={this.invokeExecute.bind(this)}>Send</Button>{' '}
				<Button className="ml-auto" size="sm" variant={this.state.statusColor} disabled>
					Status:{this.state.status}
				</Button>
				{' '}
			</Nav>


			<div className="playground-container">
				<div className="playground-editorpane">
					<MonacoEditor
						ref="dothttpEditor"
						language="dothttp"
						editorDidMount={this.dothttpWillMount.bind(this)}
						className="Editor" theme="vs-dark"
						options={baseEditorOptions}
						value={this.state.dothttpEditorData}>
					</MonacoEditor>
				</div>
				<div className="playground-editorpane">
					<MonacoEditor
						ref="jsonEditor"
						value={this.state.jsonEditorData}
						language="json" className="Editor"
						editorDidMount={this.jsonWillMount.bind(this)}
						defaultValue="{ }"
						theme="vs-dark"
						options={{ ...baseEditorOptions, readOnly: false }} >

					</MonacoEditor>
				</div>
			</div>
		</div >
	}


	updateTemplate(event) {
		this.dothttpCodeEditor.getModel().setValue(event.target.attributes['value'].value);
	}


	getOptions() {
		const newLocal = templates.map(aOption => <option key={aOption.name} value={aOption.template}>{aOption.name}</option>);
		return newLocal;
	}


	invokeExecute() {
		executeCode(this.dothttpCodeEditor.getModel().getValue());
		this.jsonCodeEditor.getModel().setValue('{"execution": "started"}')
	}


	private changeStatus() {
		let statusColor: string;
		const { status } = this.state;
		if (status <= 200 || status >= 299) {
			statusColor = "outline-success";
		} else if (status <= 300 || status >= 399) {
			statusColor = "outline-secondary";
		} else if (status <= 400 || status >= 499) {
			statusColor = "outline-warning";
		} else {
			statusColor = "outline-danger";
		}
		this.setState({ statusColor: statusColor });
	}
}