/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/helpers.ts":
/*!************************!*\
  !*** ./src/helpers.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports) => {


// sometimes native functions will alias others
// eg: trimRight => trimEnd
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.suppressPromiseRejections = exports.getNativeDef = exports.knownAliases = void 0;
exports.isNative = isNative;
exports.findMonkeyPatches = findMonkeyPatches;
// eg: trimLeft => trimStart
exports.knownAliases = [
    ["Left", "Start"],
    ["Right", "End"],
    ["keys", "values"],
    ["toGMTString", "toUTCString"]
];
var getNativeDef = function (funcName) { return "function ".concat(funcName, "() { [native code] }"); };
exports.getNativeDef = getNativeDef;
function isNative(funcName, funcDef) {
    // if the definition doesnt even contain "native code" then it's not native
    // no need to check synonyms
    if (funcDef.indexOf("{ [native code] }") === -1)
        return false;
    // definition matches function name exactly
    if (funcDef === (0, exports.getNativeDef)(funcName))
        return true;
    var aliasIsNative = false;
    for (var a in exports.knownAliases) {
        var _a = exports.knownAliases[a], original = _a[0], alias = _a[1];
        var aliasDef = (0, exports.getNativeDef)(funcName.replace(original, alias));
        var aliasDefRev = (0, exports.getNativeDef)(funcName.replace(alias, original));
        if (aliasDef === funcDef || aliasDefRev === funcDef) {
            aliasIsNative = true;
            break;
        }
    }
    return aliasIsNative;
}
function findMonkeyPatches(nativeTypeName) {
    // fix this with correct types
    var nativeType = window[nativeTypeName];
    var foundMonkeyPatches = [];
    if (!nativeType.prototype)
        return [];
    var props = Object.getOwnPropertyNames(nativeType.prototype);
    for (var propName in props) {
        var funcName = props[propName];
        // wrap in try-catch to avoid breaking the loop
        // for "illegal invocation" errors
        try {
            var propType = typeof nativeType.prototype[funcName];
            // we're only testing functions
            if (propType !== "function")
                continue;
            var funcDef = nativeType.prototype[funcName].toString();
            // check the constructor against its type name
            // if (funcName === "constructor" && !isNative(nativeTypeName, funcDef)) {
            //   foundMonkeyPatches.push([funcName, funcDef]);
            //   continue;
            // }
            if (funcName === "constructor") {
                continue;
            }
            var funcIsNative = isNative(funcName, funcDef);
            //console.log({ funcName, funcDef, funcIsNative, nativeTypeName })
            if (!funcIsNative) {
                foundMonkeyPatches.push([funcName, funcDef]);
            }
        }
        catch (e) {
            continue;
        }
    }
    return foundMonkeyPatches;
}
// if a property is a rejected promise and we touch it, it will throw an error
// so suppress the event while we work
var suppressPromiseRejections = function (event) {
    event.preventDefault();
};
exports.suppressPromiseRejections = suppressPromiseRejections;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.detectMonkeyPatches = detectMonkeyPatches;
var helpers_1 = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");
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
function detectMonkeyPatches() {
    return new Promise(function (resolve) {
        window.addEventListener("unhandledrejection", helpers_1.suppressPromiseRejections);
        var windowProps = Object.getOwnPropertyNames(window);
        var patchedProps = {};
        for (var prop in windowProps) {
            var propName = windowProps[prop];
            // we're only interested in types
            if (/[A-Z]/.test(propName[0])) {
                var mps = (0, helpers_1.findMonkeyPatches)(propName);
                if (mps.length) {
                    patchedProps[propName] = mps;
                }
            }
        }
        // remove the suppression after we're done
        // 1ms timeout to make the call async else it gets removed before the Promises actually reject
        setTimeout(function () {
            window.removeEventListener("unhandledrejection", helpers_1.suppressPromiseRejections);
            resolve(patchedProps);
        }, 1);
    });
}
if (!window.hasOwnProperty('detectMonkeyPatches')) {
    Object.defineProperty(window, 'detectMonkeyPatches', {
        value: detectMonkeyPatches
    });
}
// performance.mark("end");
// console.log(
//   patchedProps,
//   performance.measure("start to end", "start", "end").duration,
//   "ms"
// );

})();

/******/ })()
;
//# sourceMappingURL=detect-monkey-patches.js.map