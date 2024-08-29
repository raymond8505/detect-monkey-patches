import { getNativeDef } from "./helpers"

describe('helpers',()=>{
    describe('getNativeDef',() => {
        it('returns the native definition of the given function name',()=>{
            expect(getNativeDef('foo')).toBe('function foo() { [native code] }')
        })
    })
})