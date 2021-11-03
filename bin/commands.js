#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
const fs_1 = require("fs");
const shelljs_1 = require("shelljs");
const path_1 = require("path");
const chalk_1 = require("chalk");
const configPath = (0, path_1.join)((0, path_1.dirname)(__filename), "../lib/config.json");
const log = console.log;
const addCracoFile = () => {
    log("Adding Craco File");
    const configFile = (0, fs_1.readFileSync)(configPath);
    const config = JSON.parse(configFile.toString());
    const env = config.envs[config.current];
    log(env.source);
    let formatSrc = '';
    for (let i = 0; i < env.source.length; i++) {
        let char = env.source[i] === '\\' ? '\\\\' : env.source[i];
        formatSrc += char;
    }
    (0, shelljs_1.ShellString)(`module.exports = {
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
    };`).to('craco.config.js');
    log("Done adding craco.config.js");
};
var Commands;
(function (Commands) {
    Commands.root = () => {
        try {
            const rootDirectory = process.cwd();
            log((0, chalk_1.cyan)(`Saving ${rootDirectory} as root`));
            const configFile = (0, fs_1.readFileSync)(configPath);
            const config = JSON.parse(configFile.toString());
            const env = config.envs[config.current];
            const rootPath = (0, path_1.join)(rootDirectory, '\package.json');
            const rootFile = (0, fs_1.readFileSync)(rootPath);
            const rootJSON = JSON.parse(rootFile.toString());
            (0, shelljs_1.exec)('npm i @craco/craco');
            rootJSON.scripts = {
                "start": "craco start",
                "build": "craco build",
                "test": "craco test",
            };
            env.root = rootDirectory;
            env.dependencies = rootJSON.dependencies;
            env.devDependencies = rootJSON.devDependencies;
            const rootData = JSON.stringify(rootJSON);
            (0, fs_1.writeFile)(rootPath, rootData, 'utf8', (err) => {
                err && console.error(err);
            });
            const data = JSON.stringify(config);
            (0, fs_1.writeFile)(configPath, data, "utf8", (err) => {
                err && console.error(err);
            });
        }
        catch (error) {
            log((0, chalk_1.yellow)("There was an error in rooting your React App. Please ensure this is a valid react app"));
        }
    };
    Commands.source = () => {
        try {
            const newSource = process.cwd();
            log((0, chalk_1.cyan)(`Sourcing ${newSource}`));
            const rawData = (0, fs_1.readFileSync)(configPath);
            const config = JSON.parse(rawData.toString());
            const env = config.envs[config.current];
            env.source = newSource;
            const data = JSON.stringify(config);
            (0, fs_1.writeFile)(configPath, data, "utf8", (err) => {
                if (err)
                    console.error(err);
            });
        }
        catch (error) {
            log();
        }
    };
    Commands.run = () => {
        const rawData = (0, fs_1.readFileSync)(configPath);
        const config = JSON.parse(rawData.toString());
        const { source } = config.envs[config.current];
        const { root } = config.envs[config.current];
        log((0, chalk_1.cyan)(`Running source:${source} at root:${root}`));
        (0, shelljs_1.cd)(root);
        addCracoFile();
        (0, shelljs_1.exec)("npm start");
    };
    Commands.config = () => {
        const rawData = (0, fs_1.readFileSync)(configPath);
        const config = JSON.parse(rawData.toString());
        const env = config.envs[config.current];
        const flag = process.argv[3];
        if (flag) {
            switch (flag) {
                case "-envs":
                    let list = Object.keys(config.envs).filter((key) => key !== "current");
                    log((0, chalk_1.cyan)("List of envs"));
                    list.forEach((env) => log((0, chalk_1.cyan)(env)));
                    break;
            }
        }
        else {
            log((0, chalk_1.cyan)(`Current Config: ${config.current}`));
            log(env);
        }
    };
    Commands.uninstallEnv = () => {
        const rawData = (0, fs_1.readFileSync)(configPath);
        const config = JSON.parse(rawData.toString());
        const env = config.envs[config.current];
        (0, shelljs_1.cd)(env.root);
        if (process.argv.length === 3) {
            log((0, chalk_1.cyan)("Please specify what you would like to uninstall. Use -all to delete all, or simply list packages to delete"));
        }
        else if (process.argv[3] === '-all') {
            log((0, chalk_1.cyan)("Uninstalling all packages"));
            for (let i = 0; i < Object.keys(env.dependencies).length; i++) {
                const dep = Object.keys(env.dependencies)[i];
                log((0, chalk_1.cyan)(`Uninstalling package ${dep}`));
                (0, shelljs_1.exec)(`npm uninstall ${dep}`);
            }
            for (let i = 0; i < Object.keys(env.devDependencies).length; i++) {
                const dep = Object.keys(env.devDependencies)[i];
                log((0, chalk_1.cyan)(`Uninstalling package ${dep}`));
                (0, shelljs_1.exec)(`npm uninstall ${dep}`);
            }
            env.dependencies = {};
            env.devDependencies = {};
            const data = JSON.stringify(config);
            (0, fs_1.writeFile)(configPath, data, "utf8", (err) => {
                if (err)
                    console.error(err);
            });
        }
        else {
            for (let i = 3; i < process.argv.length; i++) {
                try {
                    log((0, chalk_1.cyan)(`Uninstalling package ${process.argv[i]}`));
                    (0, shelljs_1.exec)(`npm uninstall ${process.argv[i]}`);
                    env.dependencies[process.argv[i]] ? delete env.dependencies[process.argv[i]] : delete env.devDependencies[process.argv[i]];
                }
                catch (error) {
                    console.error(error);
                }
            }
            const data = JSON.stringify(config);
            (0, fs_1.writeFile)(configPath, data, "utf8", (err) => {
                if (err)
                    console.error(err);
            });
        }
    };
    Commands.installEnv = () => {
        const rawData = (0, fs_1.readFileSync)(configPath);
        const config = JSON.parse(rawData.toString());
        const env = config.envs[config.current];
        (0, shelljs_1.cd)(env.root);
        const flag = process.argv[3];
        if (env.root === '') {
            log((0, chalk_1.cyan)("You must root an reach app before installing any dependencies"));
            return;
        }
        if (process.argv.length === 3) {
            log((0, chalk_1.cyan)("Installing Environment Packages"));
            for (const dep in env.dependencies) {
                log((0, chalk_1.cyan)(`Installing ${dep}`));
                (0, shelljs_1.exec)(`npm install ${dep}`);
            }
            for (const dep in env.devDependencies) {
                log((0, chalk_1.cyan)(`Installing ${dep}`));
                (0, shelljs_1.exec)(`npm install ${dep} --save-dev`);
            }
        }
        else if (flag === "-dev") {
            for (let i = 4; i < process.argv.length; i++) {
                let dep = process.argv[i];
                log((0, chalk_1.cyan)(`Installing Package ${dep} in dev`));
                try {
                    (0, shelljs_1.exec)(`npm install ${dep} --save-dev`);
                    env.dependencies[dep] && delete env.dependencies[dep];
                }
                catch (error) {
                    console.error(error);
                }
            }
            const rootJSON = (0, path_1.join)(process.cwd(), "/package.json");
            const rootFile = (0, fs_1.readFileSync)(rootJSON);
            env.devDependencies = JSON.parse(rootFile.toString()).devDependencies;
            const data = JSON.stringify(config);
            (0, fs_1.writeFile)(configPath, data, "utf8", (err) => {
                if (err)
                    console.error(err);
            });
        }
        else {
            for (let i = 3; i < process.argv.length; i++) {
                let dep = process.argv[i];
                log((0, chalk_1.cyan)(`Installing Package ${dep}`));
                try {
                    (0, shelljs_1.exec)(`npm install ${dep}`);
                    env.devDependencies[dep] && delete env.devDependencies[dep];
                }
                catch (error) {
                    console.error(error);
                }
            }
            const rootJSON = (0, path_1.join)(process.cwd(), "/package.json");
            const rootFile = (0, fs_1.readFileSync)(rootJSON);
            env.dependencies = JSON.parse(rootFile.toString()).dependencies;
            const data = JSON.stringify(config);
            (0, fs_1.writeFile)(configPath, data, "utf8", (err) => {
                if (err)
                    console.error(err);
            });
        }
    };
    Commands.switchEnv = () => {
        const newEnv = process.argv[3];
        const rawData = (0, fs_1.readFileSync)(configPath);
        const config = JSON.parse(rawData.toString());
        if (config.current === newEnv) {
            log((0, chalk_1.cyan)(`Already on environment:${newEnv}`));
            return;
        }
        if (config.envs[newEnv] === undefined) {
            log((0, chalk_1.cyan)(`Creating new environment:${newEnv}`));
            const env = {
                root: "",
                source: "",
                dependencies: {},
                devDependencies: {},
            };
            config.envs[newEnv] = env;
        }
        else {
            log((0, chalk_1.cyan)(`Switching to environment: ${newEnv}`));
        }
        config.current = newEnv;
        const data = JSON.stringify(config);
        (0, fs_1.writeFile)(configPath, data, "utf8", (err) => {
            if (err)
                console.error(err);
        });
    };
    Commands.deleteEnv = () => {
        if (process.argv.length === 3) {
            log((0, chalk_1.cyan)("You must input envs to delete"));
            return;
        }
        const rawData = (0, fs_1.readFileSync)(configPath);
        const config = JSON.parse(rawData.toString());
        if (Object.keys(config.envs).length === 0) {
            log((0, chalk_1.cyan)("No environments detected in config"));
        }
        for (let i = 3; i < process.argv.length; i++) {
            const env = process.argv[i];
            log((0, chalk_1.cyan)(`Deleting environment: ${env}`));
            if (config.envs[env]) {
                delete config.envs[env];
                if (config.current === env)
                    config.current = '';
            }
            else {
                log((0, chalk_1.cyan)('Environment not found. Skipping...'));
                continue;
            }
        }
        const data = JSON.stringify(config);
        (0, fs_1.writeFile)(configPath, data, "utf8", (err) => {
            if (err)
                console.error(err);
        });
    };
    Commands.reset = () => {
        log((0, chalk_1.cyan)("Resetting Config"));
        const rawData = (0, fs_1.readFileSync)(configPath);
        const config = JSON.parse(rawData.toString());
        for (const env in config.envs) {
            delete config.envs[env];
        }
        config.current = 'base';
        config.envs["base"] = {
            root: '',
            source: '',
            dependencies: {},
            devDependencies: {}
        };
        const data = JSON.stringify(config);
        (0, fs_1.writeFile)(configPath, data, "utf8", (err) => {
            if (err)
                console.error(err);
        });
    };
})(Commands = exports.Commands || (exports.Commands = {}));
