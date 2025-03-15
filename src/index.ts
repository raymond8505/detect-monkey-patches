import { suppressPromiseRejections, findMonkeyPatches, isNative, log, getKnownWindowPropertyNames } from './helpers'
import type { PatchedProps } from './types'

/**
 * TODO
 * 1. move performance tests to separate place
 * 2. add a fix() function that opens a blank iframe to grab the native definition 
 * 3. main function should return a promise with the results so user can be 
 *      sure they act after the unhandledrejection handler removed
 * 4. flesh out README
 * 5. jest tests
 * 6. make npm package
 */

export function detectMonkeyPatches(): Promise<PatchedProps> {

  log('detecting monkey patches')
  return new Promise((resolve, reject) => {

    window.addEventListener("unhandledrejection", suppressPromiseRejections);

    try {
      const windowProps = Object.getOwnPropertyNames(window);
      const patchedProps: PatchedProps = {}
      const knownWindowPropertyNames = getKnownWindowPropertyNames()

      for (let prop in windowProps) {
        const propName: string = windowProps[prop];

        if (!knownWindowPropertyNames.includes(propName)) continue;

        // we're only interested in types
        if (/[A-Z]/.test(propName[0])) {
          const mps = findMonkeyPatches(propName);

          if (mps.length) {
            patchedProps[propName] = mps
          }
        }
        else if (typeof window[propName as unknown as number] === 'function') {

          const propDef = window[propName as unknown as number].toString()
          if (!isNative(propName, propDef)) {
            patchedProps[propName] = propDef
          }

        }

      }

      // remove the suppression after we're done
      // 1ms timeout to make the call async else it gets removed before the Promises actually reject
      setTimeout(() => {
        window.removeEventListener("unhandledrejection", suppressPromiseRejections);
        resolve(patchedProps)
      }, 1);
    }
    catch (e) {
      reject(e)
    }
  })
}
let cleanIFrame: HTMLIFrameElement | undefined = undefined

export const fixMonkeyPatch = (patchedPropName: string) => {
  if (!cleanIFrame) {
    cleanIFrame = document.createElement('iframe')
    cleanIFrame.src = 'about:blank'
    cleanIFrame.style.display = 'none'
    cleanIFrame.setAttribute('id', 'detect-monkey-patches__clean-iframe')

    // the iframe must stay in DOM for 
    document.body.appendChild(cleanIFrame)
  }

  if (!cleanIFrame.contentWindow) {
    throw new Error("Detect Monkey Patches Error: couldn't create clean iframe")
  }

  return cleanIFrame.contentWindow[patchedPropName as unknown as number]
}

if (!window.hasOwnProperty('detectMonkeyPatches')) {
  Object.defineProperty(window, 'detectMonkeyPatches', {
    value: detectMonkeyPatches
  })
}

if (!window.hasOwnProperty('fixMonkeyPatch')) {
  Object.defineProperty(window, 'fixMonkeyPatch', {
    value: fixMonkeyPatch
  })
}
