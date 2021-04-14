import { KIND } from "../utils/utils";

const worker = new Worker('dothttp.worker.bundle.js');

class KindTargets extends EventTarget {
    targetResult(data: any) {
        const event = new Event(KIND.TARGETS, data);
        this.dispatchEvent(event);
    }
    executeResult(data: any) {
        const event = new Event(KIND.EXECUTE, data);
        // @ts-ignore
        event.data = data;
        this.dispatchEvent(event);
    }
}

worker.onmessage = ((event: MessageEvent) => {
    if (event.data.key == KIND.EXECUTE) {
        eventInstance.executeResult(event.data)
        return event.data;
    }
    else if (event.data.key == KIND.TARGETS) {
        eventInstance.targetResult(event.data)
        return event.data;
    }
})



export function executeCode(code: string) {
    worker.postMessage({ key: KIND.EXECUTE, code: code });
}

export function targetCode(code: string) {
    worker.postMessage({ key: KIND.TARGETS, code: code });
}

export const eventInstance = new KindTargets()