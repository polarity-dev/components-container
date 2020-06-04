"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_COLORS = exports.STATUS_NAMES = exports.STATUS = void 0;
exports.STATUS = {
    UNINITIALIZED: 0,
    INITIALIZED: 1,
    RUNNING: 2,
    STOPPED: 3
};
exports.STATUS_NAMES = {
    0: "uninitialized",
    1: "initialized",
    2: "running",
    3: "stopped"
};
exports.STATUS_COLORS = {
    [exports.STATUS.UNINITIALIZED]: "\x1b[37m",
    [exports.STATUS.INITIALIZED]: "\x1b[33m",
    [exports.STATUS.RUNNING]: "\x1b[32m",
    [exports.STATUS.STOPPED]: "\x1b[31m" //red
};
