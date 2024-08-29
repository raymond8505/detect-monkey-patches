import {suppressPromiseRejections,findMonkeyPatches} from './helpers'
import type {MonkeyPatches,PatchedProps} from './helpers'

/**
 * TODO
 * 1. move performance tests to separate place
 * 2. add a fix() function that opens a blank iframe to grab the native definition 
 * 3. main function should return a promise with the results so user can be 
 *      sure they act after the unhandledrejection handler removed
 * 4. flesh out README
 * 5. jest tests
 */
performance.mark("start");

export function detectMonkeyPatches():Promise<PatchedProps> {
  return new Promise((resolve) => {

    window.addEventListener("unhandledrejection", suppressPromiseRejections);
    
    const windowProps = Object.getOwnPropertyNames(window);
    const patchedProps:PatchedProps = {}
    
    for (let prop in windowProps) {
      const propName = windowProps[prop];
    
      // we're only interested in types
      if (/[A-Z]/.test(propName[0])) {
        const mps = findMonkeyPatches(propName);
    
        if (mps.length) {
          patchedProps[propName] = mps
        }
      }
    }
    
    // remove the suppression after we're done
    // 1ms timeout to make the call async else it gets removed before the Promises actually reject
    setTimeout(() => {
      window.removeEventListener("unhandledrejection", suppressPromiseRejections);
      resolve(patchedProps)
    }, 1);
  })
}

if(!window.hasOwnProperty('detectMonkeyPatches'))
{  
  Object.defineProperty(window,'detectMonkeyPatches',{
    value : detectMonkeyPatches
  })
}

// performance.mark("end");

// console.log(
//   patchedProps,
//   performance.measure("start to end", "start", "end").duration,
//   "ms"
// );
