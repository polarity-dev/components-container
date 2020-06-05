/// <reference types="debug" />
/// <reference types="node" />
import { EventEmitter } from "events";
import ComponentWrapper, { ComponentConfig, Options } from "./ComponentWrapper";
export default class Container extends EventEmitter {
    debug: debug.Debugger;
    noColors: boolean;
    wrappers: Map<string, ComponentWrapper>;
    static get STATUS(): {
        [key: string]: number;
    };
    static get STATUS_NAMES(): {
        [key: number]: string;
    };
    static get STATUS_COLORS(): {
        [key: string]: string;
    };
    static addStatus(name: string, value: number, color: string): void;
    constructor({ debugTag, noColors }?: {
        debugTag?: string;
        noColors?: boolean;
    });
    register(componentConfig: ComponentConfig, options?: Options): this;
    get(name: string, newInstance?: boolean): Promise<any>;
    init(): Promise<this>;
    getStatus(name?: string | null): {
        serving: boolean;
        components: {
            name: string;
            status: number;
            err: Error | null;
        }[];
    };
    checkStatus(): Promise<{
        serving: boolean;
        components: {
            name: string;
            status: number;
            err: Error | null;
        }[];
    }>;
}
