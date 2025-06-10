// OpenSeadragon type declarations
// Code adapted from https://stackoverflow.com/a/67424184
declare global {
  interface Window {
    OpenSeadragon?: {
      Viewer: {
        prototype: {
          isOpen: () => boolean;
        };
        new (...args: any[]): OpenSeadragonViewer;
      };
    };
    __OSD_VIEWER__?: OpenSeadragonViewer;
  }
}

interface OpenSeadragonViewer {
  isOpen(): boolean;
}

export default function osdMonkeyPatch() {
  console.log('OpenSeadragon monkey-patch loaded');
  
  const waitForOSD = () => {
    if (window.OpenSeadragon && window.OpenSeadragon.Viewer) {
      console.log('OpenSeadragon detected, setting up patch');
      
      const originalIsOpen = window.OpenSeadragon.Viewer.prototype.isOpen;
      
      window.OpenSeadragon.Viewer.prototype.isOpen = function () {
        if (!window.__OSD_VIEWER__) {
          window.__OSD_VIEWER__ = this;
          console.log('Captured OpenSeadragon viewer:', this);
          
          // Restore original after first capture
          (window.OpenSeadragon!).Viewer.prototype.isOpen = originalIsOpen;
        }
        
        return originalIsOpen.call(this);
      };
    } else {
      setTimeout(waitForOSD, 50);
    }
  };
  
  waitForOSD();
}