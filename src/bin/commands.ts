#! /usr/bin/env node

import { readFileSync, writeFile, } from 'fs'
import { exec, echo, cd, cp, cat, ShellString, sort } from 'shelljs'


// what do we need to do, we need to read the current
// directory that we are in, look for src folder.
// Look for the App.js file and use that as our root for
// our project. Then we can ask the user to select all the files
//
const log = console.log
export module Commands {
    export const exportApp = () => {
        try {
            log("Exporting the app here!")
            console.log(process.cwd()) // print the root of where we are in'
            // lets create a folder called export_app
            exec('mkdir -p export_app') // also check if there is a folder called export_app
            // look for a src folder


        } catch (err) {
            log("There was an error in exporting your app")
        }
    }
}