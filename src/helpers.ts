// sometimes native functions will alias others
// eg: trimRight => trimEnd

import { FakeType, MonkeyPatches } from "./types";

// eg: trimLeft => trimStart
export const knownAliases = [
  ["Left", "Start"],
  ["Right", "End"],
  ["keys", "values"],
  ["toGMTString", "toUTCString"],
  ["webkitMediaStream", "MediaStream"],
  ["webkitRTCPeerConnection", "RTCPeerConnection"],
  ["webkitSpeechGrammar", "SpeechGrammar"],
  ["webkitSpeechRecognition", "SpeechRecognition"],
  ["webkitSpeechRecognitionError", "SpeechRecognitionErrorEvent"],
  ["webkitSpeechRecognitionEvent", "SpeechRecognitionEvent"],
  ["webkitURL", "URL"],
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

export function getKnownWindowPropertyNames() {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = "about:blank";
  document.body.appendChild(iframe);

  const names = []

  const windowProps = Object.getOwnPropertyNames(iframe.contentWindow);

  if (!iframe.contentWindow) return []

  for (let prop in windowProps) {
    const propName: string = windowProps[prop];

    names.push(propName)

  }

  document.body.removeChild(iframe);

  return names;
}

export function findMonkeyPatches(nativeTypeName: string): MonkeyPatches {

  try {
    const nativeType = window[nativeTypeName as unknown as number] as unknown as FakeType;

    if (!nativeType?.prototype) return [];

    const foundMonkeyPatches: MonkeyPatches = [];

    const props = Object.getOwnPropertyNames(nativeType.prototype);

    for (let propName in props) {

      // wrap in try-catch to avoid breaking the loop
      // for "illegal invocation" errors
      try {
        const funcName = props[propName];
        const descriptor = Object.getOwnPropertyDescriptor(nativeType.prototype, funcName)
        const propType = typeof descriptor?.value;

        // we're only testing functions
        if (propType !== "function") continue;

        const funcDef = nativeType.prototype[funcName].toString();

        if (funcName === "constructor") {
          continue
        }

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
  catch {
    return []
  }
}

// if a property is a rejected promise and we touch it, it will throw an error
// so suppress the event while we work
export const suppressPromiseRejections = (event: Event) => {
  event.preventDefault();
};