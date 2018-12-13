export interface ITimecodeObject {
  hours: number;
  minutes: number;
  seconds: number;
  frames: number;
}

export type TTimecodeInput = string | ITimecodeObject;

export interface ITimecodeOptions {
  framerate?: number;
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

    return {
      frames: input.frames,
      hours: input.hours,
      minutes: input.minutes,
      seconds: input.seconds
    };
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
    framerate: 29.97
  };

  constructor(input: TTimecodeInput | number, opts?: ITimecodeOptions) {
    if (opts) {
      Object.assign(this.options, opts);
    }

    if (typeof input === "number") {
      Object.assign(this, this.frameCountToObject(input));
    } else {
      Object.assign(this, Timecode.parseInput(input));
    }
  }

  // Adds the input to the current timecode and returns a new Timecode instance
  public add(input: TTimecodeInput, subtract: boolean = false): Timecode {
    const frames =
      typeof input === "number"
        ? input
        : Timecode.objectToFrameCount(
            Timecode.parseInput(input),
            this.options.framerate
          );

    let newCount = subtract
      ? this.frameCount() - frames
      : this.frameCount() + frames;

    if (newCount < 0) {
      newCount = 0;
    }

    return new Timecode(this.frameCountToObject(newCount), this.options);
  }

  public subtract(input: TTimecodeInput): Timecode {
    return this.add(input, true);
  }

  public frameCount(): number {
    const count = Timecode.objectToFrameCount(this, this.options.framerate);

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
      hours: Math.floor(count / (fps * 60 * 60)) % 24,
      minutes: Math.floor(count / (fps * 60)) % 60,
      seconds: Math.floor(count / fps) % 60
    };
  }
}
