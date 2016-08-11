/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

/* global chrome */

let {EventTarget, emit} = require("../../lib/eventTarget");

let panel = EventTarget();
panel.port = EventTarget();

chrome.runtime.onConnect.addListener(function(port)
{
  if (port.name == "panel")
  {
    panel._target = port;
    emit(panel, "show");

    port.onDisconnect.addListener(port =>
    {
      panel._target = null;
      emit(panel, "hide");
    });

    port.onMessage.addListener(message =>
    {
      emit(panel.port, message.eventName, ...message.args);
    });
  }
});

panel.port.emit = function(eventName, ...args)
{
  if (panel._target)
  {
    // "Normalize" args, Firefox won't accept proxies via messaging (bug 1269327)
    args = JSON.parse(JSON.stringify(args));
    panel._target.postMessage({eventName, args});
  }
};

panel.hide = function()
{
  panel.port.emit("_hide");
};

module.exports = panel;