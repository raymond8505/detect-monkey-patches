import { PatchedProps } from "./types"

declare global {
    interface Window {
        detectMonkeyPatches: () => Promise<PatchedProps>
    }
}
fetch("https://raw.githubusercontent.com/raymond8505/detect-monkey-patches/refs/heads/main/dist/detect-monkey-patches.js").then(r => r.text().then((script) => {

    window.eval(script)
    window.detectMonkeyPatches!().then(patches => {
        if (Object.keys(patches).length) {
            console.log('FOUND MONKEY PATCHES', patches)
        }
        else {
            console.log('No monkey patches found')
        }
    })
}))