import { TimerApp } from "./timer-app.mjs";

Hooks.once("init", () => {
  console.log("Simple Timer | Initializing module settings");

  game.settings.register("simple-timer", "allowPlayers", {
    name: game.i18n.localize("simple-timer.settings.allowPlayersName"),
    hint: game.i18n.localize("simple-timer.settings.allowPlayersHint2"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      console.log("Simple Timer | Allow players setting changed to:", value);
      ui.hotbar.render();
    },
  });
});

Hooks.on("ready", (app, html) => {



  const allowPlayers = game.settings.get("simple-timer", "allowPlayers");
  const canUseTimer = game.user.isGM || allowPlayers;

  if (!canUseTimer) {
    console.log("Simple Timer | User does not have permission to use timer");
    return;
  }else{
    const timeApp = new TimerApp;
    timeApp.render(true)
  }

  
});
