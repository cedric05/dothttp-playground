import { Range } from 'monaco-editor';
import { CancellationToken, editor, IEvent, languages } from 'monaco-editor-core';
import { getTargets } from '../components/worker.client';

export class DothttpLensProvider implements languages.CodeLensProvider, languages.DocumentSymbolProvider {
    async provideDocumentSymbols(model: editor.ITextModel, token: CancellationToken): Promise<languages.DocumentSymbol[]> {
        const results = await this.getTargetsAndErrors(model);
        if (results.all_names) {
            const names = results.all_names;
            return names.map(element => {
                return {
                    name: element.name,
                    detail: element.name,
                    kind: languages.SymbolKind.Object,
                    tags: [],
                    range: DothttpLensProvider.getRange(model, element),
                }
            })
        }
        return []
    }


    onDidChange?: IEvent<this>;
    async provideCodeLenses(model: editor.ITextModel, token: CancellationToken): Promise<languages.CodeLensList> {
        const results = await this.getTargetsAndErrors(model);
        const text = model.getValue();
        if (results.all_names) {
            const names = results.all_names
            const lenses = names.map(element => {
                const range = DothttpLensProvider.getRange(model, element);
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


    private static getRange(model: editor.ITextModel, element: any) {
        const startPosition = model.getPositionAt(element.start);
        const endPosition = model.getPositionAt(element.end);
        const range = new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
        return range;
    }

    private async getTargetsAndErrors(model: editor.ITextModel) {
        const text = model.getValue();
        const out = await getTargets(text);
        try {
            const results = JSON.parse(out.data.results);
            return results;
        } catch (error) {
            return {}
        }
    }
}