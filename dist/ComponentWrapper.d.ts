/// <reference types="debug" />
import Container from './Container';
export declare type WrapperReferences = {
    name: string;
    container: Container;
    component: any;
    options: Options;
    setStatus: (status: number, err?: Error | null) => void;
    getStatus: () => {};
    debug: debug.Debugger;
};
export declare type ComponentConfig = {
    name: string;
    init: (wrapperReferences: WrapperReferences) => any;
    checkStatus?: (wrapperReferences?: WrapperReferences) => Promise<void>;
    checkStatusInterval?: number;
    debugTag?: string;
};
export declare type Options = {
    [key: string]: any;
};
export default class ComponentWrapper {
    debug: debug.Debugger;
    container: Container;
    component: any;
    name: ComponentConfig["name"];
    init: ComponentConfig["init"];
    checkStatus: ComponentConfig["checkStatus"];
    checkStatusInterval: ComponentConfig["checkStatusInterval"];
    debugTag: ComponentConfig["debugTag"];
    status: number;
    err: Error | null;
    options: Options;
    constructor(container: Container, { name, init, checkStatus, checkStatusInterval, debugTag }: ComponentConfig, options: Options);
    get wrapperReferences(): WrapperReferences;
    getStatus(): {
        status: number;
        err: Error | null;
    };
    setStatus(status: number, err?: Error | null): void;
    getComponent(newInstance?: boolean): Promise<any>;
}
