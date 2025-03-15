// sometimes native functions will alias others
// eg: trimRight => trimEnd

import { FakeType, MonkeyPatches } from "./types";

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
  ["WebKitCSSMatrix", "DOMMatrix"],
  ["WebKitMutationObserver", "MutationObserver"],
];

export const getNativeDef = (funcName: string) => `function ${funcName}() { [native code] }`;

/**
 * Checks if the given function name and definition are native
 * handles aliases as well
 */
export function isNative(funcName: string, funcDef: string) {
  // if the definition doesnt even contain "native code" then it's not native
  // no need to check aliases
  if (funcDef.indexOf("{ [native code] }") === -1) return false;

  // definition matches function name exactly
  if (funcDef === getNativeDef(funcName)) return true;

  for (let a in knownAliases) {
    const [original, alias] = knownAliases[a];

    const aliasDef = getNativeDef(funcName.replace(original, alias));
    const aliasDefRev = getNativeDef(funcName.replace(alias, original));

    if (aliasDef === funcDef || aliasDefRev === funcDef) {
      return true;
    }
  }

  return false;
}
/**
 * Fancy logging
 */
export function log(label: string, ...args: unknown[]) {
  console.log(`%c ${label}`, 'font-weight:bold;font-size:16px;', ...args)
}

/**
 * We only need to get the iframe once
 * so we'll cache it here
 */
let cleanIFrame: HTMLIFrameElement | undefined = undefined

export function getCleanIframe(): HTMLIFrameElement {

  if (!cleanIFrame) {
    cleanIFrame = document.createElement('iframe')
    cleanIFrame.src = 'about:blank'
    cleanIFrame.style.display = 'none'
    cleanIFrame.setAttribute('id', 'detect-monkey-patches__clean-iframe')

    // the iframe must stay in DOM for 
    document.body.appendChild(cleanIFrame)
  }

  return cleanIFrame
}

export function removeCleanIframe() {
  if (cleanIFrame) {
    document.body.removeChild(cleanIFrame);
    cleanIFrame = undefined;
  }
}

/**
 * @returns an array of known window property names
 */
export function getKnownWindowPropertyNames() {
  const iframe = getCleanIframe();

  if (!iframe.contentWindow) return []

  const names = []

  const windowProps = Object.getOwnPropertyNames(iframe.contentWindow);

  for (let prop in windowProps) {
    const propName: string = windowProps[prop];

    names.push(propName)
  }

  removeCleanIframe();

  return names;
}
export function getDescriptorValue(obj: unknown, propName: string) {
  return Object.getOwnPropertyDescriptor(obj, propName)?.value
}
/**
 * Some things don't like being touched
 * so we need to check if we can access them
 * without throwing an error
 * @returns 
 */
export function safeTypeCheck(obj: unknown, propName: string) {
  return typeof getDescriptorValue(obj, propName)
}
export function getDefinition(obj: unknown, propName: string) {
  return getDescriptorValue(obj, propName)?.toString() ?? "unknown"
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
        const propType = safeTypeCheck(nativeType.prototype, funcName)

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