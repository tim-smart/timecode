# @timsmart/timecode

A `Timecode` utility class for working with SMPTE timecode.

## API

Here is a copy of `dist/index.d.ts`:

```ts
export interface ITimecodeObject {
  hours: number;
  minutes: number;
  seconds: number;
  frames: number;
}
export declare type TTimecodeInput = string | ITimecodeObject;
export interface ITimecodeOptions {
  framerate?: number;
  startOffset?: TTimecodeInput;
}
export declare class Timecode implements ITimecodeObject {
  hours: number;
  minutes: number;
  seconds: number;
  frames: number;

  constructor(input: TTimecodeInput | number, opts?: ITimecodeOptions);

  add(input: TTimecodeInput, subtract?: boolean): void;
  subtract(input: TTimecodeInput): void;
  frameCount(): number;
  toMilliseconds(): number;
  toSeconds(): number;
  toString(): string;
}
```
