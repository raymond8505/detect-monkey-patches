import { suppressPromiseRejections, findMonkeyPatches, isNative, log, getKnownWindowPropertyNames, getCleanIframe, removeCleanIframe } from './helpers'
import type { PatchedProps } from './types'

/**
 * TODO
 * 1. jest tests
 * 2. make npm package
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

        // if the prop is a class
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
      // 1ms timeout to make the call async 
      // else it gets removed before the Promises actually reject
      setTimeout(() => {
        window.removeEventListener("unhandledrejection", suppressPromiseRejections);
        resolve(patchedProps)
        removeCleanIframe()
      }, 1);
    }
    catch (e) {
      reject(e)
      removeCleanIframe()
    }
  })
}

export const fixMonkeyPatch = (patchedPropName: string) => {
  if (!getKnownWindowPropertyNames().includes(patchedPropName)) {
    throw new Error(`Detect Monkey Patches Error: Unknown window property "${patchedPropName}"`)
  }

  const cleanIFrame = getCleanIframe()

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
