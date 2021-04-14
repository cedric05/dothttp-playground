import * as monaco from 'monaco-editor';
import * as monacoEditor from 'monaco-editor';
import React, { useEffect, useRef } from 'react';
import * as dothttp from '../lang/dothttp';
import { KIND } from '../utils/utils';
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
		if (label === 'css' || label === 'scss' || label === 'less') {
			return './css.worker.bundle.js';
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return './html.worker.bundle.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.bundle.js';
		}
		return './editor.worker.bundle.js';
	}
};


export const DothttpEditor: React.FC = () => {

	useEffect
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

	useEffect(() => {
		if (jsonEditor.current) {
			jsonCodeEditor = monaco.editor.create(jsonEditor.current, {
				value: `{}`,
				language: 'json',
				// readOnly: true,
				...jsonEditorOptions,
			}
			,);
		}
		return () => {
			jsonCodeEditor.dispose();
		};
	}, []);

	function invokeExecute() {
		executeCode(dothttpCodeEditor.getModel().getValue());
		jsonCodeEditor.getModel().setValue('{"execution": "started"}')
		eventInstance.addEventListener(KIND.EXECUTE, (event) => {
			jsonCodeEditor.getModel().setValue(event.data.results.content)
			monaco.editor.setModelLanguage(jsonCodeEditor.getModel(), event.data.results.lang || 'text');
		})

	}


	return <div>
		<button onClick={invokeExecute}> send</button>
		<select id="id">

		</select>
		<div className="playground-container">
			<div className="playground-editorpane">
				<div className="Editor" ref={dothttpEditor}></div>;
			</div>
			<div className="playground-editorpane">
				<div className="Editor" ref={jsonEditor}></div>;
			</div>
		</div>
	</div>
};
