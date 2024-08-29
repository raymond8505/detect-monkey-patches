
import { findMonkeyPatches, getNativeDef,isNative } from "./helpers"

describe('helpers',()=>{
    describe('getNativeDef',() => {
        it('returns the native definition of the given function name',()=>{
            expect(getNativeDef('foo')).toBe('function foo() { [native code] }')
        })
    })
    describe('isNative',()=>{
        it('returns false if definition does not contain { [native code] }',()=>{
            expect(isNative('foo',getNativeDef('foo'))).toBe(true)
        })
        it('returns true if function name matches function definition exactly',()=>{
            expect(isNative('foo', 'function foo() { bar; }')).toBe(false)
        })
        it('returns true if function definition matches a known alias',()=>{
            expect(isNative('fooRight',getNativeDef('fooEnd'))).toBe(true)
        })
    })
    describe('findMonkeyPatches',()=>{
        beforeEach(()=>{
            window = {}
        })
        it('skips anything without a prototype',()=>{
            Object.defineProperty(window,'foo',{
                value : {
                   
                        bar : () => {}
                    
                }
            })
            

            expect(findMonkeyPatches('foo').length).toBe(0)
        })

        it('only checks functions',()=>{
            Object.defineProperty(window,'foo',{
                value : {
                   prototype : {
                       foo : "",
                       bar: () => {}
                   }
                    
                }
            })

            expect(findMonkeyPatches('foo')[0][0]).toBe('bar')
        })
    })
})