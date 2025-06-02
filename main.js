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

Hooks.on("renderHotbar", (app, html) => {
  if (html.find("#simple-timer").length) return;

  const actionBar = html.find("#action-bar");
  if (!actionBar.length) return;

  const allowPlayers = game.settings.get("simple-timer", "allowPlayers");
  const canUseTimer = game.user.isGM || allowPlayers;

  if (!canUseTimer) {
    console.log("Simple Timer | User does not have permission to use timer");
    return;
  }

  const simpleTimer = $(`
    <div id="simple-timer">
      <div class="timer-display" id="timer-display">00:00:00</div>
      <select class="timer-mode" id="timer-mode">
        <option value="countdown">${game.i18n.localize(
          "simple-timer.countdown"
        )}</option>
        <option value="countup">${game.i18n.localize(
          "simple-timer.countup"
        )}</option>
      </select>
      <div class="timer-controls">
        <button class="timer-btn start-btn" id="start-btn">${game.i18n.localize(
          "simple-timer.start"
        )}</button>
        <button class="timer-btn stop-btn" id="stop-btn">${game.i18n.localize(
          "simple-timer.stop"
        )}</button>
        <button class="timer-btn clean-btn" id="clean-btn">${game.i18n.localize(
          "simple-timer.clean"
        )}</button>
      </div>
    </div>
  `);

  let timerState = {
    isRunning: false,
    seconds: 0,
    targetSeconds: 0,
    mode: "countdown",
    interval: null,
  };

  function formatTime(totalSeconds) {
    const hours = Math.floor(Math.abs(totalSeconds) / 3600);
    const mins = Math.floor((Math.abs(totalSeconds) % 3600) / 60);
    const secs = Math.abs(totalSeconds) % 60;
    const sign = totalSeconds < 0 ? "-" : "";
    return `${sign}${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function applyTimeMask(input) {
    input.on("input", function () {
      let value = this.value.replace(/\D/g, "");

      if (value.length > 6) {
        value = value.substring(0, 6);
      }

      let formatted = "";
      if (value.length >= 1) {
        formatted += value.substring(0, Math.min(2, value.length));
      }
      if (value.length >= 3) {
        formatted += ":" + value.substring(2, Math.min(4, value.length));
      }
      if (value.length >= 5) {
        formatted += ":" + value.substring(4, 6);
      }

      this.value = formatted;
    });

    input.on("keypress", function (e) {
      const char = String.fromCharCode(e.which);
      if (!/[0-9:]/.test(char) && e.which !== 8 && e.which !== 13) {
        e.preventDefault();
      }
    });
  }

  function parseTimeString(timeStr) {
    const parts = timeStr.split(":");
    let hours = 0,
      minutes = 0,
      seconds = 0;

    if (parts.length === 3) {
      hours = parseInt(parts[0]) || 0;
      minutes = parseInt(parts[1]) || 0;
      seconds = parseInt(parts[2]) || 0;
    } else if (parts.length === 2) {
      minutes = parseInt(parts[0]) || 0;
      seconds = parseInt(parts[1]) || 0;
    } else if (parts.length === 1) {
      seconds = parseInt(parts[0]) || 0;
    }

    if (minutes >= 60 || seconds >= 60) {
      return null;
    }

    return hours * 3600 + minutes * 60 + seconds;
  }

  function updateDisplay() {
    simpleTimer.find("#timer-display").text(formatTime(timerState.seconds));
  }

  simpleTimer.find("#timer-display").on("dblclick", function () {
    if (timerState.isRunning) return;

    const currentTime = $(this).text();
    const input = $(
      `<input type="text" class="timer-input" value="${currentTime}" maxlength="8">`
    );

    $(this).hide().after(input);

    applyTimeMask(input);

    input.focus().select();

    function saveTime() {
      const newTime = input.val();
      const totalSeconds = parseTimeString(newTime);

      if (totalSeconds !== null) {
        timerState.targetSeconds = totalSeconds;
        timerState.seconds = timerState.targetSeconds;
      }

      input.remove();
      $(simpleTimer.find("#timer-display")).show();
      updateDisplay();
    }

    input.on("blur", saveTime);
    input.on("keypress", function (e) {
      if (e.which === 13) saveTime();
    });
  });

  simpleTimer.find("#timer-mode").on("change", function () {
    if (timerState.isRunning) {
      $(this).val(timerState.mode);
      return;
    }
    timerState.mode = $(this).val();
  });

  simpleTimer.find("#start-btn").on("click", function () {
    if (timerState.isRunning) return;

    timerState.isRunning = true;
    simpleTimer.find("#timer-mode").prop("disabled", true);

    timerState.interval = setInterval(() => {
      if (timerState.mode === "countdown") {
        timerState.seconds--;
        if (timerState.seconds <= 0) {
          timerState.seconds = 0;
          simpleTimer.find("#stop-btn").click();
          ui.notifications.info(
            game.i18n.localize("simple-timer.timerFinished")
          );
        }
      } else {
        timerState.seconds++;
      }
      updateDisplay();
    }, 1000);
  });

  simpleTimer.find("#stop-btn").on("click", function () {
    if (!timerState.isRunning) return;

    timerState.isRunning = false;
    clearInterval(timerState.interval);
    simpleTimer.find("#timer-mode").prop("disabled", false);
  });

  simpleTimer.find("#clean-btn").on("click", function () {
    if (timerState.isRunning) return;

    timerState.seconds = 0;
    timerState.targetSeconds = 0;
    updateDisplay();
  });

  const hotbarContainer = html.closest("#hotbar");
  if (hotbarContainer.length) {
    hotbarContainer.append(simpleTimer);
  } else {
    actionBar.parent().append(simpleTimer);
  }
});
