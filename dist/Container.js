"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const events_1 = require("events");
const ComponentWrapper_1 = __importDefault(require("./ComponentWrapper"));
const Status_1 = require("./Status");
const debug_1 = __importDefault(require("debug"));
module.exports = class Container extends events_1.EventEmitter {
    constructor({ debugTag = "container", noColors = false } = {}) {
        super();
        this.debug = debug_1.default(debugTag);
        this.noColors = noColors;
        this.wrappers = new Map();
    }
    static get STATUS() {
        return Status_1.STATUS;
    }
    static get STATUS_NAMES() {
        return Status_1.STATUS_NAMES;
    }
    static get STATUS_COLORS() {
        return Status_1.STATUS_COLORS;
    }
    static addStatus(name, value, color) {
        Status_1.STATUS[name.toUpperCase()] = value;
        Status_1.STATUS_NAMES[value] = name.toLowerCase();
        Status_1.STATUS_COLORS[value] = color;
    }
    register(componentConfig, options = {}) {
        const wrapper = new ComponentWrapper_1.default(this, componentConfig, options);
        this.wrappers.set(wrapper.name, wrapper);
        this.on(`${wrapper.name}.statusChange`, (err, status, name) => {
            this.debug(`${`${name} `.padEnd(20, "-")}> ${!this.noColors ? Status_1.STATUS_COLORS[status] : ""}${Status_1.STATUS_NAMES[status]}${!this.noColors ? "\x1b[0m" : ""}`);
            if (err) {
                this.debug(err.stack);
            }
        });
        return this;
    }
    get(name, newInstance = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!name) {
                throw new Error("Missing name argument in component.get function");
            }
            const componentWrapper = this.wrappers.get(name);
            if (!componentWrapper) {
                throw new Error(`Missing ${name} component wrapper`);
            }
            return yield componentWrapper.getComponent(newInstance);
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const wrapperNames = Array.from(this.wrappers.keys());
            for (let i = 0; i < wrapperNames.length; i++) {
                yield this.get(wrapperNames[i]);
            }
            return this;
        });
    }
    getStatus(name = null) {
        const componentWrappers = [];
        if (name) {
            const wrapper = this.wrappers.get(name);
            if (!wrapper) {
                throw new Error(`missing ${name} component wrapper`);
            }
            componentWrappers.push(wrapper);
        }
        else {
            componentWrappers.push(...this.wrappers.values());
        }
        return componentWrappers.reduce((acc, { err, status, name }) => {
            if (acc.serving && status === Status_1.STATUS.STOPPED) {
                acc.serving = false;
            }
            acc.components.push({
                name,
                status,
                err
            });
            return acc;
        }, {
            serving: true,
            components: []
        });
    }
    checkStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(Array.from(this.wrappers.values()).map(wrapper => wrapper.checkStatus()));
            return this.getStatus();
        });
    }
};
