# SpaceMouse Driver for OpenSeadragon viewer

Bring your [3DConnexion SpaceMouse](https://3dconnexion.com/us/spacemouse/) to the [OpenSeadragon viewer](https://openseadragon.github.io/).

You can test it either on the OpenSeadragon page (examples) or on the [Virtual Pathology at the University of Leeds](https://www.virtualpathology.leeds.ac.uk/slides/library/) site.


## System requirements

- **Chromium-based browser only**. Safari is not supported.
- **All models of SpaceMouse**, though I've only tested on the SpaceMouse Wireless in both wired and wireless mode. If your model doesn't work, please report it as bug.
- **Windows** and **Linux** are fully supported. **MacOS** is experimentally supported and not tested. If you are Mac user, please [report a bug](https://github.com/chuanqisun/sketchup-web-spacemouse/issues/new) if it does not work on your device.

## Inside the OpenSeadragon viewer

The extension allows scene manipuation in Orbit mode. You can access the preferences and debugging UI via the extension icon button. There are some caveats:

1. Rolling Left/Right is ignored. 
2. Zooming In/Out is handled by the z-axis
3. No image rotation support (wasn't useful for my application)
4. For now, websites must be added the manifest individually.
5. The "FIT" button recenters the image.

## How does this work?

SpaceMouse input is scanned from the browser [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getGamepads) and works across platforms.

OpenSeadragon viewer does not provide official API for manipulating the camera or the scene. The extension simulates keyboard and mouse drag/scroll events to perform the navigation.

## Roadmap

I'd like to gather feedback and build features that matter the most to the users. Here are a few ideas, not necessarily ranked in any order. If you have an idea, please let me know by [submitting an issue](https://github.com/chuanqisun/sketchup-web-spacemouse/issues/new).

- **Button binding**: Refine button interactions (just pressed, is pressed, is released), add more interactions.

## Disclaimer

Take this as an experiment rather than a finished extension. Especially since (for now) you will have to add your own sites to the manifest.

## Credit

- [spacemouse-anywhere (sketchup)](https://github.com/chuanqisun/spacemouse-anywhere/tree/master/apps/sketchup) for providing a solid starting point
- [SpaceMouse TinkerCAD](https://github.com/arpruss/spacemouse-tinkercad)
