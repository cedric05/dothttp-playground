import React from 'react';
import { DothttpEditor } from './dothttp';
import './playground.css';


export const Playground: React.FC = () => {
    return <div className="matchparent">

        <DothttpEditor
        // onBicepChange={setBicepContent} onJsonChange={setJsonContent} initialCode={initialContent} 
        />
    </div>
};