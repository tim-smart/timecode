export interface ITimecodeObject {
  hours: number;
  minutes: number;
  seconds: number;
  frames: number;
}

export type TTimecodeInput = string | ITimecodeObject;

export interface ITimecodeOptions {
  framerate?: number;

  // Ensures frame counts etc. are accurate
  // Defaults to 01:00:00:00
  startOffset?: TTimecodeInput;
}

function pad(input: number): string {
  if (input < 10) {
    return `0${input}`;
  }
  return `${input}`;
}

export class Timecode implements ITimecodeObject {
  private static parseInput(input: TTimecodeInput): ITimecodeObject {
    if (typeof input === "string") {
      const parts = input.split(":");
      if (parts.length !== 4) {
        throw new Error("Input string is not a valid SMPTE timecode.");
      }

      return {
        frames: +parts[3],
        hours: +parts[0],
        minutes: +parts[1],
        seconds: +parts[2]
      };
    }

    return input;
  }

  private static objectToFrameCount(
    input: ITimecodeObject,
    framerate: number
  ): number {
    let count = 0;

    count += input.hours * 60 * 60 * framerate;
    count += input.minutes * 60 * framerate;
    count += input.seconds * framerate;
    count += input.frames;

    return count;
  }

  public hours = 0;
  public minutes = 0;
  public seconds = 0;
  public frames = 0;

  private options: Required<ITimecodeOptions> = {
    framerate: 29.97,
    startOffset: {
      frames: 0,
      hours: 1,
      minutes: 0,
      seconds: 0
    }
  };
  private startOffsetFrameCount: number;

  constructor(input: TTimecodeInput | number, opts?: ITimecodeOptions) {
    if (opts) {
      Object.assign(this.options, opts);
    }

    if (typeof input === "number") {
      Object.assign(this, this.frameCountToObject(input));
    } else {
      Object.assign(this, Timecode.parseInput(input));
    }

    this.startOffsetFrameCount = Timecode.objectToFrameCount(
      Timecode.parseInput(this.options.startOffset),
      this.options.framerate
    );
  }

  public add(input: TTimecodeInput, subtract: boolean = false) {
    const frames =
      typeof input === "number"
        ? input
        : Timecode.objectToFrameCount(
            Timecode.parseInput(input),
            this.options.framerate
          );

    let newCount = this.startOffsetFrameCount;
    newCount += subtract
      ? this.frameCount() - frames
      : this.frameCount() + frames;

    Object.assign(this, this.frameCountToObject(newCount));
  }

  public subtract(input: TTimecodeInput) {
    this.add(input, true);
  }

  public frameCount(): number {
    let count = Timecode.objectToFrameCount(this, this.options.framerate);
    count -= this.startOffsetFrameCount;

    if (count < 0) {
      return 0;
    }
    return count;
  }

  public toMilliseconds(): number {
    return (1000 / this.options.framerate) * this.frameCount();
  }

  public toSeconds(): number {
    return (1 / this.options.framerate) * this.frameCount();
  }

  public toString(): string {
    return `${pad(this.hours)}:${pad(this.minutes)}:${pad(this.seconds)}:${pad(
      this.frames
    )}`;
  }

  private frameCountToObject(count: number): ITimecodeObject {
    const fps = this.options.framerate;

    return {
      frames: count % fps,
      hours: Math.floor(count / (fps * 3600)) % 24,
      minutes: Math.floor(count / (fps * 60)) % 60,
      seconds: Math.floor(count / fps) % 60
    };
  }
}
