import { CancellationToken, editor, IEvent, languages } from 'monaco-editor-core';

export class DothttpLensProvider implements languages.CodeLensProvider {
    onDidChange?: IEvent<this>;
    provideCodeLenses(model: editor.ITextModel, token: CancellationToken): languages.ProviderResult<languages.CodeLensList> {
        throw new Error('Method not implemented.');
    }
    resolveCodeLens?(model: editor.ITextModel, cowwdeLens: languages.CodeLens, token: CancellationToken): languages.ProviderResult<languages.CodeLens> {
        throw new Error('Method not implemented.');
    }
}
export class DothttpSymbolProvider implements languages.DocumentSymbolProvider {
    displayName?: string;
    provideDocumentSymbols(model: editor.ITextModel, token: CancellationToken): languages.ProviderResult<languages.DocumentSymbol[]> {
        throw new Error('Method not implemented.');
    }
}
