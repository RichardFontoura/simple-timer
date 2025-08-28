import { TimerApp } from "./src/app/timer-app.mjs";
import { MODULE_ID, registerSettings, isV13 } from "./src/config/config.mjs";

Hooks.once("init", () => {
  console.log("Simple Timer | Initializing module settings");
  registerSettings();
});

Hooks.on("ready", (app, html) => {
  const canUseTimer =
    game.user.isGM || game.settings.get(MODULE_ID, "allowPlayers");

  if (canUseTimer) {
    const timeApp = new TimerApp();
    timeApp.render(true);
  }
});
