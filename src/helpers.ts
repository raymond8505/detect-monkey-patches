

export const getNativeDef = (funcName:string) => `function ${funcName}() { [native code] }`;
export function isNative(funcName:string, funcDef:string) {
  // if the definition doesnt even contain "native code" then it's not native
  // no need to check synonyms
  if (funcDef.indexOf("{ [native code] }") === -1) return false;

  // definition matches function name exactly
  if (funcDef === getNativeDef(funcName)) return true;

  // sometimes native functions will alias others
  // eg: trimRight => trimEnd
  // eg: trimLeft => trimStart
  const knownAliases = [
    ["Left", "Start"],
    ["Right", "End"],
    ["keys", "values"],
    ["toGMTString", "toUTCString"]
  ];

  let synonymIsNative = false;

  for (let a in knownAliases) {
    const [original, alias] = knownAliases[a];

    const aliasName = funcName.replace(original, alias);
    const aliasNameRev = funcName.replace(alias, original);

    const aliasDef = getNativeDef(funcName.replace(original, alias));
    const aliasDefRev = getNativeDef(funcName.replace(alias, original));

    if (aliasDef === funcDef || aliasDefRev === funcDef) {
      synonymIsNative = true;
      break;
    }
  }

  return synonymIsNative;
}

export function findMonkeyPatches(nativeTypeName:string) {

  // fix this with correct types
  const nativeType = window[nativeTypeName as unknown as number] as unknown as {prototype:Object};

  const foundMonkeyPatches = [];

  if (!nativeType.prototype) return [];

  const props = Object.getOwnPropertyNames(nativeType.prototype);

  for (let propName in props) {
    const funcName = props[propName];

    // wrap in try-catch to avoid breaking the loop
    // for "illegal invocation" errors
    try {
      const propType = typeof nativeType.prototype[funcName];

      // we're only testing functions
      if (propType !== "function") continue;

      // check the constructor against its type name
      if (funcName === "constructor" && !isNative(nativeTypeName, funcDef)) {
        foundMonkeyPatches.push([funcName, funcDef]);
      }

      const funcDef = nativeType.prototype[funcName].toString();
      const funcIsNative = isNative(funcName, funcDef);

      if (!funcIsNative) {
        foundMonkeyPatches.push([funcName, funcDef]);
      }
    } catch (e) {
      continue;
    }
  }

  return foundMonkeyPatches;
}

const patchedProps = [];
performance.mark("start");

// if a property is a rejected promise and we touch it, it will throw an error
// so suppress the event while we work
export const suppressPromiseRejections = (event) => {
  event.preventDefault();
};

performance.mark("end");

console.log(
  patchedProps,
  performance.measure("start to end", "start", "end").duration,
  "ms"
);
