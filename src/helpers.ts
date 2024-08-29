// sometimes native functions will alias others
// eg: trimRight => trimEnd

import { FakeType, MonkeyPatches } from "./types";

// eg: trimLeft => trimStart
export const knownAliases = [
  ["Left", "Start"],
  ["Right", "End"],
  ["keys", "values"],
  ["toGMTString", "toUTCString"]
];

export const getNativeDef = (funcName: string) => `function ${funcName}() { [native code] }`;

export function isNative(funcName: string, funcDef: string) {
  // if the definition doesnt even contain "native code" then it's not native
  // no need to check synonyms
  if (funcDef.indexOf("{ [native code] }") === -1) return false;

  // definition matches function name exactly
  if (funcDef === getNativeDef(funcName)) return true;

  let aliasIsNative = false;

  for (let a in knownAliases) {
    const [original, alias] = knownAliases[a];

    const aliasDef = getNativeDef(funcName.replace(original, alias));
    const aliasDefRev = getNativeDef(funcName.replace(alias, original));

    if (aliasDef === funcDef || aliasDefRev === funcDef) {
      aliasIsNative = true;
      break;
    }
  }

  return aliasIsNative;
}



export function findMonkeyPatches(nativeTypeName: string): MonkeyPatches {

  // fix this with correct types
  const nativeType = window[nativeTypeName as unknown as number] as unknown as FakeType;

  if (!nativeType.prototype) return [];

  const foundMonkeyPatches:MonkeyPatches = [];

  const props = Object.getOwnPropertyNames(nativeType.prototype);

  for (let propName in props) {
    const funcName = props[propName];

    // wrap in try-catch to avoid breaking the loop
    // for "illegal invocation" errors
    try {
      const propType = typeof nativeType.prototype[funcName];

      // we're only testing functions
      if (propType !== "function") continue;

      const funcDef = nativeType.prototype[funcName].toString();

      // check the constructor against its type name
      // if (funcName === "constructor" && !isNative(nativeTypeName, funcDef)) {
      //   foundMonkeyPatches.push([funcName, funcDef]);
      //   continue;
      // }
      if(funcName === "constructor")
      {
        continue
      }

      const funcIsNative = isNative(funcName, funcDef);

      //console.log({ funcName, funcDef, funcIsNative, nativeTypeName })
      if (!funcIsNative) {
        foundMonkeyPatches.push([funcName, funcDef]);
      }

    } catch (e) {
      continue;
    }
  }

  return foundMonkeyPatches;
}

// if a property is a rejected promise and we touch it, it will throw an error
// so suppress the event while we work
export const suppressPromiseRejections = (event: Event) => {
  event.preventDefault();
};