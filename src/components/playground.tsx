// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useRef, useState } from 'react';
import { Tooltip } from 'react-bootstrap';
import { DothttpEditor } from './dothttp';
import './playground.css';


export const Playground: React.FC = () => {
    const [jsonContent, setJsonContent] = useState('');
    const [bicepContent, setBicepContent] = useState('');
    const [initialContent, setInitialContent] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filterText, setFilterText] = useState('');
    const uploadInputRef = useRef<HTMLInputElement>();

    async function withLoader(action: () => Promise<void>) {
        try {
            setLoading(true);
            await action();
        } finally {
            setLoading(false);
        }
    }

    async function loadExample(filePath: string) {
        withLoader(async () => {
            const response = await fetch(`examples/${filePath}`);

            if (!response.ok) {
                throw response.text();
            }

            const bicepText = await response.text();
            setInitialContent(bicepText);
        });
    }


    const createTooltip = (text: string) => (
        <Tooltip id="button-tooltip">
            {text}
        </Tooltip>
    );

    return <div className="matchparent">

        <DothttpEditor
        // onBicepChange={setBicepContent} onJsonChange={setJsonContent} initialCode={initialContent} 
        />
    </div>
};