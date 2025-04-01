let timer;
let seconds = 0;
const display = document.getElementById("display");

// Create audio context for reliable playback
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let alarmSound;

// Mobile menu toggle
const mobileMenu = document.getElementById("mobile-menu");
const navbarMenu = document.querySelector(".navbar-menu");

mobileMenu.addEventListener("click", () => {
  mobileMenu.classList.toggle("active");
  navbarMenu.classList.toggle("active");
});

// Timer controls
document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("stop").addEventListener("click", stopTimer);
document.getElementById("reset").addEventListener("click", resetTimer);

// Initialize alarm sound
function initAlarmSound() {
  const externalSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3");
  externalSound.load();
  externalSound.loop = true; // Enable looping

  externalSound.addEventListener("canplaythrough", () => {
    alarmSound = externalSound;
  }, { once: true });

  externalSound.addEventListener("error", () => {
    createOscillatorAlarm();
  }, { once: true });
}

// Fallback alarm using Web Audio API
function createOscillatorAlarm() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = 800;
  gainNode.gain.value = 0.5;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  alarmSound = {
    play: function () {
      oscillator.start();
      this.isPlaying = true;
    },
    pause: function () {
      if (this.isPlaying) {
        oscillator.stop();
        this.isPlaying = false;
      }
    },
    currentTime: 0,
    isPlaying: false,
  };
}

// Initialize alarm sound on page load
initAlarmSound();

function startTimer() {
  if (timer) return;

  const hours = parseInt(document.getElementById("hours").value) || 0;
  const minutes = parseInt(document.getElementById("minutes").value) || 0;
  const secs = parseInt(document.getElementById("seconds").value) || 0;

  const totalSeconds = hours * 3600 + minutes * 60 + secs;
  if (totalSeconds <= 0) {
    alert("Please set a valid time duration");
    return;
  }

  seconds = 0;
  display.textContent = "00:00:00";

  timer = setInterval(() => {
    seconds++;
    display.textContent = formatTime(seconds);
    if (seconds >= totalSeconds) {
      playAlarm();
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  if (alarmSound) {
    alarmSound.loop = false;
    if (alarmSound.pause) alarmSound.pause();
    alarmSound.currentTime = 0;
  }
  timer = null;
}

function resetTimer() {
  seconds = 0;
  display.textContent = "00:00:00";
  stopTimer();
}

function playAlarm() {
  if (!alarmSound) return;
  try {
    alarmSound.currentTime = 0;
    alarmSound.play().catch((e) => {
      console.error("Audio playback failed:", e);
      visualAlert();
    });
  } catch (e) {
    console.error("Audio error:", e);
    visualAlert();
  }
}

function visualAlert() {
  display.style.color = "red";
  display.style.fontWeight = "bold";
  setTimeout(() => {
    display.style.color = "";
    display.style.fontWeight = "";
  }, 2000);
}

function formatTime(sec) {
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const remainingSec = sec % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(remainingSec).padStart(2, "0")}`;
}

// Time presets
document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    if (this.dataset.hours) {
      document.getElementById("hours").value = this.dataset.hours;
      document.getElementById("minutes").value = 0;
      document.getElementById("seconds").value = 0;
    } else {
      document.getElementById("hours").value = 0;
      document.getElementById("minutes").value = this.dataset.minutes;
      document.getElementById("seconds").value = 0;
    }
  });
});