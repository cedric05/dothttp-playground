import 'bootstrap/dist/css/bootstrap.css';
import * as monaco from 'monaco-editor';
import React from 'react';
import { Button, Nav, NavDropdown, Navbar, Container, Row, Spinner } from 'react-bootstrap';
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
	status: string;
	statusColor: string;
	jsonEditorData: string;
	dothttpEditorData: string;
	loading: boolean;
};

export class DothttpEditor extends React.Component<{}, state> {
	dothttpCodeEditor: monaco.editor.IStandaloneCodeEditor;
	jsonCodeEditor: monaco.editor.IStandaloneCodeEditor;
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			status: "N/A",
			statusColor: "success",
			jsonEditorData: "{}",
			dothttpEditorData: templates[0].template,
		};
		eventInstance.addEventListener(KIND.LOADED, () => {
			this.setState({ loading: false });
		})

		eventInstance.addEventListener(KIND.EXECUTE, (event) => {
			let statusColor: string;
			this.setState({ loading: false });
			const status = (event.data.results.status as number);
			if (status <= 200 || status <= 299) {
				statusColor = "success";
			} else if (status <= 300 || status <= 399) {
				statusColor = "secondary";
			} else if (status <= 400 || status <= 499) {
				statusColor = "warning";
			} else {
				statusColor = "danger";
			}
			this.setState({
				jsonEditorData: event.data.results.content, status: status ? status.toString() : "Error (syntax)", loading: false, statusColor
			})
			// monaco.editor.setModelLanguage(this.jsonCodeEditor.getModel(), event.data.results.lang || 'text');
		})
	}

	dothttpWillMount(editor) {
		this.dothttpCodeEditor = editor;
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
			<Navbar bg="dark" variant="dark">
				<Nav >
					<Navbar.Brand>dotHttp playground</Navbar.Brand>

					<Button className="ml-5" variant="primary mr-1" size="sm" onClick={this.invokeExecute.bind(this)}>Send</Button>{' '}
					<NavDropdown className="ml-1" id="dropdown-item-button" title="Select Template">
						{templates.map(aOption => (
							<NavDropdown.Item onClick={this.updateTemplate.bind(this)} key={aOption.name} value={aOption.template} >{aOption.name}</NavDropdown.Item>
						))}
					</NavDropdown>

					{' '}
				</Nav>

				<div className="ml-auto" >

					<Button className="mr-5" size="sm" variant={this.state.statusColor} >
						Status:{this.state.status}
					</Button>

					<Button size="sm" className="mr-2" onClick={() => { window.open('https://marketplace.visualstudio.com/items?itemName=ShivaPrasanth.dothttp-code', '_blank') }}>
						vscode extension
						</Button>
					<Button size="sm" variant="info" className="mr-2" onClick={() => { window.open('https://github.com/cedric05/dothttp', '_blank') }}>
						Github Repo
						</Button>
				</div>
			</Navbar>

			<div className="playground-container">

				{this.state.loading ?
					<Container className="d-flex vh-100">
						<Row className="m-auto align-self-center">
							<Spinner animation="border" />
						</Row>
					</Container> :

					<div className="parentdev">
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
				}
			</div>
		</div >
	}


	updateTemplate(event) {
		this.setState({ dothttpEditorData: event.target.attributes['value'].value })
	}


	getOptions() {
		const newLocal = templates.map(aOption => <option key={aOption.name} value={aOption.template}>{aOption.name}</option>);
		return newLocal;
	}


	invokeExecute() {
		const code = this.dothttpCodeEditor.getModel().getValue();
		this.setState({ loading: true, dothttpEditorData: code });
		executeCode(code);
	}


}