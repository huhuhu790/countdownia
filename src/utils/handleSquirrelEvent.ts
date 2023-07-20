import { App } from "electron"
import { join, resolve, basename } from "node:path"
import ChildProcess from "child_process"

export function handleSquirrelEvent(app: App) {
    if (process.argv.length === 1) {
        return false
    }

    const appFolder = resolve(process.execPath, "..")
    const rootAtomFolder = resolve(appFolder, "..")
    const updateDotExe = resolve(join(rootAtomFolder, "Update.exe"))
    const exeName = basename(process.execPath)

    const spawn = function (command: string, args: readonly string[]) {
        let spawnedProcess, error

        try {
            spawnedProcess = ChildProcess.spawn(command, args, { detached: true })
        } catch (error) { }

        return spawnedProcess
    }

    const spawnUpdate = function (args: readonly string[]) {
        return spawn(updateDotExe, args)
    }

    const squirrelEvent = process.argv[1]
    switch (squirrelEvent) {
        case "--squirrel-install":
        case "--squirrel-updated":
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(["--createShortcut", exeName])

            setTimeout(app.quit, 1000)
            return true

        case "--squirrel-uninstall":
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(["--removeShortcut", exeName])

            setTimeout(app.quit, 1000)
            return true

        case "--squirrel-obsolete":
            // This is called on the outgoing version of your app before
            // we update to the new version - it"s the opposite of
            // --squirrel-updated

            app.quit()
            return true
    }
}