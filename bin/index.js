#! /usr/bin / env node
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const commands_1 = require("./commands");
const command = process.argv[2];
switch (command) {
  case "export-app":
    commands_1.Commands.exportApp();
    break;
  default:
    console.log(
      chalk_1.default.underline.cyan(
        `\nReact-to-Component: Turn React Applications to components!\n\n`
      ) +
        chalk_1.default.cyan(
          `Try one of the following commands:\n` +
            chalk_1.default.green(`export`) +
            `: begins the export flow for your react app \n`
        )
    );
    break;
}
