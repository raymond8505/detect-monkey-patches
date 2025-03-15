
import { CLEAN_IFRAME_ID, findClassMonkeyPatches, getCleanIframe, getKnownWindowPropertyNames, getNativeDef, isNative, removeCleanIframe } from "./helpers"

describe('helpers', () => {
    describe('getNativeDef', () => {
        it('returns the native definition of the given function name', () => {
            expect(getNativeDef('foo')).toBe('function foo() { [native code] }')
        })
    })
    describe('isNative', () => {
        it('returns false if definition does not contain { [native code] }', () => {
            expect(isNative('foo', getNativeDef('foo'))).toBe(true)
        })
        it('returns true if function name matches function definition exactly', () => {
            expect(isNative('foo', 'function foo() { bar; }')).toBe(false)
        })
        it('returns true if function definition matches a known alias', () => {
            expect(isNative('fooRight', getNativeDef('fooEnd'))).toBe(true)
        })
    })
    describe('getCleanIframe', () => {
        it('only creates the iframe once', () => {
            const iframe = getCleanIframe()
            const iframe2 = getCleanIframe()

            expect(iframe).toBe(iframe2)
        })
    })
    describe('getKnownWindowPropertyNames', () => {
        it('only removes the iframe if it created the iframe', () => {
            getCleanIframe()
            getKnownWindowPropertyNames()
            expect(document.body.querySelector(`#${CLEAN_IFRAME_ID}`)).toBeDefined()

            removeCleanIframe()
            expect(document.body.querySelector(`#${CLEAN_IFRAME_ID}`)).toBeNull()

            getKnownWindowPropertyNames()
            expect(document.body.querySelector(`#${CLEAN_IFRAME_ID}`)).toBeNull()
        })
    })
    describe('findMonkeyPatches', () => {
        beforeEach(() => {
            (window as unknown) = {}
        })
        it('skips anything without a prototype', () => {
            Object.defineProperty(window, 'foo', {
                value: {

                    bar: () => { }

                }
            })

            expect(findClassMonkeyPatches('foo').length).toBe(0)
        })

        it('only checks functions', () => {
            Object.defineProperty(window, 'foo', {
                value: {
                    prototype: {
                        foo: "",
                        bar: () => { }
                    }

                }
            })

            expect(findClassMonkeyPatches('foo')[0][0]).toBe('bar')
        })
    })
})