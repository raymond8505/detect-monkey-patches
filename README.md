# Detect Monkey Patches

Detect any native Javascript object functions that have had their definition overriden by a custom function, or "monkey patched".

Can be used to ensure javascript environment will work as expected. 
Used as a bookmarklet it can help troubleshooting third party websites.

# Usage

## As a bookmarklet

1. Create a new bookmark bar page
2. Paste the contents of `/dist/bookmarklet.js` in the URL with `javasctipt:`.
3. Click the bookmarklet on any page to get a console log out of any monkey patches

```
javascript:(()=>{"use strict";var __webpack_modules__={"./src/bookmarklet.ts":(__unused_webpack_module,exports)=>{eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nfetch(\"https://raw.githubusercontent.com/raymond8505/detect-monkey-patches/refs/heads/main/dist/detect-monkey-patches.js\").then(function (r) { return r.text().then(function (script) {\n    window.eval(script);\n    window.detectMonkeyPatches().then(function (patches) {\n        if (Object.keys(patches).length) {\n            console.log('%cFOUND MONKEY PATCHES', 'font-weight:bold;font-size:16px;', patches);\n        }\n        else {\n            console.log('%cNO MONKEY PATCHES FOUND', 'font-weight:bold;font-size:16px;');\n        }\n    }).catch(function (e) { return console.error(\"Error detecting monkey patches\", e); });\n}); });\n\n\n//# sourceURL=webpack://detect-monkey-patches/./src/bookmarklet.ts?")}},__webpack_exports__={};__webpack_modules__["./src/bookmarklet.ts"](0,__webpack_exports__)})();
```