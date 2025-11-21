const form = document.querySelector('.form');
const useLocationButton = document.getElementById('use-location');
const originInput = document.getElementById('origin');
const preferenceSelect = document.getElementById('preference');
const results = document.querySelector('.results');

// Mock route states to demonstrate UI switching without real data yet.
const mockRoutes = {
  fastest: [
    {
      label: 'Fastest · 24 min',
      title: 'Alexanderplatz → Warschauer Straße',
      steps: [
        'Walk 5 min to S+U Alexanderplatz',
        'S5 towards Strausberg Nord · Track 2 · arrives in 3 min',
        'Get off at Warschauer Straße · Exit towards East Side Gallery'
      ],
      pills: ['Departs 14:03', 'Live']
    },
    {
      label: 'Fewest transfers · 27 min',
      title: 'Alexanderplatz → Warschauer Straße',
      steps: [
        'Walk 2 min to U Alexanderplatz (U1)',
        'U1 towards Warschauer Straße · arrives in 5 min',
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
        'Lift available at S+U Alexanderplatz (entrance A)',
        'S3 towards Erkner · Level boarding · arrives in 6 min',
        'Ramps available at Warschauer Straße (south exit)'
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
          <div>
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

useLocationButton?.addEventListener('click', () => {
  originInput.value = 'Using current location…';
});

// Render initial mock data
renderRoutes('fastest');

