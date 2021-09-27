import { Range } from 'monaco-editor';
import { CancellationToken, editor, IEvent, languages } from 'monaco-editor-core';
import { getTargets } from '../components/worker.client';

export class DothttpLensProvider implements languages.CodeLensProvider {


    onDidChange?: IEvent<this>;
    async provideCodeLenses(model: editor.ITextModel, token: CancellationToken): Promise<languages.CodeLensList> {
        const { results, text } = await this.getTargetsAndErrors(model);
        if (results.all_names) {
            const names = results.all_names
            const lenses = names.map(element => {
                const startPosition = model.getPositionAt(element.start);
                const endPosition = model.getPositionAt(element.end);
                const range = new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
                return {
                    range: range,
                    command: {
                        id: "dothttp.run.command",
                        title: "execute",
                        tooltip: "execute",
                        "arguments": [text, element.name],
                    }

                } as languages.CodeLens;
            });
            return { lenses: lenses, dispose: function () { } };
        }
        return null;
    }

    private async getTargetsAndErrors(model: editor.ITextModel) {
        const text = model.getValue();
        const out = await getTargets(text);
        const results = JSON.parse(out.data.results);
        return { results, text };
    }
}