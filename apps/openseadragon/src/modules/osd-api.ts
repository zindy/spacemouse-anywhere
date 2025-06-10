declare const OpenSeadragon: typeof import("openseadragon");

import { Motion } from "./kinetics";

export function applyMotionToOpenSeadragon(viewer: OpenSeadragon.Viewer, motion: Motion, justPressed:boolean[]) {
  const viewport = viewer.viewport;
  if (!viewport) return;

  // Home
  if (justPressed[1] == true) {
    console.log("1 was pressed...");
    viewport.goHome();
    return;
  }

  // button 1
  if (justPressed[12] == true) {
    const canvas = (viewer as any)._paperjsOverlayInfo?._canvas;
    //console.log("12 was pressed...", canvas.style['display']);
    if (canvas) {
      const isVisible = canvas.style['display'] == 'block' || canvas.style['display'] == ''
      canvas.style['display'] = isVisible ? 'none' : 'block';
    } else {
      console.warn('PaperJS overlay canvas not found.');
    }    
    return;
  }

  /*
  // Full screen
  if (justPressed[5] == true) {
    viewer.setFullScreen(!viewer.isFullPage());
    // Give focus to viewer canvas after fullscreen
    setTimeout(() => {
      const container = viewer.container;
      if (container) {
        console.log("refocussing...")
        container.focus?.(); // HTML element focus
      }
    }, 100); // Small delay to wait for fullscreen transition
    return;
  }
  */

  // Pan
  if (motion.panX !== 0 || motion.panY !== 0) {
    const pan = viewport.getCenter();
    const zoom = viewport.getZoom();
    const panScale = 1 / zoom; // adjust this formula as needed
    //console.log("zoom factor", 1/zoom);

    // panX and panY might need flipping depending on your coordinate system
    const newPan = pan.plus(new OpenSeadragon.Point(motion.panX * panScale, motion.panY * panScale));
    viewport.panTo(newPan);
  }

  // Zoom
  if (motion.zoom !== 0) {
    const zoom = viewport.getZoom();
    // 1 + zoom is an assumed zoom factor — adjust if necessary
    const newZoom = Math.min(Math.max(0.5, zoom * (1 + motion.zoom)), 136.213);
    viewport.zoomTo(newZoom);
  }

  // Rotation - OpenSeadragon doesn't have built-in 3D rotation,
  // but if you want to support image rotation (2D), you can try:
  if (false && motion.rotateZ !== 0) {
    const currentRotation = viewport.getRotation();
    viewport.setRotation(currentRotation + motion.rotateZ);
  }
}
