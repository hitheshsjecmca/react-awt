const API_URL = '/books';

const bookForm = document.getElementById('bookForm');
const bookIdInput = document.getElementById('bookId');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const priceInput = document.getElementById('price');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const bookList = document.getElementById('bookList');
const messageBox = document.getElementById('message');

let messageTimer;


function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    messageBox.className = 'message hidden';
  }, 4000);
}

// Stop book text from being treated as HTML
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


async function handleResponse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // response had no JSON body
  }
  if (!res.ok) {
    throw new Error((data && data.message) || `Request failed (${res.status})`);
  }
  return data;
}


function friendlyError(err) {
  if (err instanceof TypeError) {
    return 'Cannot connect to the server. Please check that it is running.';
  }
  return err.message;
}

async function loadBooks() {
  try {
    const res = await fetch(API_URL);
    const books = await handleResponse(res);
    renderBooks(books);
  } catch (err) {
    showMessage(friendlyError(err), 'error');
  }
}

function renderBooks(books) {
  if (books.length === 0) {
    bookList.innerHTML = '<tr><td colspan="5">No books found.</td></tr>';
    return;
  }
  bookList.innerHTML = books.map(book => `
    <tr>
      <td>${book.id}</td>
      <td>${escapeHTML(book.title)}</td>
      <td>${escapeHTML(book.author)}</td>
      <td>${book.price}</td>
      <td>
        <button class="edit" data-action="edit" data-id="${book.id}">Edit</button>
        <button class="danger" data-action="delete" data-id="${book.id}">Delete</button>
      </td>
    </tr>
  `).join('');
}


bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = bookIdInput.value;
  const bookData = {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    price: priceInput.value
  };

  const isUpdate = id !== '';
  const url = isUpdate ? `${API_URL}/${id}` : API_URL;
  const method = isUpdate ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
    await handleResponse(res);
    showMessage(isUpdate ? 'Book updated successfully' : 'Book added successfully', 'success');
    resetForm();
    loadBooks();
  } catch (err) {
    showMessage(friendlyError(err), 'error');
  }
});


bookList.addEventListener('click', async (e) => {
  const button = e.target.closest('button');
  if (!button) return;

  const id = button.dataset.id;

  if (button.dataset.action === 'edit') {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const book = await handleResponse(res);
      bookIdInput.value = book.id;
      titleInput.value = book.title;
      authorInput.value = book.author;
      priceInput.value = book.price;
      submitBtn.textContent = 'Update Book';
      cancelBtn.classList.remove('hidden');
      titleInput.focus();
    } catch (err) {
      showMessage(friendlyError(err), 'error');
    }
  }

  if (button.dataset.action === 'delete') {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      await handleResponse(res);
      showMessage('Book deleted successfully', 'success');
      loadBooks();
    } catch (err) {
      showMessage(friendlyError(err), 'error');
    }
  }
});

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  bookForm.reset();
  bookIdInput.value = '';
  submitBtn.textContent = 'Add Book';
  cancelBtn.classList.add('hidden');
}


loadBooks();