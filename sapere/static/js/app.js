// Sapere Clinic Management System - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Confirm delete actions
    var deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            if (!confirm('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) {
                e.preventDefault();
                return false;
            }
        });
    });

    // Format phone inputs
    var phoneInputs = document.querySelectorAll('input[type="tel"], input[name*="phone"]');
    phoneInputs.forEach(function(input) {
        input.addEventListener('input', function(e) {
            var value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                if (value.length < 14) {
                    value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                }
                e.target.value = value;
            }
        });
    });

    // Format CPF inputs
    var cpfInputs = document.querySelectorAll('input[name*="cpf"]');
    cpfInputs.forEach(function(input) {
        input.addEventListener('input', function(e) {
            var value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                e.target.value = value;
            }
        });
    });

    // Format CEP inputs
    var cepInputs = document.querySelectorAll('input[name*="zip"], input[name*="cep"]');
    cepInputs.forEach(function(input) {
        input.addEventListener('input', function(e) {
            var value = e.target.value.replace(/\D/g, '');
            if (value.length <= 8) {
                value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                e.target.value = value;
            }
        });
    });

    // Search functionality
    var searchInputs = document.querySelectorAll('input[name="search"], input[data-search]');
    searchInputs.forEach(function(input) {
        input.addEventListener('input', debounce(function(e) {
            var searchTerm = e.target.value.toLowerCase();
            var searchTarget = e.target.getAttribute('data-search-target');
            
            if (searchTarget) {
                var items = document.querySelectorAll(searchTarget);
                items.forEach(function(item) {
                    var text = item.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        }, 300));
    });

    // Calendar integration (if needed)
    var calendarInputs = document.querySelectorAll('input[type="date"]');
    calendarInputs.forEach(function(input) {
        // Set max date to today for birth dates
        if (input.name.includes('birth') || input.name.includes('nascimento')) {
            input.max = new Date().toISOString().split('T')[0];
        }
        
        // Set min date to today for appointment dates
        if (input.name.includes('appointment') || input.name.includes('agendamento')) {
            input.min = new Date().toISOString().split('T')[0];
        }
    });
});

// Utility functions
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function showLoading() {
    var loadingHTML = '<div class="spinner"></div>';
    var loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
        loadingContainer.innerHTML = loadingHTML;
    }
}

function hideLoading() {
    var loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
        loadingContainer.innerHTML = '';
    }
}

// Age calculator
function calculateAge(birthDate) {
    var today = new Date();
    var birth = new Date(birthDate);
    var age = today.getFullYear() - birth.getFullYear();
    var monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// Update age display when birth date changes
document.addEventListener('change', function(e) {
    if (e.target.name && e.target.name.includes('birth_date')) {
        var ageDisplay = document.querySelector('[data-age-display]');
        if (ageDisplay && e.target.value) {
            var age = calculateAge(e.target.value);
            ageDisplay.textContent = age + ' anos';
        }
    }
});