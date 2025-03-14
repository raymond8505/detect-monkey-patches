import { log } from "./helpers"
import { PatchedProps } from "./types"

declare global {
    interface Window {
        detectMonkeyPatches: () => Promise<PatchedProps>
    }
}
fetch(`https://raw.githubusercontent.com/raymond8505/detect-monkey-patches/refs/heads/main/dist/detect-monkey-patches.js`, {
    cache: 'reload'
}).then(r => r.text().then((script) => {

    window.eval(script)
    window.detectMonkeyPatches!().then(patches => {
        if (Object.keys(patches).length) {
            log('FOUND MONKEY PATCHES', patches)
        }
        else {
            log('NO MONKEY PATCHES FOUND')
        }
    }).catch(e => console.error("Error detecting monkey patches", e))
}))