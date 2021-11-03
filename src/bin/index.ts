#! /usr/bin / env node

import chalk from "chalk";
import { Commands } from './commands'

// Run all commands by here
const command = process.argv[2]
switch (command) {
    case 'root':
        Commands.root()
        break;
    case 'source':
        Commands.source()
        break
    case 'run':
        Commands.run()
        break;
    case 'config':
        Commands.config()
        break;
    case 'uninstall':
        Commands.uninstallEnv()
        break
    case 'switch':
        Commands.switchEnv()
        break;
    case 'install':
        Commands.installEnv()
        break;
    case 'delete':
        Commands.deleteEnv()
        break;
    case "reset":
        Commands.reset()
        break;
    default:
        console.log(
            chalk.underline.cyan(`\nReact-Env: Creating Multiple React Environments\n\n`) +
            chalk.cyan(
                `Try one of the following commands:\n` +
                chalk.green(`root`) + `: sets current environment root \n` +
                chalk.green(`run`) + `: runs the current src directory \n` +
                chalk.green(`config [-envs]`) + ` : prints out the current environment config \n` +
                chalk.green(`install [-dev] [packages]`) + `: installs packages to current environment \n` +
                chalk.green(`uninstall [-all] [packages]`) + `: uninstalls packages in current environment \n` +
                chalk.green(`delete [envs]`) + `: delete an environment \n`
            )
        )
        break;
}