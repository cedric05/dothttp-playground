// @ts-ignore
self.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.16.1/full/';
importScripts('https://cdn.jsdelivr.net/pyodide/v0.16.1/full/pyodide.js');
import { getContent, formatJson, KIND } from "../utils/utils";

const loadCode = `from dothttp import Config, HttpDefBase
import json
import base64

class content_override(HttpDefBase):
    def __init__(self, config: Config, **kwargs):
        self.extra_kwargs = kwargs
        super().__init__(config)

    def load_content(self):
        self.original_content = self.content = self.extra_kwargs['content']

    def load_properties_n_headers(self):
        self.property_util.add_env_property_from_dict(env=self.extra_kwargs.get("env", {}))

    def load_command_line_props(self):
        for key, value in self.extra_kwargs.get("properties", {}).items():
            self.property_util.add_command_property(key, value)

def main(content):
    content = base64.b64decode(content).decode('utf-8')
    out = content_override(
        Config(target="1", no_cookie=True, property_file=None, experimental=False, format=False,
            stdout=False, debug=False, info=False, curl=False, env=[], file="", properties=[]),
        env={},
        content=content,
    )
    out.load()
    out.load_def()
    print(out.httpdef)
    return out.httpdef
def getTargets(content):
    content = base64.b64decode(content).decode('utf-8')
    out = content_override(
        Config(target="1", no_cookie=True, property_file=None, experimental=False, format=False,
            stdout=False, debug=False, info=False, curl=False, env=[], file="", properties=[]),
        env={},
        content=content,
    )
    out.load()
    out.load_def()
    return [i.namewrap.name for i in out.model.allhttps]
globals()['main']=  main
globals()['targets'] = getTargets`

async function loadPyodideAndPackages() {
    // @ts-ignore
    await languagePluginLoader;
    // @ts-ignore
    await self.pyodide.loadPackage(['micropip']);
    // @ts-ignore
    await self.pyodide.runPython(`import micropip;micropip.install(['textx', 'dothttp-req-wasm'])`);
    // @ts-ignore
    await self.pyodide.runPython(loadCode);
    self.postMessage(
        { key: KIND.LOADED }
    );
}
let pyodideReadyPromise = loadPyodideAndPackages();


async function executeAndUdate(code: string): Promise<{ content: string; lang: string; status: number }> {
    const pycode = `main("${btoa(code)}")`
    let lang: string;
    let content: string;
    let status: number;
    console.log("pycode", pycode);
    // @ts-ignore
    const out = (self.pyodide).runPython(pycode);
    lang = "json";
    try {
        const resp = await getContent(out);
        const contentType = resp.headers['content-type'];
        if (contentType === "application/json") {
        } else {
            lang = "text"
        }
        status = resp.status;
        content = resp.data;
    } catch (error) {
        content = formatJson(error);
        status = 500;
    }
    return { content, lang, status };
}



async function getTargets(code: string): Promise<string[]> {
    const pycode = `targets("${btoa(code)}")`
    try {
        //@ts-ignore
        const out = (self.pyodide).runPython(pycode);
        return out;
    } catch (ignored) {
    }
    return [];
}


self.onmessage = async (event) => {
    await pyodideReadyPromise;
    const { key, code, ...context } = event.data;
    console.log(key, code, context)
    let results: any;
    try {
        if (key === KIND.EXECUTE) {
            results = await executeAndUdate(code);
        }
        else if (key === KIND.TARGETS) {
            results = await getTargets(code);
        } else {
            results = { error: true, error_message: "key not supported" };
        }
    }
    catch (error) {
        results = { error: true, error_message: "execution error happened", };
    }
    self.postMessage(
        { results: results, key: key }
    );

}

