import { EMPTY_AXES, GamepadAxes, GamepadSnapshot, GamepadStatus } from "./device";

/**
 * Get a function that when recalled repeatedly, the given change handler is invoked
 * with the old and new values for each change.
 *
 * The scanner won't invoke the change handler until the first two values are available,
 * and the first of which must be truthy.
 */
export function getScanner<T>(onChange: (oldValue: T, newValue: T) => any) {
  let oldValue: T | undefined = undefined;

  return (newValue: T) => {
    if (oldValue) {
      onChange(oldValue, newValue);
    }
    oldValue = newValue;
  };
}

export interface FrameBuffer {
  axes: GamepadAxes;
  buttons: boolean[];
  interval: number;
  status: GamepadStatus;
  isRead: boolean;
  frameCount: number;
}

export interface FrameBufferChange {
  axes: GamepadAxes;
  buttons: boolean[];
  interval: number;
  status: GamepadStatus;
}

export function getInterpolatedFrame(oldSnapshot: GamepadSnapshot, newSnapshot: GamepadSnapshot): FrameBufferChange {
  const interval = newSnapshot.timestamp - oldSnapshot.timestamp;
  return {
    axes: newSnapshot.axes.map((axis, i) => interval * axis) as any as GamepadAxes,
    buttons: newSnapshot.buttons,
    interval,
    status: newSnapshot.status,
  };
}

export function getUpdatedBuffer(buffer: FrameBuffer, change: FrameBufferChange): FrameBuffer {
  return {
    axes: change.axes.map((axis, i) => axis + buffer.axes[i]) as any as GamepadAxes,
    buttons: change.buttons,
    interval: change.interval + buffer.interval,
    // Unless buffer was just read, the active status will be sticky
    status: buffer.isRead || buffer.status !== GamepadStatus.Active ? change.status : buffer.status,
    isRead: buffer.isRead,
    frameCount: buffer.frameCount + 1,
  };
}

export function getInitialBuffer(): FrameBuffer {
  return {
    axes: EMPTY_AXES,
    buttons: [],
    interval: 0,
    status: GamepadStatus.Disconnected,
    isRead: false,
    frameCount: 0,
  };
}

export function getConsumedBuffer(buffer: FrameBuffer): FrameBuffer {
  return {
    axes: EMPTY_AXES,
    buttons: [],
    interval: 0,
    status: buffer.status,
    isRead: true,
    frameCount: 0,
  };
}

// TODO: clean up legacy logic

export interface Motion {
  zoom: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  panX: number;
  panY: number;
  buttons: boolean[];
}

export function getMotion(interval: number, snapshot: GamepadSnapshot): Motion {
  const { status, axes, buttons } = snapshot;
  const [mouseX, mouseY, mouseZ, mouseRotateX, mouseRotateY, mouseRotateZ] = axes;

  if (status === GamepadStatus.Active) {
    return {
      zoom: mouseZ * 5 * interval,
      rotateX: mouseRotateX * interval,
      rotateY: mouseRotateY * interval,
      rotateZ: mouseRotateZ * interval,
      panX: mouseX * interval,
      panY: mouseY * interval,
      buttons: buttons,
    };
  }

  return {
    zoom: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    panX: 0,
    panY: 0,
    buttons: [],
  };
}
