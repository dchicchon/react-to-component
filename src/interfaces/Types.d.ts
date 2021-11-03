interface Dependency {
    [index: string]: string
}

interface Environment {
    root: string,
    source: string,
    dependencies: Dependency,
    devDependencies: Dependency
}

export interface Config {
    current: string,
    envs: {
        [index: string]: Environment
    }
}

