const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResultsSection = document.getElementById('searchResultsSection');
const shelfSearch = document.getElementById('shelf-search');
const searchResultsTitle = document.getElementById('searchResultsTitle');

// Selecciona los estantes predeterminados
const defaultShelves = document.querySelectorAll('.library-room > .bookshelf-unit:not(#searchResultsSection)');

const modalOverlay = document.getElementById('bookModal');
const closeModal = document.getElementById('closeModal');
const modalCover = document.getElementById('modalCover');
const modalTitle = document.getElementById('modalTitle');
const modalAuthor = document.getElementById('modalAuthor');
const modalYear = document.getElementById('modalYear');
const modalPages = document.getElementById('modalPages');
const modalPublishers = document.getElementById('modalPublishers');
const modalDesc = document.getElementById('modalDesc');

// Lista de temas
const themePool = [
    'romance', 'bestsellers', 'thriller', 'fantasy', 
    'science fiction', 'adventure', 'mystery', 'historical fiction', 'young adult'
];

const getRandomTheme = () => {
    const randomIndex = Math.floor(Math.random() * themePool.length);
    return themePool[randomIndex];
};

// Traer libros random de la API
const fetchRandomBooksForShelf = async (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p class="loading-state">Organizando estante...</p>';
    const randomQuery = getRandomTheme();

    try {
        const response = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(randomQuery)}&limit=6`);
        const books = response.data.docs;
        renderShelfBooks(books, container);
    } catch (error) {
        console.error('Error al conectar con la API:', error);
        container.innerHTML = '<p class="error-state">No se pudieron cargar los libros.</p>';
    }
};

// Dibujar tarjetas de libros
const renderShelfBooks = (books, container) => {
    container.innerHTML = '';

    if (!books || books.length === 0) {
        container.innerHTML = '<p class="error-state">No hay libros aquí.</p>';
        return;
    }

    books.forEach(book => {
        const title = book.title || 'Título desconocido';
        const author = book.author_name ? book.author_name[0] : 'Autor anónimo';
        const year = book.first_publish_year || 'No especificado';
        const pageCount = book.number_of_pages_median || 'No especificado';
        const publisher = book.publisher ? book.publisher[0] : 'Independiente';
        const coverId = book.cover_i;
        
        const coverUrl = coverId 
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` 
            : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80';

        const card = document.createElement('div');
        card.className = 'book-card';

        card.innerHTML = `
            <div class="book-cover-wrapper">
                <img src="${coverUrl}" alt="Portada de ${title}" loading="lazy">
            </div>
            <div class="book-meta">
                <span class="book-title" title="${title}">${title}</span>
                <span class="book-author" title="${author}">${author}</span>
            </div>
        `;

        // Abrir modal con info detallada
        card.addEventListener('click', () => {
            modalCover.src = coverUrl;
            modalTitle.textContent = title;
            modalAuthor.textContent = `Autor: ${author}`;
            modalYear.textContent = `📅 Año: ${year}`;
            modalPages.textContent = `📖 Páginas: ${pageCount}`;
            modalPublishers.textContent = `🏛️ Editorial: ${publisher}`;
            modalDesc.textContent = `"${title}" escrito por ${author}, publicado alrededor de ${year}.`;
            modalOverlay.style.display = 'flex';
        });

        container.appendChild(card);
    });
};

// Carga inicial de estantes random
document.addEventListener('DOMContentLoaded', () => {
    fetchRandomBooksForShelf('shelf-romance');
    fetchRandomBooksForShelf('shelf-bestsellers');
    fetchRandomBooksForShelf('shelf-thriller');
    fetchRandomBooksForShelf('shelf-fantasy');
});

// Función de búsqueda general
const handleGeneralSearch = async () => {
    const query = searchInput.value.trim();

    // Si se limpia la barra y se busca o da enter, regresan categorías
    if (!query) {
        searchResultsSection.style.display = 'none';
        defaultShelves.forEach(shelf => shelf.style.display = 'block');
        return;
    }

    // Oculta estantes predeterminados y muestra el contenedor de resultados
    defaultShelves.forEach(shelf => shelf.style.display = 'none');
    searchResultsSection.style.display = 'block';
    
    searchResultsTitle.textContent = `Resultados para: "${query}"`;
    shelfSearch.innerHTML = '<p class="loading-state">Buscando...</p>';

    try {
        const response = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`);
        const books = response.data.docs;
        renderShelfBooks(books, shelfSearch);
        window.scrollTo({ top: searchResultsSection.offsetTop - 100, behavior: 'smooth' });
    } catch (error) {
        shelfSearch.innerHTML = '<p class="error-state">Error al buscar.</p>';
    }
};

// Detectar si se borra todo el texto
searchInput.addEventListener('input', () => {
    if (searchInput.value.trim() === '') {
        searchResultsSection.style.display = 'none';
        defaultShelves.forEach(shelf => shelf.style.display = 'block');
    }
});

searchBtn.addEventListener('click', handleGeneralSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleGeneralSearch();
});

// Cerrar modal
closeModal.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
    }
});