import type { GamepadSnapshotBuffer } from "./input-thread";
import { GamepadStatus } from "./modules/device";
import { getMotion } from "./modules/kinetics";
import { applyMotionToOpenSeadragon } from "./modules/osd-api";
import { tick } from "./utils/tick";

export default async function main() {
  console.log("content injection live");
  
  const viewer = (window as any).__OSD_VIEWER__;
  if (!viewer) {
    console.warn("OpenSeadragon viewer not found");
    return;
  }

  const getFrameScanner = <T>(onFrameChange: (oldFrame: T, newFrame: T) => any) => {
    let oldFrame: T | undefined = undefined;
    return (frame: T) => {
      if (oldFrame) {
        onFrameChange(oldFrame, frame);
      }
      oldFrame = frame;
    };
  };

  let restoreCommandId: number | null = null;

  const frameScanner = getFrameScanner((oldFrame: GamepadSnapshotBuffer, newFrame: GamepadSnapshotBuffer) => {
    if (newFrame.status !== GamepadStatus.Active) return;


    //const interval = newFrame.timestamp - oldFrame.timestamp;
    //Here we use interval as a fixed global setting to adjust the sensitivity middle point (not too fast, not too slow...)
    const interval = 0.002;
    const motion = getMotion(interval, newFrame);

    //We need to detect new key presses
    const justPressed = oldFrame.buttons.map((val, i) => (val == false && newFrame.buttons[i] == true ? true : false));

    //console.log("[config] frame", newFrame.axes);
    //console.log("[buttons]",newFrame.buttons);
    //console.log("[config] motion vector", motion);
    applyMotionToOpenSeadragon(viewer, motion, justPressed);
  });

  let sendTime = 0;
  let latency = 0;
  const proxy = document.getElementById("spacemouse-extension") as HTMLIFrameElement;
  window.addEventListener("message", (e) => {
    if (e.data.type !== "frame") return;
    frameScanner(e.data as GamepadSnapshotBuffer);
    latency = performance.now() - sendTime;
  });

  tick(() => {
    sendTime = performance.now();
    proxy.contentWindow?.postMessage(
      {
        type: "requestframe",
        timestamp: performance.now(),
        latency,
      },
      "*"
    );
  });
}
