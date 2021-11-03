#! /usr/bin/env node
import { Config } from '../interfaces/Types'
import { readFileSync, writeFile } from 'fs'

// Maybe bring in fs
import { exec, echo, cd, cp, cat, ShellString, sort } from 'shelljs'
import { join, dirname } from 'path'
import { cyan, yellow } from 'chalk'

const configPath = join(dirname(__filename), "../lib/config.json");
const log = console.log

// Helper Functions
const addCracoFile = () => {
    log("Adding Craco File")
    //get current source
    const configFile = readFileSync(configPath);
    const config: Config = JSON.parse(configFile.toString());
    const env = config.envs[config.current];
    log(env.source)
    let formatSrc: string = ''
    for (let i = 0; i < env.source.length; i++) {
        let char = env.source[i] === '\\' ? '\\\\' : env.source[i]
        formatSrc += char
    }
    ShellString(`module.exports = {
        webpack: {
            configure: (webpackConfig) => {
                // This needs to be updated everytime we set a root/source or on run?
                // Need to specify the source every time we root
                webpackConfig.entry = "${formatSrc + '\\\\index.js'}"
                return webpackConfig;
            },
        },
        babel: {
            presets: ["@babel/preset-react"],
        },
    };`).to('craco.config.js')
    log("Done adding craco.config.js")
}

export module Commands {

    export const root = () => {

        try {
            const rootDirectory = process.cwd(); // directory where we run command
            log(cyan(`Saving ${rootDirectory} as root`));
            // Save craco here

            // get current env 
            const configFile = readFileSync(configPath);
            const config: Config = JSON.parse(configFile.toString());
            const env = config.envs[config.current];


            // log(cyan("Rewiring React App.."))
            // exec('npm install --save-dev react-app-rewired react-app-rewire-alias')

            // writeOverride(rootDirectory)

            // get packages in current directory
            const rootPath = join(rootDirectory, '\package.json')
            const rootFile = readFileSync(rootPath);
            const rootJSON = JSON.parse(rootFile.toString())

            exec('npm i @craco/craco')
            rootJSON.scripts = {
                "start": "craco start",
                "build": "craco build",
                "test": "craco test",
            }

            env.root = rootDirectory;
            env.dependencies = rootJSON.dependencies;
            env.devDependencies = rootJSON.devDependencies;

            const rootData = JSON.stringify(rootJSON)
            writeFile(rootPath, rootData, 'utf8', (err) => {
                err && console.error(err)
            })

            // Package updated config in config.json
            const data = JSON.stringify(config);
            writeFile(configPath, data, "utf8", (err) => {
                err && console.error(err);
            });
        }
        catch (error) {
            log(yellow("There was an error in rooting your React App. Please ensure this is a valid react app"))
            // error(error)
        }
    }

    export const source = () => {
        try {
            const newSource = process.cwd()
            log(cyan(`Sourcing ${newSource}`))
            const rawData = readFileSync(configPath);
            const config: Config = JSON.parse(rawData.toString());
            const env = config.envs[config.current]
            env.source = newSource
            const data = JSON.stringify(config);
            writeFile(configPath, data, "utf8", (err) => {
                if (err) console.error(err);
            });
        } catch (error) {
            log()
        }

    }

    export const run = () => {
        // Lets read our config file
        const rawData = readFileSync(configPath);
        const config: Config = JSON.parse(rawData.toString());
        const { source } = config.envs[config.current]
        const { root } = config.envs[config.current];
        log(cyan(`Running source:${source} at root:${root}`));
        cd(root);
        addCracoFile()
        exec("npm start");
    }

    export const config = () => {
        const rawData = readFileSync(configPath);
        const config: Config = JSON.parse(rawData.toString());
        const env = config.envs[config.current];
        const flag: string = process.argv[3];
        // Check for flags
        if (flag) {
            // check the flag
            switch (flag) {
                case "-envs":
                    let list = Object.keys(config.envs).filter((key) => key !== "current");
                    log(cyan("List of envs"));
                    list.forEach((env) => log(cyan(env)));
                    break;
            }
        } else {
            log(cyan(`Current Config: ${config.current}`));
            log(env);
        }

    }

    export const uninstallEnv = () => {
        const rawData = readFileSync(configPath);
        const config: Config = JSON.parse(rawData.toString());
        const env = config.envs[config.current];
        cd(env.root); // navigate to root to uninstall items there
        // Dont need to worry about flag, just see how many args there are
        if (process.argv.length === 3) {
            log(cyan("Please specify what you would like to uninstall. Use -all to delete all, or simply list packages to delete"))
            // uninstall everything in root env
        }
        else if (process.argv[3] === '-all') {
            log(cyan("Uninstalling all packages"))
            // look at config to see what to uninstall
            for (let i = 0; i < Object.keys(env.dependencies).length; i++) {
                const dep = Object.keys(env.dependencies)[i]
                log(cyan(`Uninstalling package ${dep}`))
                exec(`npm uninstall ${dep}`)
            }
            for (let i = 0; i < Object.keys(env.devDependencies).length; i++) {
                const dep = Object.keys(env.devDependencies)[i]
                log(cyan(`Uninstalling package ${dep}`))
                exec(`npm uninstall ${dep}`)
            }

            env.dependencies = {}
            env.devDependencies = {}
            const data = JSON.stringify(config);
            writeFile(configPath, data, "utf8", (err) => {
                if (err) console.error(err);
            });

        }
        else {
            // only install these packages
            for (let i = 3; i < process.argv.length; i++) {
                try {
                    log(cyan(`Uninstalling package ${process.argv[i]}`))
                    exec(`npm uninstall ${process.argv[i]}`)
                    env.dependencies[process.argv[i]] ? delete env.dependencies[process.argv[i]] : delete env.devDependencies[process.argv[i]]
                } catch (error) {
                    console.error(error)
                }
            }

            // Make sure to add all packages here
            const data = JSON.stringify(config);
            writeFile(configPath, data, "utf8", (err) => {
                if (err) console.error(err);
            });
        }


    }

    export const installEnv = () => {
        // Install to root
        const rawData = readFileSync(configPath);
        const config: Config = JSON.parse(rawData.toString());
        const env = config.envs[config.current];
        cd(env.root); // navigate to root to install items there
        const flag: string = process.argv[3];
        if (env.root === '') {
            log(cyan("You must root an reach app before installing any dependencies"))
            return
        }
        if (process.argv.length === 3) {
            log(cyan("Installing Environment Packages"))
            // install both dependencies and devDependencies from config -> root
            for (const dep in env.dependencies) {
                log(cyan(`Installing ${dep}`))
                exec(`npm install ${dep}`);
            }
            for (const dep in env.devDependencies) {
                log(cyan(`Installing ${dep}`))
                exec(`npm install ${dep} --save-dev`);
            }
        } else if (flag === "-dev") {
            for (let i = 4; i < process.argv.length; i++) {
                let dep = process.argv[i];
                log(cyan(`Installing Package ${dep} in dev`))
                try {
                    exec(`npm install ${dep} --save-dev`);
                    env.dependencies[dep] && delete env.dependencies[dep]
                } catch (error) {
                    console.error(error);
                }
            }

            const rootJSON = join(process.cwd(), "/package.json");
            const rootFile = readFileSync(rootJSON);
            env.devDependencies = JSON.parse(rootFile.toString()).devDependencies;
            const data = JSON.stringify(config);
            writeFile(configPath, data, "utf8", (err) => {
                if (err) console.error(err);
            });
        } else {

            for (let i = 3; i < process.argv.length; i++) {
                let dep = process.argv[i];
                log(cyan(`Installing Package ${dep}`))
                try {
                    exec(`npm install ${dep}`);
                    env.devDependencies[dep] && delete env.devDependencies[dep]
                } catch (error) {
                    console.error(error);
                }
            }
            const rootJSON = join(process.cwd(), "/package.json");
            const rootFile = readFileSync(rootJSON);
            env.dependencies = JSON.parse(rootFile.toString()).dependencies;
            const data = JSON.stringify(config);
            writeFile(configPath, data, "utf8", (err) => {
                if (err) console.error(err);
            });
        }
    }

    export const switchEnv = () => {
        const newEnv: string = process.argv[3];
        const rawData = readFileSync(configPath);
        const config: Config = JSON.parse(rawData.toString());
        if (config.current === newEnv) {
            log(cyan(`Already on environment:${newEnv}`))
            return
        }
        // If the env we switched to is not in our config.envs, create a new env
        if (config.envs[newEnv] === undefined) {
            log(cyan(`Creating new environment:${newEnv}`))
            const env = {
                root: "",
                source: "",
                dependencies: {},
                devDependencies: {},
            };
            config.envs[newEnv] = env
        } else {
            log(cyan(`Switching to environment: ${newEnv}`))
        }
        config.current = newEnv
        const data = JSON.stringify(config);
        writeFile(configPath, data, "utf8", (err) => {
            if (err) console.error(err);
        });

    }

    export const deleteEnv = () => {
        if (process.argv.length === 3) {
            log(cyan("You must input envs to delete"))
            return
        }
        const rawData = readFileSync(configPath);
        const config: Config = JSON.parse(rawData.toString());
        if (Object.keys(config.envs).length === 0) {
            log(cyan("No environments detected in config"))
        }
        for (let i = 3; i < process.argv.length; i++) {
            const env: string = process.argv[i];
            log(cyan(`Deleting environment: ${env}`))
            if (config.envs[env]) {
                delete config.envs[env]
                if (config.current === env) config.current = ''
            } else {
                log(cyan('Environment not found. Skipping...'))
                continue
            }
        }
        const data = JSON.stringify(config);
        writeFile(configPath, data, "utf8", (err) => {
            if (err) console.error(err);
        });
    }

    export const reset = () => {
        log(cyan("Resetting Config"))
        // get current env 
        const rawData = readFileSync(configPath);
        const config: Config = JSON.parse(rawData.toString());

        // Remove all other configs
        for (const env in config.envs) {
            delete config.envs[env]
        }
        config.current = 'base'
        config.envs["base"] = {
            root: '',
            source: '',
            dependencies: {},
            devDependencies: {}
        }

        // Package updated config in config.j
        const data = JSON.stringify(config);
        writeFile(configPath, data, "utf8", (err) => {
            if (err) console.error(err);
        });
    }
}