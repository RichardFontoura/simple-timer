export const MODULE_ID = "simple-timer";

export function registerSettings() {
  game.settings.register(MODULE_ID, "allowPlayers", {
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
}

export function isV13() {
  return !foundry.utils.isNewerVersion("13", game.version);
}
