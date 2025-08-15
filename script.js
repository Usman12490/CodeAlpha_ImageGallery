// Initial sample images
let images = [
  {
    id: 1,
    src: "https://picsum.photos/400/400?random=1",
    category: "nature",
    alt: "Beautiful landscape",
  },
  {
    id: 2,
    src: "https://picsum.photos/400/400?random=2",
    category: "architecture",
    alt: "Modern building",
  },
  {
    id: 3,
    src: "https://picsum.photos/400/400?random=3",
    category: "abstract",
    alt: "Abstract art",
  },
  {
    id: 4,
    src: "https://picsum.photos/400/400?random=4",
    category: "portraits",
    alt: "Portrait photography",
  },
];

let currentImageIndex = 0;
let filteredImages = [...images];
let currentFilter = "all";
let imageIdCounter = 5; // Start from 5 since we have 4 initial images

// DOM elements
const galleryGrid = document.getElementById("galleryGrid");
const filterBtns = document.querySelectorAll(".filter-btn");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxCounter = document.getElementById("lightboxCounter");
const addImageForm = document.getElementById("addImageForm");
const imageUrl = document.getElementById("imageUrl");
const imageCategory = document.getElementById("imageCategory");
const fileUploadArea = document.getElementById("fileUploadArea");
const fileInput = document.getElementById("fileInput");

// Initialize gallery
function initGallery() {
  renderImages();
  setupEventListeners();
  updateFilterCounts();
}

// Render images based on current filter
function renderImages() {
  galleryGrid.innerHTML = "";

  if (filteredImages.length === 0) {
    showEmptyState();
    return;
  }

  filteredImages.forEach((image, index) => {
    const galleryItem = document.createElement("div");
    galleryItem.className = "gallery-item";
    galleryItem.setAttribute("data-index", index);
    galleryItem.setAttribute("data-id", image.id);

    galleryItem.innerHTML = `
                    <img src="${image.src}" alt="${image.alt}" loading="lazy">
                    <div class="gallery-overlay">
                        <span>View Image</span>
                    </div>
                    <div class="gallery-category">${image.category}</div>
                    <button class="delete-btn" onclick="deleteImage(${image.id})" title="Delete image">&times;</button>
                `;

    galleryItem.addEventListener("click", (e) => {
      if (!e.target.classList.contains("delete-btn")) {
        openLightbox(index);
      }
    });

    galleryGrid.appendChild(galleryItem);
  });
}

// Show empty state when no images
function showEmptyState() {
  galleryGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">🖼️</div>
                    <div class="empty-text">No images found</div>
                    <div class="empty-subtext">Add some images or try a different filter</div>
                </div>
            `;
}

// Setup event listeners
function setupEventListeners() {
  // Filter buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      setActiveFilter(btn);
      filterImages(filter);
    });
  });

  // Add image form
  addImageForm.addEventListener("submit", handleAddImage);

  // File upload
  fileUploadArea.addEventListener("click", () => fileInput.click());
  fileUploadArea.addEventListener("dragover", handleDragOver);
  fileUploadArea.addEventListener("dragleave", handleDragLeave);
  fileUploadArea.addEventListener("drop", handleFileDrop);
  fileInput.addEventListener("change", handleFileSelect);

  // Lightbox controls
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", showPrevImage);
  lightboxNext.addEventListener("click", showNextImage);

  // Close lightbox when clicking outside image
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("active")) {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          showPrevImage();
          break;
        case "ArrowRight":
          showNextImage();
          break;
      }
    }
  });
}

// Handle add image form submission
function handleAddImage(e) {
  e.preventDefault();

  const url = imageUrl.value.trim();
  const category = imageCategory.value;

  if (!url || !category) {
    showMessage("Please fill in all fields", "error");
    return;
  }

  // Check if image already exists
  if (images.some((img) => img.src === url)) {
    showMessage("This image already exists in the gallery", "error");
    return;
  }

  const newImage = {
    id: imageIdCounter++,
    src: url,
    category: category,
    alt: `${category} image`,
  };

  images.push(newImage);
  updateFilterCounts();

  // If current filter matches the new image category or is 'all', update display
  if (currentFilter === "all" || currentFilter === category) {
    filteredImages = getFilteredImages(currentFilter);
    renderImages();
  }

  // Reset form
  addImageForm.reset();
  showMessage("Image added successfully!", "success");
}

// Handle file upload
function handleFileSelect(e) {
  handleFiles(e.target.files);
}

function handleDragOver(e) {
  e.preventDefault();
  fileUploadArea.classList.add("dragover");
}

function handleDragLeave(e) {
  e.preventDefault();
  fileUploadArea.classList.remove("dragover");
}

function handleFileDrop(e) {
  e.preventDefault();
  fileUploadArea.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
}

function handleFiles(files) {
  if (!imageCategory.value) {
    showMessage("Please select a category first", "error");
    return;
  }

  Array.from(files).forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const newImage = {
          id: imageIdCounter++,
          src: e.target.result,
          category: imageCategory.value,
          alt: `${imageCategory.value} image`,
        };

        images.push(newImage);
        updateFilterCounts();

        if (currentFilter === "all" || currentFilter === imageCategory.value) {
          filteredImages = getFilteredImages(currentFilter);
          renderImages();
        }
      };
      reader.readAsDataURL(file);
    }
  });

  showMessage(`${files.length} image(s) uploaded successfully!`, "success");
  fileInput.value = "";
}

// Delete image
function deleteImage(imageId) {
  if (confirm("Are you sure you want to delete this image?")) {
    images = images.filter((img) => img.id !== imageId);
    filteredImages = getFilteredImages(currentFilter);
    updateFilterCounts();
    renderImages();
    showMessage("Image deleted successfully!", "success");
  }
}

// Get filtered images
function getFilteredImages(filter) {
  if (filter === "all") {
    return [...images];
  } else {
    return images.filter((image) => image.category === filter);
  }
}

// Set active filter button
function setActiveFilter(activeBtn) {
  filterBtns.forEach((btn) => btn.classList.remove("active"));
  activeBtn.classList.add("active");
  currentFilter = activeBtn.getAttribute("data-filter");
}

// Filter images by category
function filterImages(filter) {
  filteredImages = getFilteredImages(filter);

  // Add smooth transition effect
  galleryGrid.style.opacity = "0.5";
  setTimeout(() => {
    renderImages();
    galleryGrid.style.opacity = "1";
  }, 150);
}

// Update filter counts
function updateFilterCounts() {
  document.getElementById("countAll").textContent = images.length;
  document.getElementById("countNature").textContent = images.filter(
    (img) => img.category === "nature"
  ).length;
  document.getElementById("countArchitecture").textContent = images.filter(
    (img) => img.category === "architecture"
  ).length;
  document.getElementById("countAbstract").textContent = images.filter(
    (img) => img.category === "abstract"
  ).length;
  document.getElementById("countPortraits").textContent = images.filter(
    (img) => img.category === "portraits"
  ).length;
}

// Show message
function showMessage(text, type) {
  // Remove existing message
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.textContent = text;
  document.body.appendChild(message);

  setTimeout(() => message.classList.add("show"), 100);
  setTimeout(() => {
    message.classList.remove("show");
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

// Lightbox functions (unchanged)
function openLightbox(index) {
  currentImageIndex = index;
  lightboxImage.src = filteredImages[index].src;
  lightboxImage.alt = filteredImages[index].alt;
  updateLightboxCounter();
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
}

function showPrevImage() {
  currentImageIndex =
    (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
  lightboxImage.src = filteredImages[currentImageIndex].src;
  lightboxImage.alt = filteredImages[currentImageIndex].alt;
  updateLightboxCounter();
}

function showNextImage() {
  currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
  lightboxImage.src = filteredImages[currentImageIndex].src;
  lightboxImage.alt = filteredImages[currentImageIndex].alt;
  updateLightboxCounter();
}

function updateLightboxCounter() {
  lightboxCounter.textContent = `${currentImageIndex + 1} / ${
    filteredImages.length
  }`;
}

// Touch/swipe support for mobile (unchanged)
let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

lightbox.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleGesture();
});

function handleGesture() {
  const threshold = 50;
  if (touchEndX < touchStartX - threshold) {
    showNextImage();
  }
  if (touchEndX > touchStartX + threshold) {
    showPrevImage();
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initGallery();
});
