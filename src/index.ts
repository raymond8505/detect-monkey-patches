import {suppressPromiseRejections,findMonkeyPatches} from './helpers'

performance.mark("start");

window.addEventListener("unhandledrejection", suppressPromiseRejections);

type PatchedProps = Record<string,Array<Array<string>>>
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
}, 1);

performance.mark("end");

console.log(
  patchedProps,
  performance.measure("start to end", "start", "end").duration,
  "ms"
);
