#! /usr/bin / env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const commands_1 = require("./commands");
const command = process.argv[2];
switch (command) {
    case 'root':
        commands_1.Commands.root();
        break;
    case 'source':
        commands_1.Commands.source();
        break;
    case 'run':
        commands_1.Commands.run();
        break;
    case 'config':
        commands_1.Commands.config();
        break;
    case 'uninstall':
        commands_1.Commands.uninstallEnv();
        break;
    case 'switch':
        commands_1.Commands.switchEnv();
        break;
    case 'install':
        commands_1.Commands.installEnv();
        break;
    case 'delete':
        commands_1.Commands.deleteEnv();
        break;
    case "reset":
        commands_1.Commands.reset();
        break;
    default:
        console.log(chalk_1.default.underline.cyan(`\nReact-Env: Creating Multiple React Environments\n\n`) +
            chalk_1.default.cyan(`Try one of the following commands:\n` +
                chalk_1.default.green(`root`) + `: sets current environment root \n` +
                chalk_1.default.green(`run`) + `: runs the current src directory \n` +
                chalk_1.default.green(`config [-envs]`) + ` : prints out the current environment config \n` +
                chalk_1.default.green(`install [-dev] [packages]`) + `: installs packages to current environment \n` +
                chalk_1.default.green(`uninstall [-all] [packages]`) + `: uninstalls packages in current environment \n` +
                chalk_1.default.green(`delete [envs]`) + `: delete an environment \n`));
        break;
}
