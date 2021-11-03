#! /usr/bin/env node

import chalk from 'chalk'
import { Commands } from './commands'

// Run all commands by here
const command = process.argv[2]
switch (command) {
    case 'export-app':
        Commands.exportApp()
        break;
    default:
        console.log(
            chalk.underline.cyan(`\nReact-to-Component: Turn React Applications to components!\n\n`) +
            chalk.cyan(
                `Try one of the following commands:\n` +
                chalk.green(`export-app`) + `: begins the export flow for your react app \n`
            )
        )
        break;
}