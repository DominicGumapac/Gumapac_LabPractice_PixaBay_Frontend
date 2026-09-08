// script.js
// Reads PIXABAY_API_KEY from config.js (loaded before this file in index.html).
// config.js is gitignored — see config.sample.js for the template.

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const resultsEl = document.getElementById('results');
  const emptyStateEl = document.getElementById('empty-state');
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error-message');
  const challengeButtons = document.querySelectorAll('.challenge-btn');

  const keyMissing =
    typeof PIXABAY_API_KEY === 'undefined' ||
    !PIXABAY_API_KEY ||
    PIXABAY_API_KEY.indexOf('YOUR_') === 0;

  if (keyMissing) {
    showError(
      'No Pixabay API key found. Copy config.sample.js to config.js and add your key ' +
      '(see the README), or set PIXABAY_API_KEY in your hosting provider if this is the live site.'
    );
  }

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    const type = document.querySelector('input[name="media-type"]:checked').value;
    if (!query || keyMissing) return;
    runSearch(query, type);
  });

  challengeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (keyMissing) return;
      const query = btn.dataset.query;
      const type = btn.dataset.type;
      runSearch(query, type);
    });
  });

  async function runSearch(query, type) {
    showLoading();
    clearError();
    clearResults();

    try {
      const data = type === 'video'
        ? await fetchFromPixabay('https://pixabay.com/api/videos/', query)
        : await fetchFromPixabay('https://pixabay.com/api/', query, { image_type: 'photo' });

      renderResults(data.hits, type);
    } catch (err) {
      showError(err.message || 'Something went wrong while talking to Pixabay. Please try again.');
    } finally {
      hideLoading();
    }
  }

  async function fetchFromPixabay(baseUrl, query, extraParams = {}) {
    const params = new URLSearchParams({
      key: PIXABAY_API_KEY,
      q: query,
      per_page: '16',
      safesearch: 'true',
      ...extraParams
    });

    let response;
    try {
      response = await fetch(`${baseUrl}?${params.toString()}`);
    } catch (networkErr) {
      throw new Error('Network error — check your connection and try again.');
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Pixabay rate limit reached. Wait a moment and try again.');
      }
      if (response.status === 400) {
        throw new Error('Pixabay could not understand that search. Try a different term.');
      }
      throw new Error(`Pixabay request failed (status ${response.status}).`);
    }

    return response.json();
  }

  function renderResults(hits, type) {
    if (!hits || hits.length === 0) {
      emptyStateEl.textContent = 'No results found. Try a different search term.';
      emptyStateEl.classList.remove('hidden');
      return;
    }

    emptyStateEl.classList.add('hidden');

    hits.forEach((hit, index) => {
      const card = document.createElement('div');
      card.className = 'result-card';

      const frameNumber = document.createElement('span');
      frameNumber.className = 'result-frame-number';
      frameNumber.textContent = String(index + 1).padStart(2, '0');
      card.appendChild(frameNumber);

      if (type === 'video') {
        const video = document.createElement('video');
        video.className = 'result-media';
        video.src = hit.videos.tiny.url || hit.videos.small.url || hit.videos.medium.url;
        video.controls = true;
        video.muted = true;
        video.preload = 'metadata';
        card.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.className = 'result-media';
        img.src = hit.webformatURL;
        img.alt = hit.tags || 'Pixabay image result';
        img.loading = 'lazy';
        card.appendChild(img);
      }

      const tags = document.createElement('p');
      tags.className = 'result-tags';
      tags.textContent = hit.tags || '';
      card.appendChild(tags);

      resultsEl.appendChild(card);
    });
  }

  function showLoading() { loadingEl.classList.remove('hidden'); }
  function hideLoading() { loadingEl.classList.add('hidden'); }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  function clearError() {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }

  function clearResults() {
    resultsEl.innerHTML = '';
    emptyStateEl.classList.add('hidden');
  }
});
