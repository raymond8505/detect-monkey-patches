import {suppressPromiseRejections,findMonkeyPatches} from './helpers'

window.addEventListener("unhandledrejection", suppressPromiseRejections);

const windowProps = Object.getOwnPropertyNames(window);
const patchedProps = []

for (let prop in windowProps) {
  const propName = windowProps[prop];

  // we're only interested in types
  if (/[A-Z]/.test(propName[0])) {
    const mps = findMonkeyPatches(propName);

    if (mps.length) {
      patchedProps.push([propName, mps]);
    }
  }
}

// remove the suppression after we're done
// 1ms timeout to make the call async else it gets removed before the Promises actually reject
setTimeout(() => {
  window.removeEventListener("unhandledrejection", suppressPromiseRejections);
}, 1);
