export interface FakeType {
  prototype: Record<string, { toString: () => string }>
};
declare global {
  interface Window {
    detectMonkeyPatches: () => Promise<PatchedProps>
    fixMonkeyPatch: (patchedPropName: string) => unknown
  }
}
export type MonkeyPatches = Array<Array<string>>

export type PatchedProps = Record<string, MonkeyPatches | string>