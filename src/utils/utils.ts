import axios, { AxiosRequestConfig, Method } from "axios";
import * as jsonparser from 'jsonc-parser';

const axiosInstance = axios.create({
    timeout: 15000,
});
type ParsedRequest = {
    url: string;
    method?: Method;
    headers?: {
        [key: string]: string;
    };
    query?: {
        [key: string]: Array<string>;
    };
    auth?: Array<string>[2];
    payload?: {
        data?: string | {};
        json?: {};
        files?: Array<[string, Array<string>]>;
        header?: string;
    };
};
function toAxisRequest(obj: ParsedRequest): AxiosRequestConfig {
    let data: {};
    let contentType = null;
    if (obj.payload) {
        if (obj.payload.data) {
            data = obj.payload.data;
            if (!obj.payload.header) {
                if (typeof obj.payload.data === "string") {
                    contentType = "text/plain";
                } else {
                    contentType = "application/x-www-form-urlencoded";
                }
            } else {
                contentType = obj.payload.header;
            }
        } else if (obj.payload.json) {
            data = obj.payload.json;
            contentType = "application/json";
        } else if (obj.payload.files) {
            const form = new FormData();
            obj.payload.files.forEach(arr => {
                const key = arr[0];
                const value = arr[1][1];
                form.append(key, value);
            });
            contentType = "multipart/form-data";
            data = form;
        }
    }
    let headers = obj.headers || {};
    if (contentType) {
        headers['content-type'] = contentType;
    }
    let auth = null;
    if (obj.auth) {
        const [username, password] = obj.auth;
        auth = {
            username, password
        };
    }

    return {
        withCredentials: false,
        transformResponse: [],
        url: obj.url,
        params: obj.query,
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