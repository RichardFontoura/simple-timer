export class TimerApp extends foundry.applications.api.ApplicationV2 {
  static instances = new Map();
  static DEFAULT_OPTIONS = {
    form: { preventEscapeClose: true },
    position:{
        height: "auto",
        width: "auto",
        left: 0
    },
  };

  constructor() {
    super();
    this.timerState = {
      isRunning: false,
      seconds: 0,
      targetSeconds: 0,
      mode: "countdown",
      interval: null,
    };
    TimerApp.instances.set(this.id, this);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "simple-timer-app-" + foundry.utils.randomID(),
      classes: ["simple-timer-app"],
      popOut: true,
      template: null, 
    });
  }

  async render(force = false, options = {}) {
    await super.render(force, options);
    const el = this.element;
    const closeButton = el.querySelector(".header-control.icon.fa-solid.fa-xmark");
    closeButton.remove()
    const inner = el.querySelector(".window-content");
    inner.style.padding = 0;
    el.classList.add("simple-timer-dom");
    this.dodajAktywneListiery(el);
  }
  async close(options = {}) {
    if (options.closeKey) {
      return false;
    }
    return super.close(options);
  }
  async _renderHTML() {
    // Tworzymy HTML wprost
    const html = `
      <div id="simple-timer">
        <div class="timer-display" id="timer-display">00:00:00</div>
        <select class="timer-mode" id="timer-mode">
          <option value="countdown">${game.i18n.localize("simple-timer.countdown")}</option>
          <option value="countup">${game.i18n.localize("simple-timer.countup")}</option>
        </select>
        <div class="timer-controls">
          <button class="timer-btn start-btn" id="start-btn">${game.i18n.localize("simple-timer.start")}</button>
          <button class="timer-btn stop-btn" id="stop-btn">${game.i18n.localize("simple-timer.stop")}</button>
          <button class="timer-btn clean-btn" id="clean-btn">${game.i18n.localize("simple-timer.clean")}</button>
        </div>
      </div>
    `;
    return html;
  }

  async _replaceHTML(result, html) {
    html.innerHTML = result;
  }

  getData() {
    return { timerState: this.timerState };
  }

  dodajAktywneListiery(html) {
    const timerDisplay = html.querySelector("#timer-display");
    const timerMode = html.querySelector("#timer-mode");
    const startBtn = html.querySelector("#start-btn");
    const stopBtn = html.querySelector("#stop-btn");
    const cleanBtn = html.querySelector("#clean-btn");

    const formatTime = (totalSeconds) => {
      const hours = Math.floor(Math.abs(totalSeconds) / 3600);
      const mins = Math.floor((Math.abs(totalSeconds) % 3600) / 60);
      const secs = Math.abs(totalSeconds) % 60;
      const sign = totalSeconds < 0 ? "-" : "";
      return `${sign}${hours.toString().padStart(2,"0")}:${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
    };

    const updateDisplay = () => { timerDisplay.textContent = formatTime(this.timerState.seconds); };

    // Podwójne kliknięcie, edycja czasu
    timerDisplay.addEventListener("dblclick", () => {
      if (this.timerState.isRunning) return;
      const input = document.createElement("input");
      input.type = "text";
      input.value = timerDisplay.textContent;
      input.classList.add("timer-input");
      timerDisplay.replaceWith(input);
      input.focus();
      const saveTime = () => {
        const parts = input.value.split(":").map(x => parseInt(x)||0);
        let seconds = 0;
        if(parts.length === 3) seconds = parts[0]*3600 + parts[1]*60 + parts[2];
        else if(parts.length === 2) seconds = parts[0]*60 + parts[1];
        else seconds = parts[0];
        this.timerState.targetSeconds = seconds;
        this.timerState.seconds = seconds;
        input.replaceWith(timerDisplay);
        updateDisplay();
      };
      input.addEventListener("blur", saveTime);
      input.addEventListener("keypress", (e)=>{ if(e.key==="Enter") saveTime(); });
    });

    // Zmiana trybu
    timerMode.addEventListener("change", () => {
      if(this.timerState.isRunning) timerMode.value = this.timerState.mode;
      else this.timerState.mode = timerMode.value;
    });

    // Start
    startBtn.addEventListener("click", () => {
      if(this.timerState.isRunning) return;
      this.timerState.isRunning = true;
      timerMode.disabled = true;
      this.timerState.interval = setInterval(()=>{
        if(this.timerState.mode==="countdown") {
          this.timerState.seconds--;
          if(this.timerState.seconds<=0){
            this.timerState.seconds = 0;
            stopBtn.click();
            ui.notifications.info(game.i18n.localize("simple-timer.timerFinished"));
          }
        } else this.timerState.seconds++;
        updateDisplay();
      },1000);
    });

    // Stop
    stopBtn.addEventListener("click", ()=>{
      if(!this.timerState.isRunning) return;
      this.timerState.isRunning = false;
      clearInterval(this.timerState.interval);
      timerMode.disabled = false;
    });

    // Reset
    cleanBtn.addEventListener("click", ()=>{
      if(this.timerState.isRunning) return;
      this.timerState.seconds = 0;
      this.timerState.targetSeconds = 0;
        updateDisplay();
    })
}
}