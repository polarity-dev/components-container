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
Object.defineProperty(exports, "__esModule", { value: true });
const Status_1 = require("./Status");
const debug_1 = __importDefault(require("debug"));
class ComponentWrapper {
    constructor(container, { name, init, checkStatus, checkStatusInterval, debugTag }, options) {
        name = options.name || name;
        checkStatusInterval = options.checkStatusInterval || checkStatusInterval || 5 /*minutes*/ * 60000;
        if (!name || typeof name !== "string") {
            throw new Error("Missing name property in component configuration object");
        }
        if (!init || typeof init !== "function") {
            throw new Error(`Missing init function in ${name} component configuration object`);
        }
        debugTag = options.debugTag || debugTag;
        this.debug = debug_1.default(debugTag || name);
        this.container = container;
        this.init = init;
        this.name = name;
        this.status = Status_1.STATUS.UNINITIALIZED;
        this.component = null;
        this.err = null;
        this.options = options;
        if (checkStatus) {
            this.checkStatus = () => __awaiter(this, void 0, void 0, function* () {
                if (this.status !== Status_1.STATUS.UNINITIALIZED) {
                    return checkStatus(this.wrapperReferences);
                }
            });
            if (checkStatusInterval) {
                setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    return yield this.checkStatus(this.wrapperReferences)
                        .catch(this.debug);
                }), checkStatusInterval);
            }
        }
        else {
            this.checkStatus = () => __awaiter(this, void 0, void 0, function* () { });
        }
    }
    get wrapperReferences() {
        return {
            name: this.name,
            container: this.container,
            component: this.component,
            options: this.options,
            setStatus: (status, err = null) => this.setStatus(status, err),
            getStatus: () => this.getStatus(),
            debug: this.debug
        };
    }
    getStatus() {
        return {
            status: this.status,
            err: this.err
        };
    }
    setStatus(status, err = null) {
        if (this.status === status) {
            return;
        }
        this.status = status;
        this.err = err || null;
        [Status_1.STATUS_NAMES[status], "statusChange"].forEach(event => {
            this.container.emit(event, this.err, this.status, this.name);
            this.container.emit(`${this.name}.${event}`, this.err, this.status, this.name);
        });
    }
    getComponent(newInstance = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!newInstance && this.component) {
                return this.component;
            }
            else {
                this.setStatus(Status_1.STATUS.INITIALIZED);
                this.component = yield this.init(this.wrapperReferences);
                this.checkStatus();
                return this.component;
            }
        });
    }
}
exports.default = ComponentWrapper;
