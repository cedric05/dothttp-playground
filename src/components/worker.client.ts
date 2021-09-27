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

const callBackStore: { [key: string]: Function } = {

}

worker.onmessage = ((event: MessageEvent) => {
    if (event.data.key == KIND.EXECUTE) {
        eventInstance.executeResult(event.data)
    }
    else if (event.data.key == KIND.TARGETS) {
        if (event.data.uniqKey) {
            callBackStore[event.data.uniqKey](event);
            delete callBackStore[event.data.uniqKey];
        } else {
            eventInstance.targetResult(event.data)
        }
    }
    else if (event.data.key == KIND.LOADED) {
        eventInstance.loadComplete()
    }
})

function getRandNumber(min, max) {
    return Math.random() * (max - min) + min;
}


export async function getTargets(code: string) {
    return new Promise<MessageEvent>((resolve, _reject) => {
        const rand = KIND.TARGETS + getRandNumber(0, 1000);
        // this is not correct way to choose
        // for now we are proceeding
        worker.postMessage({ key: KIND.TARGETS, code: code, uniqKey: rand })
        callBackStore[rand] = resolve;
    })
}



export function executeCode(code: string, target: string = '1') {
    worker.postMessage({ key: KIND.EXECUTE, code: code, target: target });
}

export function targetCode(code: string) {
    worker.postMessage({ key: KIND.TARGETS, code: code });
}

export const eventInstance = new KindTargets()