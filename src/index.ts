import { suppressPromiseRejections, findMonkeyPatches, isNative, getDescriptorValue, log, getKnownWindowPropertyNames, getCleanIframe, removeCleanIframe, safeTypeCheck, getDefinition } from './helpers'
import type { PatchedProps } from './types'

/**
 * TODO
 * - jest tests
 * - split out adding to window object so can be proper module
 * - make npm package
 */

export function detectMonkeyPatches(): Promise<PatchedProps> {

  log('detecting monkey patches')
  return new Promise((resolve, reject) => {

    function init() {

      window.addEventListener("unhandledrejection", suppressPromiseRejections);

      try {
        const windowProps = Object.getOwnPropertyNames(window);
        const patchedProps: PatchedProps = {}
        const knownWindowPropertyNames = getKnownWindowPropertyNames()

        for (let prop in windowProps) {
          const propName: string = windowProps[prop];

          // we only care about known window functions
          if (safeTypeCheck(window, propName) !== 'function') continue;

          // we only care about known window properties
          if (!knownWindowPropertyNames.includes(propName)) continue;

          const propDef = getDefinition(window, propName)

          // the prop is a class
          if (getDescriptorValue(window, propName).prototype) {

            // the whole class is monkey patched
            if (!isNative(propName, propDef)) {
              patchedProps[propName] = getDescriptorValue(window, propName)
            }
            else {
              const monkeyPatches = findMonkeyPatches(propName);

              if (monkeyPatches.length) {
                patchedProps[propName] = monkeyPatches
              }
            }
          }
          else if (!isNative(propName, propDef)) {
            patchedProps[propName] = getDescriptorValue(window, propName)
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
    }

    if (document.readyState && document.readyState === 'complete') {
      init()
    }
    else {
      document.addEventListener('DOMContentLoaded', init)
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
