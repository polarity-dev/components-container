/// <reference types="node" />
import { EventEmitter } from "events";
import ComponentWrapper, { ComponentConfig, Options } from "./ComponentWrapper";
declare const _default: {
    new ({ debugTag, noColors }?: {
        debugTag?: string | undefined;
        noColors?: boolean | undefined;
    }): {
        debug: debug.Debugger;
        noColors: boolean;
        wrappers: Map<string, ComponentWrapper>;
        register(componentConfig: ComponentConfig, options?: Options): any;
        get(name: string, newInstance?: boolean): Promise<any>;
        init(): Promise<any>;
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
        addListener(event: string | symbol, listener: (...args: any[]) => void): any;
        on(event: string | symbol, listener: (...args: any[]) => void): any;
        once(event: string | symbol, listener: (...args: any[]) => void): any;
        removeListener(event: string | symbol, listener: (...args: any[]) => void): any;
        off(event: string | symbol, listener: (...args: any[]) => void): any;
        removeAllListeners(event?: string | symbol | undefined): any;
        setMaxListeners(n: number): any;
        getMaxListeners(): number;
        listeners(event: string | symbol): Function[];
        rawListeners(event: string | symbol): Function[];
        emit(event: string | symbol, ...args: any[]): boolean;
        listenerCount(type: string | symbol): number;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): any;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): any;
        eventNames(): (string | symbol)[];
    };
    readonly STATUS: {
        [key: string]: number;
    };
    readonly STATUS_NAMES: {
        [key: number]: string;
    };
    readonly STATUS_COLORS: {
        [key: string]: string;
    };
    addStatus(name: string, value: number, color: string): void;
    listenerCount(emitter: EventEmitter, event: string | symbol): number;
    defaultMaxListeners: number;
    readonly errorMonitor: unique symbol;
};
export = _default;
