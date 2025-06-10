import { injectIframe } from "./utils/inject-iframe";
import { injectScript } from "./utils/inject-script";

export default async function main() {
  injectScript(chrome.runtime.getURL("osd-monkey-patch.js"));
  await new Promise(resolve => setTimeout(resolve, 100));

  injectScript(chrome.runtime.getURL("output-thread.js"));
  injectIframe(chrome.runtime.getURL("input-thread.html"));
}
