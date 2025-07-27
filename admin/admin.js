// admin/admin.js
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const loginSection = document.getElementById('login-section');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutButton = document.getElementById('logout-button');

    const postForm = document.getElementById('post-form');
    const formTitle = document.getElementById('form-title');
    const postIdInput = document.getElementById('post-id');
    const cancelButton = document.getElementById('cancel-button');
    const postsList = document.getElementById('posts-list');
    const formError = document.getElementById('form-error');

    let adminPassword = null;

    // --- LÓGICA DE AUTENTICACIÓN ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            if (response.ok) {
                adminPassword = password;
                sessionStorage.setItem('adminPassword', password);
                showAdminPanel();
            } else {
                loginError.textContent = 'Contraseña incorrecta.';
            }
        } catch (error) {
            loginError.textContent = 'Error de conexión con el servidor.';
        }
    });
    
    logoutButton.addEventListener('click', () => {
        adminPassword = null;
        sessionStorage.removeItem('adminPassword');
        showLogin();
    });

    function showAdminPanel() {
        loginSection.style.display = 'none';
        adminPanel.style.display = 'block';
        loginError.textContent = '';
        fetchPosts();
    }

    function showLogin() {
        loginSection.style.display = 'block';
        adminPanel.style.display = 'none';
    }
    
    if (sessionStorage.getItem('adminPassword')) {
        adminPassword = sessionStorage.getItem('adminPassword');
        showAdminPanel();
    }

    // --- LÓGICA DE GESTIÓN DE POSTS (CRUD) ---

    async function fetchPosts() {
        if (!adminPassword) return;
        try {
            const response = await fetch('/api/posts', {
                headers: { 'Authorization': adminPassword }
            });
            if (response.status === 401) {
                showLogin();
                return;
            }
            const posts = await response.json();
            renderPosts(posts);
        } catch (error) {
            console.error('Error al obtener posts:', error);
        }
    }

    function renderPosts(posts) {
        postsList.innerHTML = '';
        if (!posts || posts.length === 0) return;
        posts.forEach(post => {
            const li = document.createElement('li');
            li.dataset.id = post.id;
            li.innerHTML = `
                <span>${post.title} <small>(${new Date(post.date).toLocaleDateString()})</small></span>
                <div class="post-actions">
                    <button class="edit-btn">Editar</button>
                    <button class="delete-btn">Eliminar</button>
                </div>
            `;
            postsList.appendChild(li);
        });
    }

    // Manejar envío del formulario (Crear o Actualizar)
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.textContent = ''; // Limpiar errores previos
        const id = postIdInput.value;
        const isUpdating = !!id;

        const postData = {
            title: document.getElementById('title').value,
            subtitle: document.getElementById('subtitle').value,
            author: document.getElementById('author').value,
            date: document.getElementById('date').value,
            imageUrl: document.getElementById('imageUrl').value,
            excerpt: document.getElementById('excerpt').value,
            content: document.getElementById('content').value,
            tags: document.getElementById('tags').value,
            metaTitle: document.getElementById('metaTitle').value,
            metaDescription: document.getElementById('metaDescription').value,
        };

        const url = isUpdating ? `/api/posts/${id}` : '/api/posts';
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': adminPassword
                },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                resetForm();
                fetchPosts();
            } else {
                const errorData = await response.json();
                const errorMessage = `Error: ${errorData.error} Detalles: ${errorData.details || 'Sin detalles.'}`;
                formError.textContent = errorMessage;
                console.error('Error al guardar:', errorData);
            }
        } catch (error) {
            formError.textContent = 'Error de conexión. Revisa la consola del navegador.';
            console.error('Error de conexión al guardar:', error);
        }
    });

    postsList.addEventListener('click', async (e) => {
        const target = e.target;
        const li = target.closest('li');
        if (!li) return;
        const id = li.dataset.id;

        if (target.classList.contains('edit-btn')) {
            const response = await fetch('/api/posts', { headers: { 'Authorization': adminPassword }});
            const posts = await response.json();
            const post = posts.find(p => p.id === id);
            if (post) loadPostIntoForm(post);
        }
        if (target.classList.contains('delete-btn')) {
            deletePost(id);
        }
    });
    
    function loadPostIntoForm(post) {
        resetForm();
        formTitle.textContent = 'Editar Post';
        postIdInput.value = post.id;
        document.getElementById('title').value = post.title || '';
        document.getElementById('subtitle').value = post.subtitle || '';
        document.getElementById('author').value = post.author || '';
        document.getElementById('date').value = post.date ? post.date.split('T')[0] : '';
        document.getElementById('imageUrl').value = post.imageUrl || '';
        document.getElementById('excerpt').value = post.excerpt || '';
        document.getElementById('content').value = post.content || '';
        document.getElementById('tags').value = post.tags || '';
        document.getElementById('metaTitle').value = post.metaTitle || '';
        document.getElementById('metaDescription').value = post.metaDescription || '';
        
        cancelButton.style.display = 'inline-block';
        window.scrollTo(0, 0);
    }

    async function deletePost(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.')) {
            return;
        }
        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': adminPassword }
            });
            if (response.ok) {
                fetchPosts();
            } else {
                const errorData = await response.json();
                alert(`Error al eliminar: ${errorData.details}`);
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error de conexión al eliminar el post.');
        }
    }

    function resetForm() {
        postForm.reset();
        postIdInput.value = '';
        formTitle.textContent = 'Añadir Nuevo Post';
        cancelButton.style.display = 'none';
        formError.textContent = '';
    }

    cancelButton.addEventListener('click', resetForm);
});