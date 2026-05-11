// script.js

// Функция для получения пользователей из localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Функция для сохранения пользователей в localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Функция для получения мест из localStorage
function getPlaces() {
    return JSON.parse(localStorage.getItem('places') || '[]');
}

// Функция для сохранения мест в localStorage
function savePlaces(places) {
    localStorage.setItem('places', JSON.stringify(places));
}

// Регистрация
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const users = getUsers();
        users.push({ username, email, password, status: 'approved' });
        saveUsers(users);

        alert(getTranslation('registrationSuccess'));
        window.location.href = 'dashboard.html';
    });
}

// Вход
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (username === 'AAAA' && password === 'AAAA') {
            window.location.href = 'admin.html';
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.username === username && u.password === password && u.status === 'approved');

        if (user) {
            localStorage.setItem('currentUser', username);
            window.location.href = 'dashboard.html';
        } else {
            alert(getTranslation('invalidData'));
        }
    });
}

// Админ панель
if (document.getElementById('pendingPlaces')) {
    function loadPendingPlaces() {
        const places = getPlaces();
        const pending = places.filter(p => p.status === 'pending');
        const list = document.getElementById('pendingPlaces');
        list.innerHTML = '';

        pending.forEach((place, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${place.name} - ${place.description} (от ${place.user})</span>
                <div>
                    <button onclick="approvePlace(${index})" data-translate="approve">${getTranslation('approve')}</button>
                    <button class="reject" onclick="rejectPlace(${index})" data-translate="reject">${getTranslation('reject')}</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    window.approvePlace = function(index) {
        const places = getPlaces();
        const pending = places.filter(p => p.status === 'pending');
        pending[index].status = 'approved';
        savePlaces(places);
        loadPendingPlaces();
    };

    window.rejectPlace = function(index) {
        const places = getPlaces();
        const pending = places.filter(p => p.status === 'pending');
        places.splice(places.indexOf(pending[index]), 1);
        savePlaces(places);
        loadPendingPlaces();
    };

    loadPendingPlaces();
}

// Dashboard для пользователей
if (document.getElementById('addPlaceForm')) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
    }

    document.getElementById('profileName').textContent = currentUser;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    document.getElementById('addPlaceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('placeName').value;
        const description = document.getElementById('placeDescription').value;

        const places = getPlaces();
        places.push({ name, description, user: currentUser, status: 'pending' });
        savePlaces(places);

        alert(getTranslation('placedAdded'));
        document.getElementById('addPlaceForm').reset();
    });

    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');

    function loadAvatar() {
        const avatarData = localStorage.getItem(`avatar_${currentUser}`);
        if (avatarData) {
            avatarPreview.innerHTML = `<img src="${avatarData}" alt="Аватар">`;
        } else {
            avatarPreview.textContent = 'Аватар';
        }
    }

    avatarInput.addEventListener('change', function() {
        const file = avatarInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            localStorage.setItem(`avatar_${currentUser}`, imageData);
            loadAvatar();
        };
        reader.readAsDataURL(file);
    });

    function loadApprovedPlaces() {
        const approvedPlaces = getPlaces().filter(place => place.status === 'approved');
        const list = document.getElementById('approvedPlaces');
        if (!list) return;

        list.innerHTML = '';
        if (approvedPlaces.length === 0) {
            list.innerHTML = `<li class="empty-list">${getTranslation('noApprovedPlaces')}</li>`;
            return;
        }

        approvedPlaces.forEach(place => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <strong>${place.name}</strong>
                    <p>${place.description}</p>
                    <small>${getTranslation('user')} ${place.user}</small>
                </div>
            `;
            list.appendChild(li);
        });
    }

    loadAvatar();
    loadApprovedPlaces();

    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const target = item.getAttribute('data-tab');
            tabPanels.forEach(panel => {
                panel.classList.toggle('active', panel.id === target);
            });
        });
    });
}

function initAuthFlipCard() {
    const authCard = document.getElementById('authCard');
    const showLogin = document.getElementById('showLogin');
    const showRegister = document.getElementById('showRegister');
    const toggleToRegister = document.getElementById('toggleToRegister');
    const toggleToLogin = document.getElementById('toggleToLogin');

    if (!authCard) {
        return;
    }

    const setSide = side => {
        if (side === 'register') {
            authCard.classList.add('flip');
            showRegister?.classList.add('active');
            showLogin?.classList.remove('active');
        } else {
            authCard.classList.remove('flip');
            showLogin?.classList.add('active');
            showRegister?.classList.remove('active');
        }
    };

    showLogin?.addEventListener('click', () => setSide('login'));
    showRegister?.addEventListener('click', () => setSide('register'));
    toggleToRegister?.addEventListener('click', () => setSide('register'));
    toggleToLogin?.addEventListener('click', () => setSide('login'));
}

initAuthFlipCard();

// Переключение языков
if (document.getElementById('langToggle')) {
    const langToggle = document.getElementById('langToggle');
    const langMenu = document.getElementById('langMenu');

    langToggle.addEventListener('click', () => {
        langMenu.classList.toggle('active');
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
}