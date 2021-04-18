import 'bootstrap/dist/css/bootstrap.css';
import * as monaco from 'monaco-editor';
import React from 'react';
import { Button, Nav, NavDropdown, Navbar, Container, Row, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import MonacoEditor from 'react-monaco-editor';
import * as dothttp from '../lang/dothttp';
import { copyShareLinkToClipboard, handleShareLink } from '../utils/pako-utils';
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
	step_loading: boolean;
};

export class DothttpEditor extends React.Component<{}, state> {
	dothttpCodeEditor: monaco.editor.IStandaloneCodeEditor;
	jsonCodeEditor: monaco.editor.IStandaloneCodeEditor;
	constructor(props) {
		super(props);
		const content = handleShareLink() || templates[0].template as string;
		this.state = {
			loading: false,
			status: "N/A",
			statusColor: "success",
			jsonEditorData: "{}",
			dothttpEditorData: content,
			step_loading: true,
		};
		eventInstance.addEventListener(KIND.LOADED, () => {
			this.setState({ loading: false, step_loading: false });
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

	createTooltip(text: string) {
		return <Tooltip id="button-tooltip">
			{text}
		</Tooltip>
	}

	handlCopyClick() {
		copyShareLinkToClipboard(this.dothttpCodeEditor.getModel().getValue());
	}

	getOverlayTrigger(buttonText: string, url: string, tooltip: string, variant: string = "outline-info") {
		return <OverlayTrigger placement="bottom" overlay={this.createTooltip(tooltip)}>
			<Button size="sm" variant={variant} className="mr-2" onClick={() => { window.open(url, '_blank') }}>{buttonText}</Button>
		</OverlayTrigger>
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

					<NavDropdown className="ml-5" id="dropdown-item-button" title="Select Template">
						{templates.map(aOption => (
							<NavDropdown.Item onClick={this.updateTemplate.bind(this)} key={aOption.name} value={aOption.template} >{aOption.name}</NavDropdown.Item>
						))}
					</NavDropdown>

					{' '}

					{this.state.step_loading ?
						<Spinner className="ml-5" animation="border" /> :
						<Button className="ml-5" variant="primary mr-1" size="sm" onClick={this.invokeExecute.bind(this)}>RUN</Button>
					}
				</Nav>

				<div className="ml-auto" >

					<Button className="mr-5" size="sm" variant={this.state.statusColor} >
						Status:{this.state.status}
					</Button>


					<OverlayTrigger placement="bottom" overlay={this.createTooltip("Copy a shareable link to clipboard")}>
						<Button size="sm" variant="info" className="mr-2" onClick={this.handlCopyClick.bind(this)}>Copy Link</Button>
					</OverlayTrigger>

					{this.getOverlayTrigger("Docs", "https://docs.dothttp.dev/docs/features", "Learn dothttp")}
					{this.getOverlayTrigger("Vscode extension", "https://marketplace.visualstudio.com/items?itemName=ShivaPrasanth.dothttp-code", "Install vscode extension")}
					{this.getOverlayTrigger("Github", "https://github.com/cedric05/dothttp", "Support us by starring github repository")}

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