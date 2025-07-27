// VERSIÓN 3.0 - CON URLs AMIGABLES (SLUGS)

// 1. IMPORTACIONES Y CONFIGURACIÓN INICIAL
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Airtable = require('airtable');

const app = express();
const port = process.env.PORT || 3000;

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_TABLE_NAME);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/admin', express.static('admin'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// NUEVO: Función para crear un "slug" a partir de un texto
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Reemplaza espacios con -
    .replace(/[^\w\-]+/g, '')       // Quita caracteres no alfanuméricos
    .replace(/\-\-+/g, '-')         // Reemplaza múltiples - con uno solo
    .replace(/^-+/, '')             // Quita - del principio
    .replace(/-+$/, '');            // Quita - del final
}


// 2. MIDDLEWARE DE AUTENTICACIÓN (sin cambios)
const checkAuth = (req, res, next) => {
    const password = req.headers['authorization'];
    if (password && password === process.env.ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'No autorizado.' });
    }
};

// 3. RUTAS DE LA API (con generación de slugs)

app.post('/api/login', (req, res) => {
    if (req.body.password && req.body.password === process.env.ADMIN_PASSWORD) {
        res.status(200).json({ message: 'Login correcto' });
    } else {
        res.status(401).json({ error: 'Contraseña incorrecta' });
    }
});

app.get('/api/posts', checkAuth, async (req, res) => {
    try {
        const records = await table.select({ sort: [{ field: 'date', direction: 'desc' }] }).all();
        const posts = records.map(record => ({ id: record.id, ...record.fields }));
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los posts', details: error.message });
    }
});

// MODIFICADO: Crear un nuevo post (ahora también crea el slug)
app.post('/api/posts', checkAuth, async (req, res) => {
    try {
        const fields = req.body;
        if (fields.title) {
            fields.slug = slugify(fields.title); // Genera el slug
        }
        Object.keys(fields).forEach(key => { if (fields[key] === '' || fields[key] === null) delete fields[key]; });
        const newRecord = await table.create([{ fields }]);
        res.status(201).json({ id: newRecord[0].id, ...newRecord[0].fields });
    } catch (error) {
        res.status(400).json({ error: 'Error de Airtable al crear el post.', details: error.message });
    }
});

// MODIFICADO: Actualizar un post (ahora actualiza el slug si cambia el título)
app.put('/api/posts/:id', checkAuth, async (req, res) => {
    try {
        const fieldsToUpdate = req.body;
        if (fieldsToUpdate.title) {
            fieldsToUpdate.slug = slugify(fieldsToUpdate.title); // Regenera el slug
        }
        Object.keys(fieldsToUpdate).forEach(key => { if (fieldsToUpdate[key] === '' || fieldsToUpdate[key] === null) delete fieldsToUpdate[key]; });
        const updatedRecords = await table.update([{ id: req.params.id, fields: fieldsToUpdate }]);
        res.json({ id: updatedRecords[0].id, ...updatedRecords[0].fields });
    } catch (error) {
        res.status(400).json({ error: 'Error de Airtable al actualizar.', details: error.message });
    }
});

app.delete('/api/posts/:id', checkAuth, async (req, res) => {
    try {
        await table.destroy(req.params.id);
        res.status(200).json({ message: 'Post eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar', details: error.message });
    }
});


// 4. RUTAS DEL FRONTEND (ahora usan slugs)

app.get('/', async (req, res) => {
    try {
        const records = await table.select({ sort: [{ field: 'date', direction: 'desc' }] }).all();
        const posts = records.map(record => ({ id: record.id, ...record.fields }));
        res.render('index', { posts, pageTitle: 'Blog de Gestión Relativa', pageDescription: 'Artículos y noticias.' });
    } catch (error) {
        res.status(500).send('Error al cargar el blog');
    }
});

// MODIFICADO: Ruta para un post individual, ahora busca por slug
app.get('/post/:slug', async (req, res) => {
    try {
        const allRecords = await table.select({ sort: [{ field: 'date', direction: 'desc' }] }).all();
        const posts = allRecords.map(record => ({ id: record.id, ...record.fields }));

        const postIndex = posts.findIndex(p => p.slug === req.params.slug);

        if (postIndex === -1) {
            return res.status(404).send('Post no encontrado');
        }

        const post = posts[postIndex];
        const previousPost = postIndex > 0 ? posts[postIndex - 1] : null;
        const nextPost = postIndex < posts.length - 1 ? posts[postIndex + 1] : null;

        res.render('post', {
            post,
            previousPost,
            nextPost,
            pageTitle: post.metaTitle || post.title,
            pageDescription: post.metaDescription || post.excerpt
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar el post');
    }
});

// 5. INICIAR EL SERVIDOR
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});