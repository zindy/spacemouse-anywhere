import { PerfMetrics } from "./input-thread";
import { ConfigV1, getConfig, onConfigChange, setConfig } from "./modules/config";
import { GamepadStatus, getGamepadSnapshot } from "./modules/device";
import { tick } from "./utils/tick";
import { updateIfChanged } from "./utils/update-if-changed";

export default async function main() {
  const statusElement = document.getElementById("status") as HTMLInputElement;
  const configForm = document.querySelector("form")!;

  const sensitivity = document.getElementById("sensitivity") as HTMLInputElement;

  const xElement = document.getElementById("x") as HTMLMeterElement;
  const yElement = document.getElementById("y") as HTMLMeterElement;
  const zElement = document.getElementById("z") as HTMLMeterElement;
  const rxElement = document.getElementById("rx") as HTMLMeterElement;
  const ryElement = document.getElementById("ry") as HTMLMeterElement;
  const rzElement = document.getElementById("rz") as HTMLMeterElement;

  const invertxElement = configForm.querySelector<HTMLInputElement>(`[name="invertx"]`)!;
  const invertyElement = configForm.querySelector<HTMLInputElement>(`[name="inverty"]`)!;
  const invertzElement = configForm.querySelector<HTMLInputElement>(`[name="invertz"]`)!;
  const invertrxElement = configForm.querySelector<HTMLInputElement>(`[name="invertrx"]`)!;
  const invertryElement = configForm.querySelector<HTMLInputElement>(`[name="invertry"]`)!;
  const invertrzElement = configForm.querySelector<HTMLInputElement>(`[name="invertrz"]`)!;

  const scanElement = document.getElementById("scan") as HTMLInputElement;
  const fpsElement = document.getElementById("fps") as HTMLInputElement;
  const latencyElement = document.getElementById("latency") as HTMLInputElement;

  // Button elements - assuming they exist in your HTML
  const buttonsContainer = document.getElementById("buttons-container");
  let buttonElements: HTMLInputElement[] = [];

  // Initialize button checkboxes dynamically based on detected buttons
  const initializeButtons = (buttonCount: number) => {
    if (!buttonsContainer || buttonElements.length === buttonCount) return;
    
    buttonsContainer.innerHTML = '';
    buttonElements = [];
    
    for (let i = 0; i < buttonCount; i++) {
      const label = document.createElement('label');
      label.style.display = 'inline-flex';
      label.style.alignItems = 'center';
      label.style.marginRight = '6px';
      label.style.marginBottom = '4px';
      label.style.fontSize = '11px';
      label.style.minWidth = '28px'; // Consistent width for alignment
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.disabled = true;
      checkbox.style.marginRight = '3px';
      checkbox.style.transform = 'scale(0.8)'; // Slightly smaller checkboxes
      
      const span = document.createElement('span');
      span.textContent = i.toString();
      span.style.minWidth = '12px'; // Consistent label width
      span.style.textAlign = 'left';
      
      label.appendChild(checkbox);
      label.appendChild(span);
      buttonsContainer.appendChild(label);
      
      buttonElements.push(checkbox);
    }
    
    // Make popup height dynamic based on button count
    if (buttonCount > 0) {
      const rows = Math.ceil(buttonCount / 8); // Assume ~8 buttons per row
      const extraHeight = Math.max(0, (rows - 1) * 20); // Add height for extra rows
      document.body.style.minHeight = `${320 + extraHeight}px`;
    }
  };

  const decodeStatus = (status: GamepadStatus) => {
    switch (status) {
      case GamepadStatus.Active:
        return "Active";
      case GamepadStatus.Disconnected:
        return "Disconnected";
      case GamepadStatus.Idle:
        return "Idle";
    }
  };

  const updateVisualization = (meter: HTMLMeterElement, value: number) => {
    const deadZone = 0;
    const maxOut = 1;

    updateIfChanged(meter, "value", value);

    if (Math.abs(value) <= deadZone) {
      updateIfChanged(meter, "optimum", value ? Math.sign(value) : 1);
    } else if (Math.abs(value) > maxOut) {
      updateIfChanged(meter, "optimum", -Math.sign(value));
    } else {
      updateIfChanged(meter, "optimum", value);
    }
  };

  const updateButtons = (buttons: boolean[]) => {
    // Initialize button elements if needed
    if (buttons.length > 0) {
      initializeButtons(buttons.length);
    }
    
    // Update button states
    buttons.forEach((pressed, index) => {
      if (buttonElements[index]) {
        buttonElements[index].checked = pressed;
      }
    });
  };

  const onTick = async () => {
    const snapshot = getGamepadSnapshot();
    statusElement.value = decodeStatus(snapshot.status);
    const [x, y, z, rx, ry, rz] = snapshot.axes;
    updateVisualization(xElement, x);
    updateVisualization(yElement, y);
    updateVisualization(zElement, z);
    updateVisualization(rxElement, rx);
    updateVisualization(ryElement, ry);
    updateVisualization(rzElement, rz);
    
    // Update button display
    updateButtons(snapshot.buttons);
  };

  configForm.addEventListener("input", () => {
    const newConfig: ConfigV1 = {
      sensitivity: parseInt(sensitivity.value),
      x: invertxElement.checked ? -1 : 1,
      y: invertyElement.checked ? -1 : 1,
      z: invertzElement.checked ? -1 : 1,
      rx: invertrxElement.checked ? -1 : 1,
      ry: invertryElement.checked ? -1 : 1,
      rz: invertrzElement.checked ? -1 : 1,
    };

    setConfig(newConfig);
  });

  const applyConfig = (config: ConfigV1) => {
    console.log("[config] updated", config);
    sensitivity.value = config.sensitivity.toString();
    invertxElement.checked = config.x < 0;
    invertyElement.checked = config.y < 0;
    invertzElement.checked = config.z < 0;
    invertrxElement.checked = config.rx < 0;
    invertryElement.checked = config.ry < 0;
    invertrzElement.checked = config.rz < 0;
  };

  getConfig().then(applyConfig);
  onConfigChange(applyConfig);

  tick(onTick);

  setInterval(async () => {
    try {
      const perf = (await chrome.runtime.sendMessage("requestperf")) as PerfMetrics;
      fpsElement.value = (1000 / perf.avgBufferInterval).toFixed(0);
      latencyElement.value = perf.avgLatency.toFixed(0);
      scanElement.value = (1000 / perf.avgScanInterval).toFixed(0);
    } catch {
      // sendMessage will throw Error if the activeTab is not the one containing the openseadragon viewer
    }
  }, 200);
}

main();