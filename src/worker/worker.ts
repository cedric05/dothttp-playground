// @ts-ignore
self.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.18.0/full/';
importScripts('https://cdn.jsdelivr.net/pyodide/v0.18.0/full/pyodide.js');
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

def main(content, target):
    content = base64.b64decode(content).decode('utf-8')
    out = content_override(
        Config(target=target, no_cookie=True, property_file=None, experimental=False, format=False,
            stdout=False, debug=False, info=False, curl=False, env=[], file="", properties=[]),
        env={},
        content=content,
    )
    out.load()
    out.load_def()
    print(out.httpdef)
    headers = {}
    for header in out.httpdef.headers:
        headers[header] = out.httpdef.headers[header]
    out.httpdef.headers = headers
    return out.httpdef
def getTargets(content):
    content = base64.b64decode(content).decode('utf-8')
    print(content)
    out = content_override(
        Config(target="1", no_cookie=True, property_file=None, experimental=False, format=False,
            stdout=False, debug=False, info=False, curl=False, env=[], file="", properties=[]),
        env={},
        content=content,
    )
    out.load_model()
    all_names = []
    all_urls = []
    for index, http in enumerate(out.model.allhttps):
        if http.namewrap:
            name = http.namewrap.name if http.namewrap else str(index)
            start = http.namewrap._tx_position
            end = http._tx_position_end
        else:
            start = http.urlwrap._tx_position
            end = http._tx_position_end
            name = str(index + 1)
        name = {
            'name': name,
            'method': http.urlwrap.method,
            'start': start,
            'end': end
        }
        url = {
            'url': http.urlwrap.url,
            'method': http.urlwrap.method or 'GET',
            'start': http.urlwrap._tx_position,
            'end': http.urlwrap._tx_position_end,
        }
        all_names.append(name)
        all_urls.append(url)
    data = {"all_urls": all_urls, "all_names": all_names }
    return json.dumps(data)
globals()['main']=  main
globals()['targets'] = getTargets`

async function loadPyodideAndPackages() {
    // @ts-ignore
    await languagePluginLoader;
    // @ts-ignore
    await self.pyodide.loadPackage(['micropip']);
    // @ts-ignore
    await self.pyodide.runPython(`import micropip;micropip.install(['dothttp-req-wasm==0.0.42a10', 'setuptools'])`);
    // @ts-ignore
    await self.pyodide.runPython(loadCode);
    self.postMessage(
        { key: KIND.LOADED }
    );
}
let pyodideReadyPromise = loadPyodideAndPackages();


async function executeAndUdate(code: string, target: string): Promise<{ content: string; lang: string; status: number }> {
    const pycode = `main("${btoa(code)}", "${target}")`
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



function getTargets(code: string): Array<String> {
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
    const { key, code, uniqKey, ...context } = event.data;
    console.log(key, code, context)
    let results: any;
    try {
        if (key === KIND.EXECUTE) {
            results = await executeAndUdate(code, event.data.target);
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
        { results: results, key: key, uniqKey: uniqKey }
    );

}

