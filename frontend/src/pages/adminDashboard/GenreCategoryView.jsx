import { useLocation } from 'preact-iso';
import { useState, useCallback, useEffect } from 'preact/hooks';

import { genreService } from '../../services/GenreService.js';
import { categoryService } from '../../services/CategoryService.js';

export default function GenreCategoryView() {

  const [genres, setGenres] = useState([]);
  const [categories, setCategories] = useState([]);

  const [newCategory, setNewCategory] = useState({ slug: '', en: '', pl: '', ru: '', by: '' });
  const [newGenre, setNewGenre] = useState({ slug: '', en: '', pl: '', ru: '', by: '' });

  const loadGenres = async () => {
    try {
      const fetchedGenres = await genreService.getGenres();
      setGenres(fetchedGenres || []);
    } catch (err) {
      console.error("Error loading genres:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const fetchedCategory = await categoryService.getCategories();
      setCategories(fetchedCategory || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    loadGenres();
    loadCategories();
  }, []);

  // --- CATEGORY ---
  const handleSaveCategories = async (e) => {
    e.preventDefault();
    if (!newCategory.slug || !newCategory.en || !newCategory.pl || !newCategory.ru || !newCategory.by) return;

    try {
      await categoryService.createCategory(newCategory);
      setNewCategory({ slug: '', en: '', pl: '', ru: '', by: '' });
      await loadCategories();
    } catch (err) {
      alert(err.message || 'Error creating category');
    }
  };

  const handleCategoryFieldChange = (id, field, value) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, [field]: value } : cat));
  };

  const handleUpdateCategory = async (e, id) => {
    e.preventDefault();
    const categoryToUpdate = categories.find(cat => cat.id === id);
    if (!categoryToUpdate || !categoryToUpdate.slug || !categoryToUpdate.en || !categoryToUpdate.pl || !categoryToUpdate.ru || !categoryToUpdate.by) {
      return alert("Fields cannot be empty");
    }

    try {
      await categoryService.updateCategory(id, categoryToUpdate);
      alert("Category updated successfully!");
    } catch (err) {
      alert(err.message || 'Error updating category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.deleteCategory(id);
      await loadCategories();
    } catch (err) {
      alert(err.message || 'Error deleting category');
    }
  };

  // --- GENRE ---
  const handleSaveGenres = async (e) => {
    e.preventDefault();
    if (!newGenre.slug || !newGenre.en || !newGenre.pl || !newGenre.ru || !newGenre.by) return;

    try {
      await genreService.createGenre(newGenre);
      setNewGenre({ slug: '', en: '', pl: '', ru: '', by: '' });
      await loadGenres();
    } catch (err) {
      alert(err.message || 'Error creating genre');
    }
  };

  const handleGenreFieldChange = (id, field, value) => {
    setGenres(prev => prev.map(genre => genre.id === id ? { ...genre, [field]: value } : genre));
  };

  const handleUpdateGenres = async (e, id) => {
    e.preventDefault();
    const genreToUpdate = genres.find(g => g.id === id);
    if (!genreToUpdate || !genreToUpdate.slug || !genreToUpdate.en || !genreToUpdate.pl || !genreToUpdate.ru || !genreToUpdate.by) {
      return alert("Fields cannot be empty");
    }

    try {
      await genreService.updateGenre(id, genreToUpdate);
      alert("Genre updated successfully!");
    } catch (err) {
      alert(err.message || 'Error updating genre');
    }
  };

  const handleDeleteGenre = async (id) => {
    if (!confirm('Are you sure you want to delete this genre?')) return;
    try {
      await genreService.deleteGenre(id);
      await loadGenres();
    } catch (err) {
      alert(err.message || 'Error deleting genre');
    }
  };

  return (
    <>
      <h2>Manage Categories</h2>
      <ul style={styles.list}>
        {categories.map(cat => (
          <li key={cat.id} style={styles.listItem}>
            <form onSubmit={(e) => handleUpdateCategory(e, cat.id)} style={styles.form}>
              <label>slug</label><input type="text" minLength={2} placeholder="Slug" value={cat.slug} onInput={e => handleCategoryFieldChange(cat.id, 'slug', e.target.value)} style={styles.input} />
              <label>en</label><input type="text" placeholder="English Name" value={cat.en} onInput={e => handleCategoryFieldChange(cat.id, 'en', e.target.value)} style={styles.input} />
              <label>pl</label><input type="text" placeholder="Polish Name" value={cat.pl} onInput={e => handleCategoryFieldChange(cat.id, 'pl', e.target.value)} style={styles.input} />
              <label>ru</label><input type="text" placeholder="Russian Name" value={cat.ru} onInput={e => handleCategoryFieldChange(cat.id, 'ru', e.target.value)} style={styles.input} />
              <label>by</label><input type="text" placeholder="Belarusian Name" value={cat.by} onInput={e => handleCategoryFieldChange(cat.id, 'by', e.target.value)} style={styles.input} />
              <button type="submit" style={styles.saveBtn}>Update</button>
              <button type="button" onClick={() => handleDeleteCategory(cat.id)} style={styles.deleteBtn}>Delete</button>
            </form>
          </li>
        ))}
        <li style={styles.listItem}>
          <h3>Add New Category</h3>
          <form onSubmit={handleSaveCategories} style={styles.form}>
              <label>slug</label>
            <label>slug</label><input type="text" minLength={2} placeholder="Slug (eg. fantasy)" value={newCategory.slug} onInput={e => setNewCategory({ ...newCategory, slug: e.target.value })} style={styles.input} />
            <label>en</label><input type="text" placeholder="English Name" value={newCategory.en} onInput={e => setNewCategory({ ...newCategory, en: e.target.value })} style={styles.input} />
            <label>pl</label><input type="text" placeholder="Polish Name" value={newCategory.pl} onInput={e => setNewCategory({ ...newCategory, pl: e.target.value })} style={styles.input} />
            <label>ru</label><input type="text" placeholder="Russian Name" value={newCategory.ru} onInput={e => setNewCategory({ ...newCategory, ru: e.target.value })} style={styles.input} />
            <label>by</label><input type="text" placeholder="Belarusian Name" value={newCategory.by} onInput={e => setNewCategory({ ...newCategory, by: e.target.value })} style={styles.input} />
            <button type="submit" style={styles.saveBtn}>Create Category</button>
          </form>
        </li>
      </ul>

      <hr style={{ borderBottom: '2px dashed #ccc', padding: '20px 0' }} />

      <h2>Manage Genres</h2>
      <ul style={styles.list}>
        {genres.map(genre => (
          <li key={genre.id} style={styles.listItem}>
            <form onSubmit={(e) => handleUpdateGenres(e, genre.id)} style={styles.form}>

              <label>slug</label><input type="text" minLength={2} placeholder="Slug" value={genre.slug} onInput={e => handleGenreFieldChange(genre.id, 'slug', e.target.value)} style={styles.input} />
              <label>en</label><input type="text" placeholder="English Name" value={genre.en} onInput={e => handleGenreFieldChange(genre.id, 'en', e.target.value)} style={styles.input} />
              <label>pl</label><input type="text" placeholder="Polish Name" value={genre.pl} onInput={e => handleGenreFieldChange(genre.id, 'pl', e.target.value)} style={styles.input} />
              <label>ru</label><input type="text" placeholder="Russian Name" value={genre.ru} onInput={e => handleGenreFieldChange(genre.id, 'ru', e.target.value)} style={styles.input} />
              <label>by</label><input type="text" placeholder="Belarusian Name" value={genre.by} onInput={e => handleGenreFieldChange(genre.id, 'by', e.target.value)} style={styles.input} />
              <button type="submit" style={styles.saveBtn}>Update</button>
              <button type="button" onClick={() => handleDeleteGenre(genre.id)} style={styles.deleteBtn}>Delete</button>
            </form>
          </li>
        ))}
        <li style={styles.listItem}>
          <h3>Add New Genre</h3>
          <form onSubmit={handleSaveGenres} style={styles.form}>
            <label>slug</label><input type="text" minLength={2} placeholder="Slug" value={newGenre.slug} onInput={e => setNewGenre({ ...newGenre, slug: e.target.value })} style={styles.input} />
            <label>en</label><input type="text" placeholder="English Name" value={newGenre.en} onInput={e => setNewGenre({ ...newGenre, en: e.target.value })} style={styles.input} />
            <label>pl</label><input type="text" placeholder="Polish Name" value={newGenre.pl} onInput={e => setNewGenre({ ...newGenre, pl: e.target.value })} style={styles.input} />
            <label>ru</label><input type="text" placeholder="Russian Name" value={newGenre.ru} onInput={e => setNewGenre({ ...newGenre, ru: e.target.value })} style={styles.input} />
            <label>by</label><input type="text" placeholder="Belarusian Name" value={newGenre.by} onInput={e => setNewGenre({ ...newGenre, by: e.target.value })} style={styles.input} />
            <button type="submit" style={styles.saveBtn}>Create Genre</button>
          </form>
        </li>
      </ul>
    </>
  )
}

const styles = {
  listItem: {
    listStyle: 'none',
  },
  form: {
    marginInlineStart: 10,
  }
}