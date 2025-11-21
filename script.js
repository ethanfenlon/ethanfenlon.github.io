const form = document.querySelector('.form');
const useLocationButton = document.getElementById('use-location');
const originInput = document.getElementById('origin');
const destinationInput = document.getElementById('destination');
const preferenceSelect = document.getElementById('preference');
const results = document.querySelector('.results');
const clearButton = document.querySelector('.ghost-button');
const voiceButtons = document.querySelectorAll('.voice-button');

const SpeechRecognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);
let recognition;
let listeningTarget = null;

// Mock route states to demonstrate UI switching without real data yet.
const mockRoutes = {
  fastest: [
    {
      label: 'Fastest · 24 min',
      title: 'Alexanderplatz → Warschauer Straße',
      steps: [
        'Walk 5 min to S+U Alexanderplatz',
        'S5 towards Strausberg Nord — track 2 — arrives in 3 min',
        'Exit at Warschauer Straße towards East Side Gallery'
      ],
      pills: ['Departs 14:03', 'Live']
    },
    {
      label: 'Fewest transfers · 27 min',
      title: 'Alexanderplatz → Warschauer Straße',
      steps: [
        'Walk 2 min to U Alexanderplatz (U1)',
        'U1 towards Warschauer Straße — arrives in 5 min',
        'Stay on to final stop · Exit towards footbridge'
      ],
      pills: ['Departs 14:05', 'Platform B']
    }
  ],
  accessible: [
    {
      label: 'Accessible · 30 min',
      title: 'Alexanderplatz → Warschauer Straße',
      steps: [
        'Lift at S+U Alexanderplatz (entrance A)',
        'S3 towards Erkner — level boarding — arrives in 6 min',
        'Ramps at Warschauer Straße (south exit)'
      ],
      pills: ['Departs 14:07', 'Step-free']
    }
  ]
};

function renderRoutes(type) {
  const routeSet = mockRoutes[type] || mockRoutes.fastest;
  results.innerHTML = routeSet
    .map(route => {
      const steps = route.steps.map(step => `<li>${step}</li>`).join('');
      const pills = route.pills
        .map(text => `<span class="pill ${text === 'Live' ? 'live' : ''}">${text}</span>`)
        .join('');
      return `
        <div class="result-card">
          <div class="result-main">
            <p class="eyebrow">${route.label}</p>
            <h3>${route.title}</h3>
            <ul class="steps">${steps}</ul>
          </div>
          <div class="times">${pills}</div>
        </div>
      `;
    })
    .join('');
}

form?.addEventListener('submit', event => {
  event.preventDefault();
  const preference = preferenceSelect?.value || 'fastest';
  renderRoutes(preference === 'Accessible route' ? 'accessible' : 'fastest');
});

clearButton?.addEventListener('click', () => {
  if (originInput) originInput.value = 'Current location';
  if (destinationInput) destinationInput.value = '';
  if (preferenceSelect) preferenceSelect.selectedIndex = 0;
  renderRoutes('fastest');
});

function setVoiceButtonActive(button, isActive) {
  if (!button) return;
  button.classList.toggle('active', isActive);
  button.setAttribute('aria-pressed', String(isActive));
  button.title = isActive ? 'Listening…' : 'Start voice input';
}

function getInputForTarget(target) {
  if (target === 'origin') return originInput;
  if (target === 'destination') return destinationInput;
  return null;
}

function resetVoiceState() {
  if (listeningTarget?.button) {
    setVoiceButtonActive(listeningTarget.button, false);
  }
  listeningTarget = null;
}

function startListening(targetName, button) {
  if (!recognition) return;

  const input = getInputForTarget(targetName);
  if (!input) return;

  if (listeningTarget) {
    recognition.stop();
    resetVoiceState();
  }

  listeningTarget = { input, button, targetName };
  setVoiceButtonActive(button, true);
  input.focus();
  recognition.start();
}

voiceButtons.forEach(button => {
  button.title = 'Start voice input';

  if (!SpeechRecognition) {
    button.disabled = true;
    button.title = 'Voice input not supported in this browser';
    return;
  }

  button.addEventListener('click', () => {
    const target = button.getAttribute('data-target');
    if (!target) return;

    if (listeningTarget?.button === button) {
      recognition?.stop();
      resetVoiceState();
      return;
    }

    startListening(target, button);
  });
});

function setOriginValue(value) {
  if (!originInput) return;
  originInput.value = value;
}

function toggleLocationButton(disabled, label) {
  if (!useLocationButton) return;
  useLocationButton.disabled = disabled;
  useLocationButton.textContent = label;
}

function handleLocationError(error) {
  const fallbackMessage = 'Unable to fetch your location';
  const errorLabel = error?.message ? `${fallbackMessage}: ${error.message}` : fallbackMessage;
  setOriginValue(errorLabel);
  toggleLocationButton(false, 'Use location');
}

useLocationButton?.addEventListener('click', () => {
  if (!navigator?.geolocation) {
    setOriginValue('Geolocation is not supported in this browser');
    return;
  }

  toggleLocationButton(true, 'Detecting…');
  setOriginValue('Detecting current location…');

  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      const formatted = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      setOriginValue(formatted);
      toggleLocationButton(false, 'Use location');
    },
    handleLocationError,
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
});

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.addEventListener('result', event => {
    const transcript = event.results?.[0]?.[0]?.transcript?.trim();
    if (transcript && listeningTarget?.input) {
      listeningTarget.input.value = transcript;
      listeningTarget.input.focus();
    }
  });

  recognition.addEventListener('error', event => {
    if (listeningTarget?.input) {
      listeningTarget.input.value = `Voice input error: ${event.error}`;
    }
    resetVoiceState();
  });

  recognition.addEventListener('end', () => {
    resetVoiceState();
  });
}

// Render initial mock data
renderRoutes('fastest');

