#! /usr/bin/env node
export module Commands {
    export const exportApp = () => {
        try {
            console.log("Exporting the app here!")
        } catch (err) {
            console.log("There was an error in exporting your app")
        }
    }
}