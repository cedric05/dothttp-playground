// <script type="text/javascript" src="https://cdn.jsdelivr.net/pyodide/v0.16.1/full/pyodide.js"></script>
// <script type="text/javascript">
//     pythonCode =

//         `def haha(*args, **kwargs):
// from dothttp import Config, HttpDefBase
// class content_override(HttpDefBase):
//     def __init__(self, config: Config, **kwargs):
//         self.extra_kwargs = kwargs
//         super().__init__(config)

//     def load_content(self):
//         self.original_content = self.content = self.extra_kwargs['content']

//     def load_properties_n_headers(self):
//         self.property_util.add_env_property_from_dict(env=self.extra_kwargs.get("env", {}))

//     def load_command_line_props(self):
//         for key, value in self.extra_kwargs.get("properties", {}).items():
//             self.property_util.add_command_property(key, value)

// def main(content):
//     out = content_override(
//         Config(target="1", no_cookie=True, property_file=None, experimental=False, format=False,
//             stdout=False, debug=False, info=False, curl=False, env=["hai"], file="", properties=[]),
//         env={"test": "google.com", },
//         content=content,
//     )
//     out.load()
//     out.load_def()
//     print(out.httpdef)
//     return out.httpdef
// globals()['main']=  main
// import micropip
// micropip.install(['textx', 'dothttp-req-wasm']).then(haha)
//         `
//     languagePluginLoader.then(() => {
//         return pyodide.loadPackage(['micropip'])
//     }).then(() => {
//         pyodide.runPython(pythonCode);
//     })

// </script>
// <script type="text/javascript">
// // set the Pyodide files URL (packages.json, pyodide.asm.data etc)
// window.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.16.1/full/';
// </script>