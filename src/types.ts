export interface FakeType {
    prototype: Record<string, { toString: () => string }>
  };
  
  export type MonkeyPatches = Array<Array<string>>
  
  export type PatchedProps = Record<string,MonkeyPatches>