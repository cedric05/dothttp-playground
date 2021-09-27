import { KIND } from "../utils/utils";

const worker = new Worker('dothttp.worker.bundle.js');


class EventData extends Event {
    data: any
}

class KindTargets extends EventTarget {
    loadComplete() {
        const event = new EventData(KIND.LOADED);
        this.dispatchEvent(event);
    }
    targetResult(data: any) {
        const event = new EventData(KIND.TARGETS);
        event.data = data;
        this.dispatchEvent(event);
    }
    executeResult(data: any) {
        const event = new EventData(KIND.EXECUTE);
        // @ts-ignore
        event.data = data;
        this.dispatchEvent(event);
    }
}

worker.onmessage = ((event: MessageEvent) => {
    if (event.data.key == KIND.EXECUTE) {
        eventInstance.executeResult(event.data)
    }
    else if (event.data.key == KIND.TARGETS) {
        eventInstance.targetResult(event.data)
    }
    else if (event.data.key == KIND.LOADED) {
        eventInstance.loadComplete()
    }
})



export function executeCode(code: string) {
    worker.postMessage({ key: KIND.EXECUTE, code: code });
}

export function targetCode(code: string) {
    worker.postMessage({ key: KIND.TARGETS, code: code });
}

export const eventInstance = new KindTargets()