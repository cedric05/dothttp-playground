import axios, { AxiosRequestConfig, Method } from 'axios';
import * as jsonparser from 'jsonc-parser';
import * as monaco from 'monaco-editor';
import * as monacoEditor from 'monaco-editor';
import React, { useEffect, useRef } from 'react';
import * as dothttp from '../lang/dothttp';


const axiosInstance = axios.create({
	timeout: 15000,
});

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


type ParsedRequest = {
	url: string;
	method?: Method;
	headers?: {
		[key: string]: string;
	};
	query?: {
		[key: string]: Array<string>;
	},
	auth?: Array<string>[2];
	payload?: {
		data?: string | {},
		json?: {},
		files?: Array<[string, Array<string>]>,
		header?: string
	}
};

function toAxisRequest(obj: ParsedRequest): AxiosRequestConfig {
	let data: {};
	let contentType = null;
	if (obj.payload) {
		if (obj.payload.data) {
			data = obj.payload.data;
			if (!obj.payload.header) {
				if (typeof obj.payload.data === "string") {
					contentType = "text/plain";
				} else {
					contentType = "application/x-www-form-urlencoded";
				}
			}
		} else if (obj.payload.json) {
			data = obj.payload.json;
			contentType = "application/json";
		} else if (obj.payload.files) {
			const form = new FormData();
			obj.payload.files.forEach(arr => {
				const key = arr[0];
				const value = arr[1][1];
				form.append(key, value);
			})
			contentType = "multipart/form-data";
			data = form;
		}
	}
	let headers = obj.headers || {};
	if (contentType) {
		headers['content-type'] = contentType;
	}
	let auth = null;
	if (obj.auth) {
		const [username, password] = obj.auth;
		auth = {
			username, password
		}
	}

	return {
		withCredentials: false,
		transformResponse: [],
		url: obj.url,
		params: obj.query,
		headers: headers,
		method: obj.method,
		data: data,
		auth: auth
	};
}

async function getContent(obj: ParsedRequest) {
	const content = await axiosInstance.request(toAxisRequest(obj));
	// const finalContent = formatJson(content.data);
	return content;
}

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
			dothttpCodeEditor.onDidChangeModelContent(getTargets);
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


	async function getTargets() {
		const code = dothttpCodeEditor.getModel()?.getValue();
		const pycode = `targets("""${code}""")`
		//@ts-ignore
		const out = (window.pyodide).runPython(pycode);
		console.log(out);
		return out;
	}

	async function executeAndUdate() {
		jsonCodeEditor.getModel().setValue('{"started execution": true}');
		const code = dothttpCodeEditor.getModel()?.getValue();
		const pycode = `main("""${code}""")`
		//@ts-ignore
		const out = (window.pyodide).runPython(pycode);

		console.log("method is ", out.method);
		console.log("url is ", out.url);
		console.log('headers are ', out.headers);
		console.log('urlparams are ', out.query);
		console.log("data is ", out.payload);
		console.log(out);
		let content: string = '{"error": true}';
		try {
			const resp = await getContent(out);
			const contentType = resp.headers['content-type'];
			if (contentType === "application/json"){
				monaco.editor.setModelLanguage(jsonCodeEditor.getModel(), "json");
			} else {
				monaco.editor.setModelLanguage(jsonCodeEditor.getModel(), "text");
			}
			content = resp.data;
		} catch (error) {
			content = formatJson(error);
		}
		return jsonCodeEditor.getModel().setValue(content);
	}
	return <div>
		<button onClick={executeAndUdate}> send</button>
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
function formatJson(jsonObj: {}) {
	const data = JSON.stringify(jsonObj);
	const formattedObj = jsonparser.format(data, undefined, {
		insertFinalNewline: true,
		insertSpaces: false,
		tabSize: 4
	});
	const finalContent = jsonparser.applyEdits(data, formattedObj);
	return finalContent;
}

