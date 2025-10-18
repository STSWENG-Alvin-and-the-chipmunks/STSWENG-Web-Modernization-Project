/******************FRONT END CRUD FUNCTIONALITY************************/
//PROMOS
document.addEventListener('DOMContentLoaded', function () {
    const promoItems = document.querySelectorAll('.adminpromo-item, .adminpromo-new-btn');
    const form = document.getElementById('promoForm');
    const deleteBtn = document.getElementById('deleteBtn');
    const confirmPopup = document.getElementById('confirmPopup');
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDelete = document.getElementById('cancelDelete');
    const closeBtn = document.querySelector('.close-btn');
    const promoImageInput = document.getElementById('promoImage');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const duplicateErrorModal = document.getElementById('duplicateErrorModal');
    const closeDuplicateError = document.getElementById('closeDuplicateError');
    const nameField = document.getElementById('name');

    let promoIdToDelete = null;
    let originalName = '';

    promoItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            form.style.display = 'block'; 
            if (id === 'new') {
                form.reset();
                form.action = '/promos';
                document.getElementById('promoId').value = '';
                promoImageInput.required = true; // Image is required for new promo
                imagePreviewContainer.innerHTML = ''; // Clear image preview
            } else {
                form.reset();
                form.action = `/promos/edit/${id}`;
                promoImageInput.required = false; // Image is optional for editing

                fetch(`/promos/${id}`)
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('promoId').value = data._id;
                        document.getElementById('name').value = data.name;
                        document.getElementById('description').value = data.description;
                        document.getElementById('location').value = data.location;
                        document.getElementById('branches').value = data.branches;
                        document.getElementById('contents').value = data.contents;
                        document.getElementById('validity').value = data.validity;
                        document.getElementById('pricingShort').value = data.pricing.short;
                        document.getElementById('pricingMedium').value = data.pricing.medium;
                        document.getElementById('pricingLong').value = data.pricing.long;
                        document.getElementById('pricingExtraLong').value = data.pricing.extraLong;
                        imagePreviewContainer.innerHTML = `<img src="${data.imageUrl}" style="max-width: 100px; margin-right: 10px;">`;

                        originalName = data.name; // Store the original name
                    })
                    .catch(err => console.error('Error fetching promo data:', err));
            }
        });
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        const name = nameField.value.trim();
        const pricingShort = document.getElementById('pricingShort').value.trim();
        const pricingMedium = document.getElementById('pricingMedium').value.trim();
        const pricingLong = document.getElementById('pricingLong').value.trim();
        const pricingExtraLong = document.getElementById('pricingExtraLong').value.trim();

        // Validate prices
        if (isInvalidPrice(pricingShort) || isInvalidPrice(pricingMedium) || isInvalidPrice(pricingLong) || isInvalidPrice(pricingExtraLong)) {
            alert('Invalid price value.');
            return;
        }

        // Check if the promo name already exists only if the name field has been edited
        if (name !== originalName) {
            const response = await fetch(`/promos/exists?name=${encodeURIComponent(name)}`);
            const exists = await response.json();

            if (exists) {
                // Show error modal
                duplicateErrorModal.style.display = 'block';
                return;
            }
        }

        // Submit the form
        form.submit();
    });

    closeDuplicateError.addEventListener('click', () => {
        duplicateErrorModal.style.display = 'none';
    });

    deleteBtn.addEventListener('click', (event) => {
        event.preventDefault();
        promoIdToDelete = document.getElementById('promoId').value;
        if (promoIdToDelete) {
            confirmPopup.style.display = 'block';
        } else {
            console.log('No promo ID found');
        }
    });

    closeBtn.addEventListener('click', () => {
        confirmPopup.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === confirmPopup) {
            confirmPopup.style.display = 'none';
        }
    });

    confirmDelete.addEventListener('click', () => {
        if (promoIdToDelete) {
            fetch(`/promos/delete/${promoIdToDelete}`, { method: 'POST' })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to delete promo');
                    }
                })
                .then(data => {
                    if (data.success) {
                        console.log('Promo deleted successfully');
                        location.reload();
                    } else {
                        console.log('Error deleting promo');
                    }
                })
                .catch(err => console.error('Error deleting promo:', err));
        }
        confirmPopup.style.display = 'none';
    });

    cancelDelete.addEventListener('click', () => {
        confirmPopup.style.display = 'none';
    });

    if (promoImageInput) {
        promoImageInput.addEventListener('change', function () {
            imagePreviewContainer.innerHTML = ''; // Clear previous previews
            const file = promoImageInput.files[0];
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (file && validImageTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100px';
                    img.style.marginRight = '10px';
                    imagePreviewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please upload a valid image file (JPEG, PNG, GIF)');
                promoImageInput.value = ''; // Clear the input
            }
        });
    }
});

//SERVICES
document.addEventListener('DOMContentLoaded', function () {
    const serviceItems = document.querySelectorAll('.adminservices-item, .adminservices-new-btn');
    const formContainer = document.querySelector('.adminservices-edit-form');
    const form = document.getElementById('servicesForm');
    const deleteBtn = document.getElementById('deleteBtn');
    const serviceTypeSelect = document.getElementById('serviceTypeDropdown');
    const serviceTypeInput = document.getElementById('serviceType');
    const normalPriceField = document.getElementById('normalPriceField');
    const pricingShortField = document.getElementById('pricingShortField');
    const pricingMediumField = document.getElementById('pricingMediumField');
    const pricingLongField = document.getElementById('pricingLongField');
    const pricingExtraLongField = document.getElementById('pricingExtraLongField');
    const pricingMatrixField = document.getElementById('pricingMatrixField');
    const pricingElgonField = document.getElementById('pricingElgonField');
    const pricingOrdeveField = document.getElementById('pricingOrdeveField');
    const serviceImagesInput = document.getElementById('serviceImages');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const errorMessage = document.getElementById('error-message');

    const popup = document.getElementById('serviceConfirmPopup');
    const closePopupBtn = document.querySelector('.popup .close-btn');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    
    function showPopup() {
        popup.style.display = 'block';
    }
    
    function hidePopup() {
        popup.style.display = 'none';
    }
    
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', hidePopup);
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hidePopup);
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            const id = document.getElementById('serviceId').value;
            if (id) {
                fetch(`/services/delete/${id}`, { method: 'POST' })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Failed to delete service');
                        }
                    })
                    .then(data => {
                        if (data.success) {
                            console.log('Service deleted successfully');
                            location.reload();
                        } else {
                            console.log('Error deleting service');
                        }
                    })
                    .catch(err => console.error('Error:', err));
            }
            hidePopup();
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
            showPopup();
        });
    }

    function togglePriceFields(serviceType) {
        console.log('Toggling price fields for service type:', serviceType);
        const selectedServiceType = serviceType ? serviceType.toLowerCase() : '';

        // Hide all price fields initially
        const priceFields = [normalPriceField, pricingShortField, pricingMediumField, pricingLongField, pricingExtraLongField, pricingMatrixField, pricingElgonField, pricingOrdeveField];
        priceFields.forEach(field => {
            if (field) {
                field.classList.add('d-none');
                console.log(`${field.id} hidden`);
            }
        });

        // Show relevant fields based on selected service type
        if (selectedServiceType === 'cuts' || selectedServiceType === 'styling') {
            if (normalPriceField) {
                console.log('Showing normalPriceField');
                normalPriceField.classList.remove('d-none');
            }
        } else if (selectedServiceType === 'coloring') {
            if (pricingMatrixField) {
                console.log('Showing pricingMatrixField');
                pricingMatrixField.classList.remove('d-none');
            }
            if (pricingElgonField) {
                console.log('Showing pricingElgonField');
                pricingElgonField.classList.remove('d-none');
            }
            if (pricingOrdeveField) {
                console.log('Showing pricingOrdeveField');
                pricingOrdeveField.classList.remove('d-none');
            }
        } else if (selectedServiceType === 'treatments') {
            if (pricingShortField) {
                console.log('Showing pricingShortField');
                pricingShortField.classList.remove('d-none');
            }
            if (pricingMediumField) {
                console.log('Showing pricingMediumField');
                pricingMediumField.classList.remove('d-none');
            }
            if (pricingLongField) {
                console.log('Showing pricingLongField');
                pricingLongField.classList.remove('d-none');
            }
            if (pricingExtraLongField) {
                console.log('Showing pricingExtraLongField');
                pricingExtraLongField.classList.remove('d-none');
            }
        }
    }

    function addServiceItemListeners() {
        if (serviceItems && form) {
            serviceItems.forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-id');
                    console.log('Service item clicked:', id);
                    formContainer.style.display = 'block'; // Show the container
                    form.style.display = 'block'; // Show the form

                    if (id === 'new') {
                        if (form) form.reset();
                        if (form) form.action = '/services';
                        if (serviceTypeSelect) {
                            serviceTypeSelect.classList.remove('d-none');
                            serviceTypeSelect.setAttribute('required', 'required');
                            serviceTypeSelect.value = '';
                        }
                        if (serviceTypeInput) {
                            serviceTypeInput.classList.add('d-none');
                            serviceTypeInput.removeAttribute('required');
                            serviceTypeInput.value = '';
                        }
                        togglePriceFields(''); // Reset price fields visibility
                        imagePreviewContainer.innerHTML = ''; // Clear image previews

                        // Attach event listener to dropdown to show relevant fields
                        serviceTypeSelect.addEventListener('change', function() {
                            togglePriceFields(serviceTypeSelect.value);
                        });
                    } else {
                        fetch(`/services/${id}`)
                            .then(response => response.json())
                            .then(data => {
                                if (form) {
                                    document.getElementById('serviceId').value = data._id;
                                    document.getElementById('serviceName').value = data.serviceName;
                                    if (serviceTypeSelect) {
                                        serviceTypeSelect.classList.add('d-none');
                                        serviceTypeSelect.removeAttribute('required');
                                    }
                                    if (serviceTypeInput) {
                                        serviceTypeInput.classList.remove('d-none');
                                        serviceTypeInput.value = data.serviceType;
                                        serviceTypeInput.setAttribute('required', 'required');
                                    }
                                    document.getElementById('serviceDescription').value = data.serviceDescription;

                                    // Populate pricing fields only if they exist
                                    document.getElementById('pricingShort').value = (data.pricing && data.pricing.short) || '';
                                    document.getElementById('pricingMedium').value = (data.pricing && data.pricing.medium) || '';
                                    document.getElementById('pricingLong').value = (data.pricing && data.pricing.long) || '';
                                    document.getElementById('pricingExtraLong').value = (data.pricing && data.pricing.extraLong) || '';
                                    document.getElementById('normalPrice').value = (data.pricing && data.pricing.normal) || '';
                                    document.getElementById('pricingMatrix').value = (data.pricing && data.pricing.matrix) || '';
                                    document.getElementById('pricingElgon').value = (data.pricing && data.pricing.elgon) || '';
                                    document.getElementById('pricingOrdeve').value = (data.pricing && data.pricing.ordeve) || '';
                                    document.getElementById('cutOffTime').value = data.cutOffTime || '';
                                    document.getElementById('branches').value = data.branches || '';
                                    form.action = `/services/edit/${data._id}`; // Set the action to update

                                    console.log('Service type:', data.serviceType);
                                    // Adjust price fields visibility based on service type
                                    togglePriceFields(data.serviceType);

                                    // Display image previews
                                    imagePreviewContainer.innerHTML = ''; // Clear previous previews
                                    data.serviceImages.forEach(imageUrl => {
                                        const img = document.createElement('img');
                                        img.src = imageUrl;
                                        img.style.maxWidth = '100px';
                                        img.style.marginRight = '10px';
                                        imagePreviewContainer.appendChild(img);
                                    });
                                }
                            })
                            .catch(err => {
                                console.error('Error fetching service data:', err);
                            });
                    }
                });
            });
        }
    }

    function addImagePreviewListener() {
        if (serviceImagesInput) {
            serviceImagesInput.addEventListener('change', function () {
                imagePreviewContainer.innerHTML = ''; // Clear previous previews
                const files = serviceImagesInput.files;
                const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
                
                Array.from(files).forEach(file => {
                    if (validImageTypes.includes(file.type)) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.style.maxWidth = '100px';
                            img.style.marginRight = '10px';
                            imagePreviewContainer.appendChild(img);
                            console.log('Image preview added:', e.target.result);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        alert('Please upload a valid image file (JPEG, PNG, GIF)');
                        serviceImagesInput.value = ''; // Clear the input
                    }
                });
            });
        }
    }

    function validateServiceType(serviceType) {
        const validTypes = ['cuts', 'coloring', 'styling', 'treatments'];
        return validTypes.includes(serviceType.toLowerCase());
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        const serviceTypeValue = serviceTypeInput.value || serviceTypeSelect.value;
        if (!validateServiceType(serviceTypeValue)) {
            errorMessage.textContent = 'Invalid service type. Must be one of: Cuts, Coloring, Styling, Treatments.';
            errorMessage.style.display = 'block';
            return;
        }

        const pricingShort = document.getElementById('pricingShort').value.trim();
        const pricingMedium = document.getElementById('pricingMedium').value.trim();
        const pricingLong = document.getElementById('pricingLong').value.trim();
        const pricingExtraLong = document.getElementById('pricingExtraLong').value.trim();
        const normalPrice = document.getElementById('normalPrice').value.trim();
        const pricingMatrix = document.getElementById('pricingMatrix').value.trim();
        const pricingElgon = document.getElementById('pricingElgon').value.trim();
        const pricingOrdeve = document.getElementById('pricingOrdeve').value.trim();

        // Validate prices
        if (isInvalidPrice(pricingShort) || isInvalidPrice(pricingMedium) || isInvalidPrice(pricingLong) || isInvalidPrice(pricingExtraLong) || isInvalidPrice(normalPrice) || isInvalidPrice(pricingMatrix) || isInvalidPrice(pricingElgon) || isInvalidPrice(pricingOrdeve)) {
            alert('Invalid price value.');
            return;
        }

        // Submit the form
        form.submit();
    });

    function initialize() {
        addServiceItemListeners();
        addImagePreviewListener();

        if (serviceTypeSelect) {
            serviceTypeSelect.addEventListener('change', () => {
                console.log('Dropdown service type changed:', serviceTypeSelect.value);
                serviceTypeInput.value = serviceTypeSelect.value;
                togglePriceFields(serviceTypeSelect.value);
            });
        }

        // Call the function once to set the initial state based on any pre-selected value
        togglePriceFields();
    }

    initialize();
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('servicesForm');
    const serviceTypeSelect = document.getElementById('serviceTypeDropdown');
    const serviceTypeInput = document.getElementById('serviceType');
    const errorMessage = document.getElementById('error-message');

    // Valid service types
    const validServiceTypes = ['Cuts', 'Styling', 'Treatments', 'Coloring'];

    function validateServiceType(serviceType) {
        return validServiceTypes.includes(serviceType);
    }

    form.addEventListener('submit', function (event) {
        const serviceTypeValue = serviceTypeInput.value || serviceTypeSelect.value;
        if (!validateServiceType(serviceTypeValue)) {
            event.preventDefault();
            errorMessage.textContent = 'Invalid service type. Must be one of: Cuts, Styling, Treatments, Coloring.';
            errorMessage.style.display = 'block';
        } else {
            errorMessage.style.display = 'none';
        }
    });
});

// Filtering specific service type
document.querySelectorAll('.dropdown-child a').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default anchor behavior
        const selectedServiceType = new URL(this.href).searchParams.get('type');
        console.log(`Navigating to service type: ${selectedServiceType}`);
        window.location.href = `/services?type=${encodeURIComponent(selectedServiceType)}`;
    });
});

function isInvalidPrice(price) {
    if (price === "" || price.toLowerCase() === "to" || price.toLowerCase() === "up") return false;
    price = price.replace(/₱/g, '').trim();
    if (price.includes('to')) {
        const parts = price.split('to').map(part => part.trim());
        if (parts.length !== 2) return true;
        return (isNaN(parts[0]) || parseFloat(parts[0]) < 0 || (!isNaN(parts[1]) && parseFloat(parts[1]) < 0));
    }
    if (price.toLowerCase().includes('up')) {
        const parts = price.split('up').map(part => part.trim());
        if (parts.length !== 2) return true;
        return isNaN(parts[0]) || parseFloat(parts[0]) < 0;
    }
    if (isNaN(price)) return true;
    const number = parseFloat(price);
    return number < 0 || !/\d/.test(price);
}

//BRANCHES
document.addEventListener('DOMContentLoaded', function () {
    const branchItems = document.querySelectorAll('.adminbranches-item, .adminbranches-new-btn');
    const formContainer = document.querySelector('.adminbranches-edit-form');
    const form = document.getElementById('branchForm');
    const deleteBtn = document.getElementById('deleteBtn');
    const locationImageInput = document.getElementById('locationImage');
    // const imagePreview = document.getElementById('imagePreview');
    // const existingImagePreview = document.getElementById('existingImagePreview');
    const popup = document.getElementById('BranchesConfirmPopup');
    const closePopupBtn = document.querySelector('.popup .close-btn');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const branchNameField = document.getElementById('branchName');
    const duplicateErrorModal = document.getElementById('duplicateErrorModal'); 
    const closeDuplicateError = document.getElementById('closeDuplicateError'); // Button to close the modal

    let branchNameChanged = false;

    function showPopup() {
        popup.style.display = 'block';
    }

    function hidePopup() {
        popup.style.display = 'none';
    }

    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', hidePopup);
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hidePopup);
    }

    const imagePreviewContainer = document.getElementById('imagePreviewContainer');

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            const id = document.getElementById('branchId').value;
            if (id) {
                fetch(`/branches/delete/${id}`, { method: 'POST' })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Failed to delete branch');
                        }
                    })
                    .then(data => {
                        if (data.success) {
                            console.log('Branch deleted successfully');
                            location.reload();
                        } else {
                            console.log('Error deleting branch');
                        }
                    })
                    .catch(err => console.error('Error deleting branch:', err));
            } else {
                console.log('No branch ID found');
            }
            hidePopup();
        });
    }

    branchItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            console.log(`Clicked branch item with ID: ${id}`);
            formContainer.style.display = 'block'; // Show the container
            form.style.display = 'block'; // Show the form
            branchNameChanged = false; // Reset the flag when loading a branch
            imagePreviewContainer.innerHTML = '';
            if (id === 'new') {
                console.log('Creating new branch'); // Debugging statement
                form.reset();
                form.action = '/branches';
                document.getElementById('branchId').value = '';
                locationImageInput.required = true; // Image is required for new branch
            } else {
                console.log('Editing existing branch'); // Debugging statement
                form.reset();
                form.action = `/branches/edit/${id}`;
                locationImageInput.required = false; // Image is optional for editing

                fetch(`/admin-branches/${id}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Network response was not ok: ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Fetched branch data:', data);
                        if (form) {
                            console.log('Fetched branch data:', data); // Debugging statement
                            document.getElementById('branchId').value = data._id;
                            document.getElementById('branchName').value = data.branchName;
                            document.getElementById('branchLocation').value = data.branchLocation;
                            document.getElementById('branchDescription').value = data.branchDescription;
                            document.getElementById('branchAdditionalDescription').value = data.branchAdditionalDescription;
                            document.getElementById('operatingHours').value = data.operatingHours;
                            document.getElementById('mobileNumbers').value = data.mobileNumbers;
                            document.getElementById('landLineNumbers').value = data.landLineNumbers;
                            document.getElementById('fbLink').value = data.fbLink;
                            document.getElementById('numberOfStations').value = data.numberOfStations;
                            document.getElementById('maxClientOccupancy').value = data.maxClientOccupancy;
                            document.getElementById('restroom').value = data.restroom;
                            document.getElementById('wifi').value = data.wifi;
                            document.getElementById('parkingLocation').value = data.parkingLocation;
                            // Do not display the existing image in the preview
                        }
                    })
                    .catch(err => {
                        console.error('Error fetching branch data:', err); // Debugging statement
                        formContainer.style.display = 'none'; // Hide the container if there's an error
                    });
            }
        });
    });

    if (deleteBtn) {
        deleteBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the form from submitting
            showPopup(); // Show the confirmation popup
        });
    }
    
    if (locationImageInput) {
        locationImageInput.addEventListener('change', function () {
            imagePreviewContainer.innerHTML = ''; // Clear previous previews
            const file = locationImageInput.files[0];
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            
            if (file && validImageTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.marginRight = '10px';
                    imagePreviewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please upload a valid image file (JPEG, PNG, GIF)');
                locationImageInput.value = ''; // Clear the input
            }
        });
    }

    branchNameField.addEventListener('input', function () {
        branchNameChanged = true;
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        const branchName = branchNameField.value.trim();

        // Check if the branch name was changed and if it already exists
        if (branchNameChanged) {
            const response = await fetch(`/branches/exists?branchName=${encodeURIComponent(branchName)}`);
            const exists = await response.json();

            if (exists) {
                // Show error modal
                duplicateErrorModal.style.display = 'block';
                return;
            }
        }

        // Log before form submission
        console.log('Submitting form with action:', form.action, 'and method:', form.method);

        // Submit the form if the branch name wasn't changed or doesn't exist
        form.submit();
    });

    closeDuplicateError.addEventListener('click', () => {
        duplicateErrorModal.style.display = 'none';
    });

});

/******************OTHERS************************/

/******************GENERAL************************/
//TRANSPARENT NAVBAR FOR NECESSARY WEBPAGES
window.addEventListener('load', function() {
    var body = document.querySelector('body');
    var navTransparent = body.getAttribute('data-nav-transparent') === 'true';

    if (navTransparent) {
        var navBar = document.querySelector('.nav-parent');

        function updateNavBarBackground() {
            if (window.scrollY > 50) {
                navBar.style.backgroundColor = "#0d0d0d";
            } else {
                navBar.style.backgroundColor = "transparent";
            }
        }

        if (navBar) {
            updateNavBarBackground();
            window.addEventListener('scroll', updateNavBarBackground);
        }
    }
});

//DYNAMIC RENDERING OF LOCATIONS LIST
document.addEventListener('DOMContentLoaded', function () {
    const dropdownItems = document.querySelectorAll('.dropdown-child a[data-branch-name]');
    // const branchItems = document.querySelectorAll('.adminbranches-item, .adminbranches-new-btn');
    // const form = document.getElementById('branchForm');
    // const deleteBtn = document.getElementById('deleteBtn');

    // Handle dropdown item clicks
    dropdownItems.forEach(item => {
        item.addEventListener('click', function (event) {
            event.preventDefault();
            const branchName = this.getAttribute('data-branch-name');
            console.log(`Navigating to branch: ${branchName}`);
            window.location.href = `/branches/${encodeURIComponent(branchName)}`;
        });
    });
});

/******************MODALS************************/
//PROMO AND LOGIN MODAL
document.addEventListener('DOMContentLoaded', function () {
    // Error modal for login & signup
    var errorModalElement = document.getElementById('errorModal');
    if (errorModalElement) {
        var errorModal = new bootstrap.Modal(errorModalElement, {
            backdrop: 'static',
            keyboard: false
        });
        var errorMessage = document.querySelector('.modal-body').textContent.trim();

        if (errorMessage) {
            errorModal.show();
        }

        // Ensure close button functionality
        const closeModalButtons = errorModalElement.querySelectorAll('.btn-close, .btn-secondary');
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function () {
                errorModal.hide();
            });
        });

        // Prevent modal from closing when clicking outside
        errorModalElement.addEventListener('click', function (event) {
            if (event.target === errorModalElement) {
                event.stopPropagation();
            }
        });
    }

    // Ensure modals only close with btn-close for all modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      //  var bsModal = new bootstrap.Modal(modal, {
        //    backdrop: 'static',
         //   keyboard: false
        //});
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                event.stopPropagation();
            }
        });
    });

    // Success modal for registration
    var successModalElement = document.getElementById('successModal');
    if (successModalElement) {
        var successModal = new bootstrap.Modal(successModalElement, {
            backdrop: 'static',
            keyboard: false
        });
        var successMessage = successModalElement.querySelector('.modal-body').textContent.trim();

        if (successMessage) {
            successModal.show();
        }

        // Ensure close button functionality
        const closeModalButtons = successModalElement.querySelectorAll('.btn-close, .btn-primary');
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function () {
                successModal.hide();
            });
        });

        // Prevent modal from closing when clicking outside
        successModalElement.addEventListener('click', function (event) {
            if (event.target === successModalElement) {
                event.stopPropagation();
            }
        });
    }
});

// error modal for no promos
document.addEventListener('DOMContentLoaded', function () {
    const noPromosModal = document.getElementById('noPromosModal');
    if (noPromosModal) {
        const bootstrapModal = new bootstrap.Modal(noPromosModal, {
            backdrop: 'static',
            keyboard: false
        });
        bootstrapModal.show();

        const closeModalButton = noPromosModal.querySelector('.btn-close');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', function () {
                bootstrapModal.hide();
            });
        }
    }
});

//Welcome modal
document.addEventListener('DOMContentLoaded', function() {
    var welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'));
    welcomeModal.show();
  });

/******************ADMIN ACCOUNT************************/
// Admin-account messages
document.addEventListener("DOMContentLoaded", function() {
    // Hide the error message after 5 seconds
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000); 
    }

    // Hide the success message after 5 seconds
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000); 
    }
});

//Update User
document.addEventListener('DOMContentLoaded', function () {
    let cropper;
    const profilePicInput = document.getElementById('profilePic');
    const previewImage = document.getElementById('previewImage');
    const imageToCrop = document.getElementById('imageToCrop');
    const cropModal = new bootstrap.Modal(document.getElementById('cropModal'), {
        keyboard: false
    });
    const saveCropButton = document.getElementById('saveCropButton');
    const accountForm = document.getElementById('accountForm');
    const profilePicErrorMessage = document.getElementById('profilePicErrorMessage');
    const passwordErrorMessage = document.getElementById('passwordErrorMessage');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (profilePicInput) {
        profilePicInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (file && validImageTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imageToCrop.src = e.target.result;
                    cropModal.show();
                };
                reader.readAsDataURL(file);
                profilePicErrorMessage.style.display = 'none';
            } else {
                profilePicErrorMessage.textContent = 'Please upload a valid image file (JPEG, PNG, GIF).';
                profilePicErrorMessage.style.display = 'block';
                profilePicInput.value = ''; // Clear the input
                cropModal.hide(); // Ensure the crop modal is hidden
            }
        });
    }

    document.getElementById('cropModal').addEventListener('shown.bs.modal', function () {
        cropper = new Cropper(imageToCrop, {
            aspectRatio: 1, // Maintain aspect ratio
            viewMode: 1
        });
    });

    document.getElementById('cropModal').addEventListener('hidden.bs.modal', function () {
        cropper.destroy();
        cropper = null;
    });

    saveCropButton.addEventListener('click', function () {
        const canvas = cropper.getCroppedCanvas();
        previewImage.src = canvas.toDataURL('image/png');
        cropModal.hide();

        canvas.toBlob(function (blob) {
            const formData = new FormData();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;

            formData.append('profilePic', blob, `${username}-pfp.png`);
            formData.append('username', username);
            formData.append('email', email);

            fetch('/admin-account/upload-profile-pic', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.headers.get('content-type')?.includes('application/json')) {
                    return response.json();
                } else {
                    return response.text().then(text => { throw new Error(text); });
                }
            })
            .then(data => {
                if (data.success) {
                    console.log('Profile picture uploaded successfully:', data);
                } else {
                    console.error('Error uploading profile picture:', data);
                }
            })
            .catch(error => {
                console.error('Error uploading profile picture:', error);
            });
        }, 'image/png');
    });

    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function () {
            if (newPasswordInput.value) {
                confirmPasswordInput.required = true;
                confirmPasswordInput.disabled = false;
            } else {
                confirmPasswordInput.required = false;
                confirmPasswordInput.disabled = true;
                confirmPasswordInput.value = ''; // Clear the input if disabled
            }
        });
    }

    if (accountForm) {
        accountForm.addEventListener('submit', function (event) {
            event.preventDefault();  // Prevent default form submission

            const formData = new FormData(accountForm);
            const username = formData.get('username');
            const email = formData.get('email');
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmPassword');

            let valid = true;

            if (newPassword && confirmPassword && newPassword !== confirmPassword) {
                passwordErrorMessage.textContent = 'Passwords do not match.';
                passwordErrorMessage.style.display = 'block';
                valid = false;
            } else {
                passwordErrorMessage.style.display = 'none';
            }

            if (!username || !email) {
                alert('Username and email are required');
                valid = false;
            }

            if (valid) {
                fetch('/admin-account', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (response.redirected) {
                        window.location.href = response.url;
                    } else {
                        return response.json().then(data => {
                            console.error('Error updating account:', data.message);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error updating account:', error);
                });
            }
        });
    }

    // Initial state
    if (!newPasswordInput.value) {
        confirmPasswordInput.disabled = true;
    }
});

/******************NEWSLETTER************************/
//FORM SUBMITION
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('newsletterForm');  
    form.addEventListener('submit', function (event) {
        event.preventDefault();  

        const formData = new FormData(form);
        const url = form.action;  
        const fetchOptions = {
            method: 'POST',
            body: new URLSearchParams(formData),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        fetch(url, fetchOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result);
                form.reset();  
              
                // Show the success modal
                const successModal = new bootstrap.Modal(document.getElementById('successModal-newsletter'));
                successModal.show()
            })
            .catch(error => {
                console.error('Error during form submission:', error);
            });
    });
});

/******************MOBILE MENU************************/
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenu = document.getElementById("mobileMenu");
    const icon = document.querySelector(".icon");

    function toggleMenu() {
        mobileMenu.classList.toggle('active');
    }

    function handleResize() {
        if (window.innerWidth > 600) {
            mobileMenu.classList.remove('active');
        }
    }

    function handleClickOutside(event) {
        if (!mobileMenu.contains(event.target) && !icon.contains(event.target)) {
            mobileMenu.classList.remove('active');
        }
    }

    icon.addEventListener("click", toggleMenu);
    window.addEventListener("resize", handleResize);
    document.addEventListener("click", handleClickOutside);

    document.querySelectorAll(".mobile-menu > a").forEach(function (link) {
        link.addEventListener("click", function (event) {
            const dropdown = this.nextElementSibling;
            if (dropdown && dropdown.classList.contains("dropdown-child")) {
                event.preventDefault();
                dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
            }
        });
    });
});
