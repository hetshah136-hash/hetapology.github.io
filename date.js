// State management
const appState = {
  dates: [],
  currentViewIndex: -1,
  currentFilter: 'all',
  searchTerm: '',
  pendingPhotos: [],
  currentLightboxPhotos: [],
  currentLightboxIndex: -1,
  slideshowInterval: null,
  CLOUDINARY: {
    CLOUD_NAME: 'dzfarzaew',
    UPLOAD_PRESET: 'date_gallery'
  },
  RELATIONSHIP_START: new Date('2026-01-01'),
  PASSWORD: '1'
};

let searchDebounce = null;

// Initialize application
window.addEventListener('DOMContentLoaded', () => {
  checkPassword();
  loadDates();
  loadTheme();
  setupEventListeners();
  updateCounter();
  renderTimeline();
  updateStats();

  setInterval(updateCounter, 1000);
  document.getElementById('dateInput').valueAsDate = new Date();
});

// Password protection
function checkPassword() {
  const saved = localStorage.getItem('dateGalleryAuth');
  if (saved !== appState.PASSWORD) {
    const input = prompt('Enter password to access:');
    if (input === appState.PASSWORD) {
      localStorage.setItem('dateGalleryAuth', appState.PASSWORD);
    } else {
      alert('Incorrect password');
      document.body.innerHTML = '<div style="text-align:center;margin-top:100px;color:#6B6B6B;font-family:Verdana;"><h1>Access Denied</h1></div>';
      throw new Error('Access denied');
    }
  }
}

// Storage functions
function loadDates() {
  const stored = localStorage.getItem('romanticDates');
  if (stored) {
    try {
      const dates = JSON.parse(stored);
      appState.dates = dates.map(d => ({
        id: d.id || Date.now().toString() + Math.random(),
        date: d.date,
        title: d.title,
        category: d.category || d.tag || '',
        notes: d.notes || '',
        favorite: d.favorite || false,
        images: d.images || []
      }));
    } catch (e) {
      console.error('Error loading dates:', e);
      appState.dates = [];
    }
  }
}

function saveDates() {
  localStorage.setItem('romanticDates', JSON.stringify(appState.dates));
}

// Theme functions
function loadTheme() {
  const theme = localStorage.getItem('dateGalleryTheme') || 'light';
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('themeToggle').textContent = '☀';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('dateGalleryTheme', newTheme);
  document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀' : '☾';
}

// Event listeners
function setupEventListeners() {
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('newDateBtn').addEventListener('click', openAddModal);
  document.getElementById('addForm').addEventListener('submit', handleAddDate);
  document.getElementById('editForm').addEventListener('submit', handleEditDate);
  document.getElementById('searchInput').addEventListener('input', handleSearch);

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      appState.currentFilter = chip.dataset.filter;
      applyFilters();
    });
  });

  document.getElementById('randomBtn').addEventListener('click', randomMemory);
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importInput').click();
  });
  document.getElementById('importInput').addEventListener('change', (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
  });

  document.getElementById('choosePhotosBtn').addEventListener('click', () => {
    document.getElementById('photoInput').click();
  });
  document.getElementById('photoInput').addEventListener('change', (e) => {
    previewPhotos(Array.from(e.target.files));
  });

  document.getElementById('favoriteBtn').addEventListener('click', toggleFavorite);
  document.getElementById('slideshowBtn').addEventListener('click', startSlideshow);
  document.getElementById('editBtn').addEventListener('click', openEditModal);
  document.getElementById('addPhotosBtn').addEventListener('click', addMorePhotos);
  document.getElementById('deleteBtn').addEventListener('click', handleDelete);

  document.getElementById('statAllDates').addEventListener('click', () => {
    appState.currentFilter = 'all';
    applyFilters();
  });
  document.getElementById('statYearDates').addEventListener('click', () => {
    const currentYear = new Date().getFullYear();
    const filtered = appState.dates.filter(d => new Date(d.date).getFullYear() === currentYear);
    renderTimeline(filtered);
  });

  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.dataset.modal);
    });
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', prevPhoto);
  document.getElementById('lightboxNext').addEventListener('click', nextPhoto);
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });

  document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Counter and stats
function updateCounter() {
  const now = new Date();
  const diff = now - appState.RELATIONSHIP_START;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  document.getElementById('daysCounter').textContent = days;
}

function updateStats() {
  const currentYear = new Date().getFullYear();
  const stats = {
    total: appState.dates.length,
    thisYear: appState.dates.filter(d => new Date(d.date).getFullYear() === currentYear).length,
    photos: appState.dates.reduce((sum, d) => sum + (d.images ? d.images.length : 0), 0)
  };

  document.getElementById('totalDates').textContent = stats.total;
  document.getElementById('yearDates').textContent = stats.thisYear;
  document.getElementById('totalPhotos').textContent = stats.photos;
}

// Search and filter
function handleSearch(e) {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    appState.searchTerm = e.target.value;
    renderTimeline();
  }, 300);
}

function applyFilters() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.classList.remove('active');
    if (chip.dataset.filter === appState.currentFilter) {
      chip.classList.add('active');
    }
  });
  renderTimeline();
}

function getFilteredDates() {
  let filtered = [...appState.dates];

  if (appState.currentFilter === 'favorite') {
    filtered = filtered.filter(d => d.favorite);
  } else if (appState.currentFilter !== 'all') {
    filtered = filtered.filter(d => d.category === appState.currentFilter);
  }

  if (appState.searchTerm) {
    const term = appState.searchTerm.toLowerCase();
    filtered = filtered.filter(d => 
      d.title.toLowerCase().includes(term) ||
      (d.notes && d.notes.toLowerCase().includes(term))
    );
  }

  return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Render timeline
function renderTimeline(customDates = null) {
  const timeline = document.getElementById('timeline');
  const dates = customDates || getFilteredDates();

  if (dates.length === 0) {
    timeline.innerHTML = '<div class="empty-state"><p class="empty-text">No dates found</p></div>';
    return;
  }

  timeline.innerHTML = dates.map(dateObj => {
    const actualIndex = appState.dates.findIndex(d => d.id === dateObj.id);
    const formattedDate = formatDate(dateObj.date);
    const photoCount = dateObj.images ? dateObj.images.length : 0;
    const favoriteIcon = dateObj.favorite ? '<span class="favorite-icon">★</span>' : '';
    const categoryBadge = dateObj.category ? getCategoryBadge(dateObj.category) : '';

    const photosHTML = dateObj.images && dateObj.images.length > 0
      ? `<div class="photo-grid">
          ${dateObj.images.slice(0, 6).map((img, i) => 
            `<div class="photo-item" data-date-index="${actualIndex}" data-photo-index="${i}">
              <img src="${img.url}" alt="Photo" loading="lazy">
            </div>`
          ).join('')}
        </div>`
      : '';

    return `
      <div class="date-card">
        <div class="date-header">
          <div class="date-info">
            <div class="date-date">${formattedDate}</div>
            <div class="date-title-row">
              ${favoriteIcon}
              <h3 class="date-title">${escapeHtml(dateObj.title)}</h3>
            </div>
            ${categoryBadge}
          </div>
          <div class="date-actions">
            <button class="action-btn" data-action="view" data-index="${actualIndex}" aria-label="View">👁</button>
            <button class="action-btn" data-action="edit" data-index="${actualIndex}" aria-label="Edit">✎</button>
            <button class="action-btn" data-action="delete" data-index="${actualIndex}" aria-label="Delete">×</button>
          </div>
        </div>
        ${dateObj.notes ? `<p class="date-notes">${escapeHtml(truncateText(dateObj.notes, 200))}</p>` : ''}
        ${photosHTML}
        ${photoCount > 0 ? `<p class="photo-count">${photoCount} photo${photoCount > 1 ? 's' : ''}</p>` : ''}
      </div>
    `;
  }).join('');

  timeline.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const index = parseInt(btn.dataset.index);
      if (action === 'view') viewDate(index);
      if (action === 'edit') openEditModalDirect(index);
      if (action === 'delete') confirmDelete(index);
    });
  });

  timeline.querySelectorAll('.photo-item').forEach(item => {
    item.addEventListener('click', () => {
      const dateIndex = parseInt(item.dataset.dateIndex);
      const photoIndex = parseInt(item.dataset.photoIndex);
      const dateObj = appState.dates[dateIndex];
      openLightbox(dateObj.images, photoIndex);
    });
  });
}

// Utility functions
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getCategoryBadge(category) {
  const names = {
    romance: 'Romance',
    adventure: 'Adventure',
    fun: 'Fun',
    cozy: 'Cozy'
  };
  return `<span class="date-tag tag-${category}">${names[category]}</span>`;
}

// Photo upload
function previewPhotos(files) {
  appState.pendingPhotos = files;
  const preview = document.getElementById('photoPreview');
  preview.innerHTML = '';

  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${e.target.result}" alt="Preview">
        <button type="button" class="remove-btn" data-index="${index}">×</button>
      `;

      div.querySelector('.remove-btn').addEventListener('click', () => {
        removePreview(index);
      });

      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

function removePreview(index) {
  appState.pendingPhotos.splice(index, 1);
  document.getElementById('photoInput').value = '';
  previewPhotos(appState.pendingPhotos);
}

function clearPendingPhotos() {
  appState.pendingPhotos = [];
  document.getElementById('photoInput').value = '';
  document.getElementById('photoPreview').innerHTML = '';
}

async function uploadPhotos() {
  if (appState.pendingPhotos.length === 0) return [];

  const loading = document.getElementById('loading');
  const loadingText = document.getElementById('loadingText');
  const saveBtn = document.getElementById('saveBtn');
  const images = [];

  try {
    loading.classList.add('active');
    if (saveBtn) saveBtn.disabled = true;

    for (let i = 0; i < appState.pendingPhotos.length; i++) {
      loadingText.textContent = `Uploading ${i + 1} of ${appState.pendingPhotos.length}...`;

      const formData = new FormData();
      formData.append('file', appState.pendingPhotos[i]);
      formData.append('upload_preset', appState.CLOUDINARY.UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${appState.CLOUDINARY.CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      images.push({ url: data.secure_url });
    }

    loading.classList.remove('active');
    if (saveBtn) saveBtn.disabled = false;
    return images;

  } catch (error) {
    loading.classList.remove('active');
    if (saveBtn) saveBtn.disabled = false;
    console.error('Upload error:', error);
    alert('Error uploading photos. Please try again.');
    return [];
  }
}

// Modal functions
function openAddModal() {
  document.getElementById('addModal').classList.add('active');
  document.getElementById('dateInput').valueAsDate = new Date();
  document.getElementById('titleInput').value = '';
  document.getElementById('categoryInput').value = '';
  document.getElementById('notesInput').value = '';
  clearPendingPhotos();
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  if (modalId === 'viewModal') {
    appState.currentViewIndex = -1;
  }
}

async function handleAddDate(e) {
  e.preventDefault();

  const date = document.getElementById('dateInput').value;
  const title = document.getElementById('titleInput').value;
  const category = document.getElementById('categoryInput').value;
  const notes = document.getElementById('notesInput').value;

  const images = await uploadPhotos();

  const newDate = {
    id: Date.now().toString() + Math.random(),
    date,
    title,
    category,
    notes,
    images,
    favorite: false
  };

  appState.dates.push(newDate);
  saveDates();
  renderTimeline();
  updateStats();
  closeModal('addModal');
  clearPendingPhotos();
}

function viewDate(index) {
  appState.currentViewIndex = index;
  const dateObj = appState.dates[index];

  document.getElementById('viewTitle').textContent = dateObj.title;
  document.getElementById('viewDate').textContent = formatDate(dateObj.date);
  document.getElementById('viewCategory').innerHTML = dateObj.category ? getCategoryBadge(dateObj.category) : '';
  document.getElementById('viewNotes').textContent = dateObj.notes || 'No notes';

  const favoriteBtn = document.getElementById('favoriteBtn');
  favoriteBtn.textContent = dateObj.favorite ? '★ Starred' : '☆ Star';

  const photoGrid = document.getElementById('viewPhotoGrid');
  if (dateObj.images && dateObj.images.length > 0) {
    photoGrid.innerHTML = dateObj.images.map((img, i) => 
      `<div class="photo-item" data-photo-index="${i}">
        <img src="${img.url}" alt="Photo" loading="lazy">
      </div>`
    ).join('');

    photoGrid.querySelectorAll('.photo-item').forEach(item => {
      item.addEventListener('click', () => {
        const photoIndex = parseInt(item.dataset.photoIndex);
        openLightbox(dateObj.images, photoIndex);
      });
    });

    document.getElementById('viewPhotosSection').style.display = 'block';
  } else {
    document.getElementById('viewPhotosSection').style.display = 'none';
  }

  document.getElementById('viewModal').classList.add('active');
}

function toggleFavorite() {
  if (appState.currentViewIndex === -1) return;

  const dateObj = appState.dates[appState.currentViewIndex];
  dateObj.favorite = !dateObj.favorite;
  saveDates();

  const favoriteBtn = document.getElementById('favoriteBtn');
  favoriteBtn.textContent = dateObj.favorite ? '★ Starred' : '☆ Star';

  renderTimeline();
}

function openEditModal() {
  if (appState.currentViewIndex === -1) return;

  const dateObj = appState.dates[appState.currentViewIndex];

  document.getElementById('editDateInput').value = dateObj.date;
  document.getElementById('editTitleInput').value = dateObj.title;
  document.getElementById('editCategoryInput').value = dateObj.category || '';
  document.getElementById('editNotesInput').value = dateObj.notes || '';

  const preview = document.getElementById('editPhotoPreview');
  if (dateObj.images && dateObj.images.length > 0) {
    preview.innerHTML = dateObj.images.map((img, i) => `
      <div class="preview-item">
        <img src="${img.url}" alt="Photo">
        <button type="button" class="remove-btn" data-photo-index="${i}">×</button>
      </div>
    `).join('');

    preview.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        removeExistingPhoto(parseInt(btn.dataset.photoIndex));
      });
    });
  } else {
    preview.innerHTML = '';
  }

  closeModal('viewModal');
  document.getElementById('editModal').classList.add('active');
}

function openEditModalDirect(index) {
  appState.currentViewIndex = index;
  openEditModal();
}

function removeExistingPhoto(photoIndex) {
  if (appState.currentViewIndex === -1) return;

  if (confirm('Remove this photo?')) {
    appState.dates[appState.currentViewIndex].images.splice(photoIndex, 1);
    saveDates();
    openEditModal();
    renderTimeline();
    updateStats();
  }
}

async function handleEditDate(e) {
  e.preventDefault();

  if (appState.currentViewIndex === -1) return;

  const dateObj = appState.dates[appState.currentViewIndex];
  dateObj.date = document.getElementById('editDateInput').value;
  dateObj.title = document.getElementById('editTitleInput').value;
  dateObj.category = document.getElementById('editCategoryInput').value;
  dateObj.notes = document.getElementById('editNotesInput').value;

  saveDates();
  renderTimeline();
  updateStats();
  closeModal('editModal');
}

function handleDelete() {
  if (appState.currentViewIndex === -1) return;
  confirmDelete(appState.currentViewIndex);
  closeModal('viewModal');
}

function confirmDelete(index) {
  if (confirm('Delete this date?')) {
    appState.dates.splice(index, 1);
    saveDates();
    renderTimeline();
    updateStats();
  }
}

async function addMorePhotos() {
  if (appState.currentViewIndex === -1) return;

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;

  input.onchange = async function(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const loading = document.getElementById('loading');
    const loadingText = document.getElementById('loadingText');

    try {
      loading.classList.add('active');
      const images = [];

      for (let i = 0; i < files.length; i++) {
        loadingText.textContent = `Uploading ${i + 1} of ${files.length}...`;

        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('upload_preset', appState.CLOUDINARY.UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${appState.CLOUDINARY.CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        images.push({ url: data.secure_url });
      }

      const dateObj = appState.dates[appState.currentViewIndex];
      if (!dateObj.images) dateObj.images = [];
      dateObj.images.push(...images);

      saveDates();
      loading.classList.remove('active');

      viewDate(appState.currentViewIndex);
      renderTimeline();
      updateStats();

    } catch (error) {
      loading.classList.remove('active');
      alert('Error uploading photos. Please try again.');
      console.error('Upload error:', error);
    }
  };

  input.click();
}

// Lightbox
function openLightbox(photos, index) {
  appState.currentLightboxPhotos = photos;
  appState.currentLightboxIndex = index;
  showLightboxPhoto();
  document.getElementById('lightbox').classList.add('active');
  stopSlideshow();
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  appState.currentLightboxPhotos = [];
  appState.currentLightboxIndex = -1;
  stopSlideshow();
}

function showLightboxPhoto() {
  if (appState.currentLightboxPhotos.length === 0) return;
  document.getElementById('lightboxImg').src = appState.currentLightboxPhotos[appState.currentLightboxIndex].url;
  document.getElementById('lightboxCounter').textContent = 
    `${appState.currentLightboxIndex + 1} / ${appState.currentLightboxPhotos.length}`;
}

function nextPhoto() {
  if (appState.currentLightboxPhotos.length === 0) return;
  appState.currentLightboxIndex = (appState.currentLightboxIndex + 1) % appState.currentLightboxPhotos.length;
  showLightboxPhoto();
}

function prevPhoto() {
  if (appState.currentLightboxPhotos.length === 0) return;
  appState.currentLightboxIndex = (appState.currentLightboxIndex - 1 + appState.currentLightboxPhotos.length) % appState.currentLightboxPhotos.length;
  showLightboxPhoto();
}

function startSlideshow() {
  if (appState.currentViewIndex === -1) return;

  const dateObj = appState.dates[appState.currentViewIndex];
  if (!dateObj.images || dateObj.images.length === 0) {
    alert('No photos for slideshow');
    return;
  }

  openLightbox(dateObj.images, 0);

  appState.slideshowInterval = setInterval(() => {
    nextPhoto();
  }, 3000);
}

function stopSlideshow() {
  if (appState.slideshowInterval) {
    clearInterval(appState.slideshowInterval);
    appState.slideshowInterval = null;
  }
}

// Export/Import
function exportData() {
  if (appState.dates.length === 0) {
    alert('No dates to export');
    return;
  }

  const dataStr = JSON.stringify(appState.dates, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const filename = `memories-backup-${dateStr}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedDates = JSON.parse(e.target.result);

      if (!Array.isArray(importedDates)) {
        alert('Invalid backup file');
        return;
      }

      const confirmed = confirm(
        `Replace all data with ${importedDates.length} imported dates?`
      );

      if (confirmed) {
        appState.dates = importedDates;
        saveDates();
        renderTimeline();
        updateStats();
      }

    } catch (error) {
      alert('Error reading backup file');
      console.error('Import error:', error);
    }
  };
  reader.readAsText(file);
}

// Random memory
function randomMemory() {
  if (appState.dates.length === 0) {
    alert('No dates to show');
    return;
  }

  const randomIndex = Math.floor(Math.random() * appState.dates.length);
  viewDate(randomIndex);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(event) {
  const isTyping = event.target.tagName === 'INPUT' || 
                   event.target.tagName === 'TEXTAREA' ||
                   event.target.tagName === 'SELECT';

  if (isTyping && event.key !== 'Escape') return;

  if (event.key === 'Escape') {
    if (document.getElementById('lightbox').classList.contains('active')) {
      closeLightbox();
    } else if (document.getElementById('viewModal').classList.contains('active')) {
      closeModal('viewModal');
    } else if (document.getElementById('editModal').classList.contains('active')) {
      closeModal('editModal');
    } else if (document.getElementById('addModal').classList.contains('active')) {
      closeModal('addModal');
    }
  }

  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
    document.getElementById('searchInput').focus();
  }

  if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
    event.preventDefault();
    openAddModal();
  }

  if (document.getElementById('lightbox').classList.contains('active')) {
    if (event.key === 'ArrowLeft') {
      prevPhoto();
    } else if (event.key === 'ArrowRight') {
      nextPhoto();
    }
  }
}