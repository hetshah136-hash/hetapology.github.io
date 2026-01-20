const CLOUDINARY_CLOUD_NAME = 'dzfarzaew';
const CLOUDINARY_UPLOAD_PRESET = 'date_gallery';
const RELATIONSHIP_START = new Date('2026-01-01');
const PASSWORD = '1';

let dates = [];
let currentViewIndex = -1;
let currentLightboxIndex = -1;
let currentLightboxPhotos = [];
let currentFilter = 'all';
let slideshowInterval = null;

window.onload = function() {
  checkPassword();
  loadDates();
  updateCounter();
  createFloatingHearts();
  loadTheme();
  document.getElementById('dateInput').valueAsDate = new Date();
  setInterval(updateCounter, 1000);
  document.addEventListener('keydown', handleKeyboardShortcuts);
};

function checkPassword() {
  const saved = localStorage.getItem('dateGalleryAuth');
  if (saved !== PASSWORD) {
    const input = prompt('Enter password to access:');
    if (input === PASSWORD) {
      localStorage.setItem('dateGalleryAuth', PASSWORD);
    } else {
      alert('Incorrect password!');
      document.body.innerHTML = '<h1 style="text-align:center;margin-top:50px;">Access Denied 💔</h1>';
    }
  }
}

function loadDates() {
  const stored = localStorage.getItem('romanticDates');
  if (stored) {
    dates = JSON.parse(stored);
    dates = dates.map(d => ({
      ...d,
      favorite: d.favorite || false,
      tag: d.tag || ''
    }));
    saveDates();
  }
  applyFilters();
  updateStats();
}

function saveDates() {
  localStorage.setItem('romanticDates', JSON.stringify(dates));
}

function createFloatingHearts() {
  for (let i = 0; i < 15; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDelay = Math.random() * 15 + 's';
    heart.style.animationDuration = (Math.random() * 10 + 10) + 's';
    document.body.appendChild(heart);
  }
}

function loadTheme() {
  const theme = localStorage.getItem('dateGalleryTheme') || 'light';
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-toggle').textContent = '☀️';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('dateGalleryTheme', newTheme);
  document.querySelector('.theme-toggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function updateCounter() {
  const now = new Date();
  const diff = now - RELATIONSHIP_START;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  document.getElementById('daysCounter').textContent = days;
}

function updateStats() {
  const totalDates = dates.length;
  const currentYear = new Date().getFullYear();
  const yearDates = dates.filter(d => new Date(d.date).getFullYear() === currentYear).length;
  const totalPhotos = dates.reduce((sum, d) => sum + (d.images ? d.images.length : 0), 0);

  document.getElementById('totalDates').textContent = totalDates;
  document.getElementById('yearDates').textContent = yearDates;
  document.getElementById('totalPhotos').textContent = totalPhotos;
}

function filterByAll() {
  setFilter('all');
}

function filterByYear() {
  const currentYear = new Date().getFullYear();
  const filtered = dates.filter(d => new Date(d.date).getFullYear() === currentYear);
  renderTimeline(filtered);
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
  applyFilters();
}

function applyFilters() {
  let filtered = [...dates];

  if (currentFilter === 'favorite') {
    filtered = filtered.filter(d => d.favorite);
  } else if (currentFilter !== 'all') {
    filtered = filtered.filter(d => d.tag === currentFilter);
  }

  const searchTerm = document.getElementById('searchBox').value.toLowerCase().trim();
  if (searchTerm) {
    filtered = filtered.filter(d => 
      d.title.toLowerCase().includes(searchTerm) ||
      (d.notes && d.notes.toLowerCase().includes(searchTerm))
    );
  }

  renderTimeline(filtered);
}

function renderTimeline(datesToRender = null) {
  const timeline = document.getElementById('timeline');
  const displayDates = datesToRender || dates;

  if (displayDates.length === 0) {
    const message = currentFilter !== 'all' || document.getElementById('searchBox').value
      ? 'No dates found. Try adjusting your filters! 💕'
      : 'No dates yet! Click "Add Date" to start capturing your memories together 💕';

    timeline.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💔</div>
        <div class="empty-state-text">${message}</div>
      </div>
    `;
    return;
  }

  const sorted = [...displayDates].sort((a, b) => new Date(a.date) - new Date(b.date));

  timeline.innerHTML = sorted.map((dateObj, index) => {
    const actualIndex = dates.findIndex(d => d === dateObj);
    const formattedDate = formatDate(dateObj.date);
    const photoCount = dateObj.images ? dateObj.images.length : 0;
    const favoriteIcon = dateObj.favorite ? '<span class="favorite-star">⭐</span>' : '';
    const tagBadge = dateObj.tag ? getTagBadge(dateObj.tag) : '';

    const photosHTML = dateObj.images && dateObj.images.length > 0
      ? `<div class="date-photos">
          ${dateObj.images.slice(0, 4).map((img, i) => 
            `<img src="${img.url}" class="photo-thumb" alt="Date photo" onclick="openLightboxFromCard(${actualIndex}, ${i})">`
          ).join('')}
          ${dateObj.images.length > 4 ? `<div style="grid-column: span 1; display: flex; align-items: center; justify-content: center; background: var(--border); border-radius: 12px; font-weight: bold; color: var(--accent);">+${dateObj.images.length - 4}</div>` : ''}
        </div>`
      : '';

    return `
      <div class="date-card">
        <div class="date-header">
          <div class="date-info">
            <div class="date-title">
              ${favoriteIcon}
              ${dateObj.title}
            </div>
            <div class="date-date">${formattedDate}</div>
            ${tagBadge}
          </div>
          <div class="date-actions">
            <button class="icon-btn" onclick="viewDate(${actualIndex})" title="View">👁️</button>
            <button class="icon-btn" onclick="openEditModalDirect(${actualIndex})" title="Edit">✏️</button>
            <button class="icon-btn" onclick="confirmDeleteDirect(${actualIndex})" title="Delete">🗑️</button>
          </div>
        </div>
        ${dateObj.notes ? `<p style="margin-top: 10px; opacity: 0.9;">${truncateText(dateObj.notes, 150)}</p>` : ''}
        ${photosHTML}
        ${photoCount > 0 ? `<p style="margin-top: 10px; opacity: 0.7; font-size: 0.9em;">📸 ${photoCount} photo${photoCount > 1 ? 's' : ''}</p>` : ''}
      </div>
    `;
  }).join('');
}

function getTagBadge(tag) {
  const tagIcons = {
    romance: '💕',
    adventure: '🎒',
    fun: '🎉',
    cozy: '🏡'
  };
  const tagNames = {
    romance: 'Romance',
    adventure: 'Adventure',
    fun: 'Fun',
    cozy: 'Cozy'
  };
  return `<span class="tag-badge tag-${tag}">${tagIcons[tag]} ${tagNames[tag]}</span>`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function openAddModal() {
  document.getElementById('addModal').classList.add('active');
  document.getElementById('dateInput').valueAsDate = new Date();
  document.getElementById('titleInput').value = '';
  document.getElementById('tagInput').value = '';
  document.getElementById('notesInput').value = '';
  document.getElementById('photoInput').value = '';
  document.getElementById('photoPreview').innerHTML = '';
}

function closeAddModal() {
  document.getElementById('addModal').classList.remove('active');
}

let pendingPhotos = [];

function previewPhotos(event) {
  const files = Array.from(event.target.files);
  pendingPhotos = files;

  const preview = document.getElementById('photoPreview');
  preview.innerHTML = '';

  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${e.target.result}" class="preview-img" alt="Preview">
        <button type="button" class="remove-photo" onclick="removePreview(${index})">&times;</button>
      `;
      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

function removePreview(index) {
  pendingPhotos.splice(index, 1);
  const preview = document.getElementById('photoPreview');
  preview.innerHTML = '';

  pendingPhotos.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${e.target.result}" class="preview-img" alt="Preview">
        <button type="button" class="remove-photo" onclick="removePreview(${i})">&times;</button>
      `;
      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

async function addDate(event) {
  event.preventDefault();

  const date = document.getElementById('dateInput').value;
  const title = document.getElementById('titleInput').value;
  const tag = document.getElementById('tagInput').value;
  const notes = document.getElementById('notesInput').value;

  if (!date || !title) {
    alert('Please fill in date and title! 💕');
    return;
  }

  const loading = document.getElementById('loading');
  const loadingText = document.getElementById('loadingText');

  try {
    let images = [];

    if (pendingPhotos.length > 0) {
      loading.classList.add('active');
      loadingText.textContent = 'Uploading photos... 💕';

      for (let i = 0; i < pendingPhotos.length; i++) {
        loadingText.textContent = `Uploading photo ${i + 1} of ${pendingPhotos.length}... 💕`;

        const formData = new FormData();
        formData.append('file', pendingPhotos[i]);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        );

        const data = await response.json();
        images.push({ url: data.secure_url });
      }
    }

    const newDate = {
      date,
      title,
      tag,
      notes,
      images,
      favorite: false
    };

    dates.push(newDate);
    saveDates();
    applyFilters();
    updateStats();

    loading.classList.remove('active');
    closeAddModal();

    alert('Date added successfully! 💕');
    pendingPhotos = [];

  } catch (error) {
    loading.classList.remove('active');
    alert('Error adding date. Please try again. 💔');
    console.error('Error:', error);
  }
}

function viewDate(index) {
  currentViewIndex = index;
  const dateObj = dates[index];

  document.getElementById('viewTitle').textContent = dateObj.title;
  document.getElementById('viewDate').textContent = formatDate(dateObj.date);
  document.getElementById('viewNotes').textContent = dateObj.notes || 'No notes added.';

  const tagContainer = document.getElementById('viewTagContainer');
  if (dateObj.tag) {
    tagContainer.innerHTML = `<strong>Category:</strong> ${getTagBadge(dateObj.tag)}`;
  } else {
    tagContainer.innerHTML = '';
  }

  const favoriteBtn = document.getElementById('favoriteButtonText');
  favoriteBtn.textContent = dateObj.favorite ? '⭐ Starred' : '☆ Star';

  const photosContainer = document.getElementById('viewPhotosContainer');
  if (dateObj.images && dateObj.images.length > 0) {
    photosContainer.innerHTML = `
      <h3 style="margin-bottom: 10px;">Photos (${dateObj.images.length})</h3>
      <div class="view-photos-grid">
        ${dateObj.images.map((img, i) => 
          `<img src="${img.url}" class="photo-thumb" alt="Date photo" onclick="openLightbox(${index}, ${i})">`
        ).join('')}
      </div>
    `;
  } else {
    photosContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📸</div>
        <div class="empty-state-text">No photos uploaded yet. Click 'Add More Photos' to add some! 📸</div>
      </div>
    `;
  }

  document.getElementById('viewModal').classList.add('active');
}

function closeViewModal() {
  document.getElementById('viewModal').classList.remove('active');
  currentViewIndex = -1;
}

function toggleFavorite() {
  if (currentViewIndex === -1) return;

  dates[currentViewIndex].favorite = !dates[currentViewIndex].favorite;
  saveDates();

  const favoriteBtn = document.getElementById('favoriteButtonText');
  favoriteBtn.textContent = dates[currentViewIndex].favorite ? '⭐ Starred' : '☆ Star';

  applyFilters();
  updateStats();
}

function openEditModal() {
  if (currentViewIndex === -1) return;

  const dateObj = dates[currentViewIndex];

  document.getElementById('editDateInput').value = dateObj.date;
  document.getElementById('editTitleInput').value = dateObj.title;
  document.getElementById('editTagInput').value = dateObj.tag || '';
  document.getElementById('editNotesInput').value = dateObj.notes || '';

  const preview = document.getElementById('editPhotoPreview');
  if (dateObj.images && dateObj.images.length > 0) {
    preview.innerHTML = dateObj.images.map((img, i) => `
      <div class="preview-item">
        <img src="${img.url}" class="preview-img" alt="Photo">
        <button type="button" class="remove-photo" onclick="removeExistingPhoto(${i})">&times;</button>
      </div>
    `).join('');
  } else {
    preview.innerHTML = '<p style="opacity: 0.7;">No photos</p>';
  }

  closeViewModal();
  document.getElementById('editModal').classList.add('active');
}

function openEditModalDirect(index) {
  currentViewIndex = index;
  openEditModal();
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

function removeExistingPhoto(photoIndex) {
  if (currentViewIndex === -1) return;

  if (confirm('Remove this photo? This cannot be undone! 💔')) {
    dates[currentViewIndex].images.splice(photoIndex, 1);
    saveDates();

    const preview = document.getElementById('editPhotoPreview');
    const dateObj = dates[currentViewIndex];
    if (dateObj.images && dateObj.images.length > 0) {
      preview.innerHTML = dateObj.images.map((img, i) => `
        <div class="preview-item">
          <img src="${img.url}" class="preview-img" alt="Photo">
          <button type="button" class="remove-photo" onclick="removeExistingPhoto(${i})">&times;</button>
        </div>
      `).join('');
    } else {
      preview.innerHTML = '<p style="opacity: 0.7;">No photos</p>';
    }

    applyFilters();
    updateStats();
  }
}

function saveEdit(event) {
  event.preventDefault();

  if (currentViewIndex === -1) return;

  const date = document.getElementById('editDateInput').value;
  const title = document.getElementById('editTitleInput').value;
  const tag = document.getElementById('editTagInput').value;
  const notes = document.getElementById('editNotesInput').value;

  if (!date || !title) {
    alert('Please fill in date and title! 💕');
    return;
  }

  dates[currentViewIndex].date = date;
  dates[currentViewIndex].title = title;
  dates[currentViewIndex].tag = tag;
  dates[currentViewIndex].notes = notes;

  saveDates();
  applyFilters();
  updateStats();
  closeEditModal();

  alert('Changes saved! 💕');
}

function confirmDelete() {
  if (currentViewIndex === -1) return;

  if (confirm('Are you sure you want to delete this date? This cannot be undone! 💔')) {
    dates.splice(currentViewIndex, 1);
    saveDates();
    applyFilters();
    updateStats();
    closeViewModal();
    alert('Date deleted 💔');
  }
}

function confirmDeleteDirect(index) {
  if (confirm('Are you sure you want to delete this date? This cannot be undone! 💔')) {
    dates.splice(index, 1);
    saveDates();
    applyFilters();
    updateStats();
    alert('Date deleted 💔');
  }
}

async function addMorePhotos() {
  if (currentViewIndex === -1) return;

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;

  input.onchange = async function(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const loading = document.getElementById('loading');
    const loadingText = document.getElementById('loadingText');

    try {
      loading.classList.add('active');
      const images = [];

      for (let i = 0; i < files.length; i++) {
        loadingText.textContent = `Uploading photo ${i + 1} of ${files.length}... 💕`;

        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        );

        const data = await response.json();
        images.push({ url: data.secure_url });
      }

      if (!dates[currentViewIndex].images) {
        dates[currentViewIndex].images = [];
      }

      dates[currentViewIndex].images.push(...images);
      saveDates();

      loading.classList.remove('active');
      loadingText.textContent = 'Uploading photos... 💕';

      viewDate(currentViewIndex);
      applyFilters();
      updateStats();

      alert(`Added ${images.length} photo${images.length > 1 ? 's' : ''} successfully! 💕`);

    } catch (error) {
      loading.classList.remove('active');
      loadingText.textContent = 'Uploading photos... 💕';
      alert('Error uploading photos. Please try again. 💔');
      console.error('Upload error:', error);
    }
  };

  input.click();
}

function openLightbox(dateIndex, photoIndex) {
  currentLightboxPhotos = dates[dateIndex].images;
  currentLightboxIndex = photoIndex;
  showLightboxPhoto();
  document.getElementById('lightbox').classList.add('active');
  stopSlideshow();
}

function openLightboxFromCard(dateIndex, photoIndex) {
  openLightbox(dateIndex, photoIndex);
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  currentLightboxPhotos = [];
  currentLightboxIndex = -1;
  stopSlideshow();
}

function showLightboxPhoto() {
  if (currentLightboxPhotos.length === 0) return;
  document.getElementById('lightboxImg').src = currentLightboxPhotos[currentLightboxIndex].url;
}

function nextPhoto() {
  if (currentLightboxPhotos.length === 0) return;
  currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxPhotos.length;
  showLightboxPhoto();
}

function prevPhoto() {
  if (currentLightboxPhotos.length === 0) return;
  currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxPhotos.length) % currentLightboxPhotos.length;
  showLightboxPhoto();
}

function startSlideshow() {
  if (currentViewIndex === -1) return;

  const dateObj = dates[currentViewIndex];
  if (!dateObj.images || dateObj.images.length === 0) {
    alert('No photos to show in slideshow! 📸');
    return;
  }

  currentLightboxPhotos = dateObj.images;
  currentLightboxIndex = 0;
  showLightboxPhoto();
  document.getElementById('lightbox').classList.add('active');

  slideshowInterval = setInterval(() => {
    nextPhoto();
  }, 3000);
}

function stopSlideshow() {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
  }
}

function randomMemory() {
  if (dates.length === 0) {
    alert('No dates to show yet! Add some memories first 💕');
    return;
  }

  const randomIndex = Math.floor(Math.random() * dates.length);
  viewDate(randomIndex);
}

function exportBackup() {
  if (dates.length === 0) {
    alert('No dates to export! 💔');
    return;
  }

  const dataStr = JSON.stringify(dates, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const filename = `our-dates-backup-${dateStr}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
  alert('Backup downloaded! 💕');
}

function importBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedDates = JSON.parse(e.target.result);

        if (!Array.isArray(importedDates)) {
          alert('Invalid backup file format! 💔');
          return;
        }

        const confirmed = confirm(
          `This will replace all current data with ${importedDates.length} imported dates. Continue?`
        );

        if (confirmed) {
          dates = importedDates;
          saveDates();
          applyFilters();
          updateStats();
          alert('Data imported successfully! 💕');
        }

      } catch (error) {
        alert('Error reading backup file! 💔');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

function handleKeyboardShortcuts(event) {
  const isTyping = event.target.tagName === 'INPUT' || 
                   event.target.tagName === 'TEXTAREA' ||
                   event.target.tagName === 'SELECT';

  if (isTyping) return;

  if (event.key === 'Escape') {
    if (document.getElementById('lightbox').classList.contains('active')) {
      closeLightbox();
    } else if (document.getElementById('viewModal').classList.contains('active')) {
      closeViewModal();
    } else if (document.getElementById('editModal').classList.contains('active')) {
      closeEditModal();
    } else if (document.getElementById('addModal').classList.contains('active')) {
      closeAddModal();
    }
  }

  if (event.ctrlKey && event.key === 'n') {
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

let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('DOMContentLoaded', function() {
  const lightbox = document.getElementById('lightbox');

  lightbox.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
  }, false);

  lightbox.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
  }, false);
});

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      nextPhoto();
    } else {
      prevPhoto();
    }
  }
}

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.classList.remove('active');
      if (modal.id === 'viewModal') currentViewIndex = -1;
    }
  });
});

const lightboxEl = document.getElementById('lightbox');
if (lightboxEl) {
  lightboxEl.addEventListener('click', function(event) {
    if (event.target === this) {
      closeLightbox();
    }
  });
}