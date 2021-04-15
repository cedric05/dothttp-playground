import * as monaco from 'monaco-editor';
import * as monacoEditor from 'monaco-editor';
import React, { useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Button, Dropdown, DropdownButton, Nav, NavDropdown, NavItem } from 'react-bootstrap';
import * as dothttp from '../lang/dothttp';
import { KIND } from '../utils/utils';
import templates from './templates'
import { eventInstance, executeCode, targetCode } from './worker.client';


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


export const DothttpEditor: React.FC = () => {

	const dothttpEditor = useRef<HTMLDivElement>(null);
	const jsonEditorOptions: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
		scrollBeyondLastLine: false,
		automaticLayout: true,
		theme: "vs-dark",
		minimap: {
			enabled: false,
		},
	};


	let dothttpCodeEditor: monaco.editor.IStandaloneCodeEditor;
	useEffect(() => {
		if (dothttpEditor.current) {
			dothttpCodeEditor = monaco.editor.create(dothttpEditor.current, {
				value: `@name('getrequeset')
GET https://httpbin.org/get
json({
	"hai": "hai2"
})
`,
				language: 'dothttp',
				...jsonEditorOptions
			});
		}
		return () => {
			dothttpCodeEditor.dispose();
		};
	}, []);


	const jsonEditor = useRef<HTMLDivElement>(null);

	let jsonCodeEditor: monaco.editor.IStandaloneCodeEditor;
	let status: number;
	useEffect(() => {
		if (jsonEditor.current) {
			jsonCodeEditor = monaco.editor.create(jsonEditor.current, {
				value: `{}`,
				language: 'json',
				readOnly: true,
				...jsonEditorOptions,
			}
			,);
		}
		return () => {
			jsonCodeEditor.dispose();
		};
	}, []);

	function invokeExecute() {
		console.log(templates);
		executeCode(dothttpCodeEditor.getModel().getValue());
		jsonCodeEditor.getModel().setValue('{"execution": "started"}')
		eventInstance.addEventListener(KIND.EXECUTE, (event) => {
			jsonCodeEditor.getModel().setValue(event.data.results.content)
			status = event.data.results.status;
			monaco.editor.setModelLanguage(jsonCodeEditor.getModel(), event.data.results.lang || 'text');
		})

	}
	function updateTemplate(event) {
		dothttpCodeEditor.getModel().setValue(event.target.attributes['value'].value);
	}

	function getOptions() {
		const newLocal = templates.map(aOption => <option key={aOption.name} value={aOption.template}>{aOption.name}</option>);
		return newLocal;
	}
	let statusColour = "outline-dark";
	function changeStatus() {
		if (status <= 200 || status >= 299) {
			return statusColour = "outline-success"
		} else if (status <= 300 || status >= 399) {
			return statusColour = "outline-secondary"
		} else if (status <= 400 || status >= 499) {
			return statusColour = "outline-warning"
		} else {
			return statusColour = "outline-danger"
		}
	}

	return <div>
		<Nav>
			<NavDropdown id="dropdown-item-button" title="Try Requests here">
				{templates.map(aOption => (
					<NavDropdown.Item onClick={updateTemplate} key={aOption.name} value={aOption.template} >{aOption.name}</NavDropdown.Item>
				))}
			</NavDropdown>

			<Button variant="primary" size="sm" onClick={invokeExecute}>Send</Button>{' '}
			<Button className="ml-auto" size="sm" variant={statusColour} disabled>Status:</Button>{' '}
			{/* <Button variant="outline-primary" disabled>Time: ms</Button>{' '} */}
		</Nav>
		{/* Original don't change */}
		<div className="playground-container">
			<div className="playground-editorpane">
				<div className="Editor" ref={dothttpEditor}></div>
			</div>
			<div className="playground-editorpane">
				<div className="Editor" ref={jsonEditor}></div>
			</div>
		</div>
	</div>
};
// Original