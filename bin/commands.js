#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
const path_1 = require("path");
const configPath = (0, path_1.join)((0, path_1.dirname)(__filename), "../lib/config.json");
const log = console.log;
var Commands;
(function (Commands) {
    Commands.exportApp = () => {
        console.log("Exporting the app here!");
    };
})(Commands = exports.Commands || (exports.Commands = {}));
