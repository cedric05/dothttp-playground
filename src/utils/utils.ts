import axios, { AxiosRequestConfig, Method } from "axios";
import * as jsonparser from 'jsonc-parser';

const axiosInstance = axios.create({
    timeout: 15000,
});
interface toJs<obj> {
    toJs(): obj
}

function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }
    return obj;
}


type ParsedRequest = {
    url: string;
    method?: Method;
    headers?: toJs<Map<string, string>>;
    query?: toJs<Map<string, Array<string>>>;
    auth?: toJs<{ username: string, password: string }>;
    payload?: {
        data?: string | toJs<Map<string, any>>;
        json?: toJs<Map<string, any>>;
        files?: toJs<Array<[string, Array<string>]>>;
        header?: string;
    };
};
function toAxisRequest(obj: ParsedRequest): AxiosRequestConfig {
    let data: {};
    let contentType = null;
    if (obj.payload) {
        const payload = obj.payload;
        if (payload.data) {
            data = payload.data;
            if (typeof obj.payload.data === "string") {
                data = payload.data;
                contentType = "text/plain";
            } else {
                data = strMapToObj((payload.data as toJs<Map<any, any>>).toJs());
                contentType = "application/x-www-form-urlencoded";
            }
            if (!payload.header) {
                contentType = payload.header;
            }
        } else if (payload.json) {
            data = strMapToObj(payload.json.toJs());
            contentType = "application/json";
        } else if (payload.files) {
            const files = payload.files.toJs()
            const form = new FormData();
            files.forEach(arr => {
                // content-type currently ignored
                const key = arr[0];
                const value = arr[1][1];
                form.append(key, value);
            });
            contentType = "multipart/form-data";
            data = form;
        }
    }
    // its string to string
    // so object.entries works
    let headers = strMapToObj((obj.headers.toJs()));
    if (contentType) {
        headers['content-type'] = contentType;
    }
    let auth = null;
    if (obj.auth) {
        const { username, password } = obj.auth.toJs();
        auth = {
            username, password
        };
    }
    const _query = obj.query.toJs()
    const query = new URLSearchParams();
    for (const [key, value] of _query) {
        for (const val of value) {
            query.append(key, val);
        }
    }

    return {
        withCredentials: false,
        transformResponse: [],
        url: obj.url,
        params: query,
        headers: headers,
        method: obj.method,
        data: data,
        auth: auth
    };
}
export async function getContent(obj: ParsedRequest) {
    const content = await axiosInstance.request(toAxisRequest(obj));
    // const finalContent = formatJson(content.data);
    return content;
}
export function formatJson(jsonObj: {}) {
    const data = JSON.stringify(jsonObj);
    const formattedObj = jsonparser.format(data, undefined, {
        insertFinalNewline: true,
        insertSpaces: false,
        tabSize: 4
    });
    const finalContent = jsonparser.applyEdits(data, formattedObj);
    return finalContent;
}


export enum KIND {
    EXECUTE = 'execute',
    TARGETS = 'target',
    LOADED = "LOADED"
}