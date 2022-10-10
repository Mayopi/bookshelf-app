const form = document.querySelector(".add-book");
const searchForm = document.querySelector(".search-book");
const books = [];

const RENDER_EVENT = "render-books";
const CATCH_DATA = "local-books";
const STORAGE_KEY = "books";

document.addEventListener("DOMContentLoaded", () => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    addBook();
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    searchBook();
  });

  if (compatibleStorage) {
    loadData();
  }
});

document.addEventListener(RENDER_EVENT, () => {
  const uncompleted = document.querySelector(".not-read");
  const completed = document.querySelector(".after-read");

  uncompleted.innerHTML = "";
  completed.innerHTML = "";

  for (const book of books) {
    if (book.isCompleted) {
      const bookElement = makeElement(book, true);
      completed.appendChild(bookElement);
    } else {
      const bookElement = makeElement(book, false);
      uncompleted.appendChild(bookElement);
    }
  }
});

document.addEventListener(CATCH_DATA, () => {
  console.log(localStorage.getItem(STORAGE_KEY));
});

const generateId = () => {
  return +new Date();
};

const addBook = () => {
  const title = form.title.value;
  const author = form.author.value;
  const year = form.year.value;
  const readCheckbox = document.querySelector("#readCheckbox").checked;

  const id = generateId();

  const book = {
    id,
    title,
    author,
    year,
    isCompleted: readCheckbox,
  };

  const result = checkBook(book);

  if (!result) {
    const confirmResult = confirm("Buku ini sudah ada, apakah anda yakin untuk tetap menambahkan?");
    if (!confirmResult) {
      return;
    }
  }
  books.push(book);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
};

const makeElement = (book, complete) => {
  //make card container
  const cards = document.createElement("div");
  cards.classList.add("cards");

  //make card header
  const cardHeader = document.createElement("div");
  cardHeader.classList.add("card-header");

  const hr = document.createElement("hr");

  //make card body
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  const bookTitle = document.createElement("h3");
  bookTitle.innerText = book.title.toUpperCase();

  const ul = document.createElement("ul");
  const authorBook = document.createElement("li");
  const yearBook = document.createElement("li");
  authorBook.innerText = `Penulis: ${book.author}`;
  yearBook.innerText = `Tahun: ${book.year}`;

  //make card footer
  const cardFooter = document.createElement("div");
  cardFooter.classList.add("card-footer");
  let doneButton = document.createElement("button");
  doneButton.classList.add("btn-done");
  complete ? (doneButton.innerText = "Baca Ulang") : (doneButton.innerText = "Selesai");
  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Hapus";
  deleteButton.classList.add("btn-delete");

  cardFooter.appendChild(doneButton);
  cardFooter.appendChild(deleteButton);

  ul.appendChild(authorBook);
  ul.appendChild(yearBook);
  cardBody.appendChild(ul);

  cardHeader.appendChild(bookTitle);

  cards.appendChild(cardHeader);
  cards.appendChild(hr);
  cards.appendChild(cardBody);
  cards.appendChild(cardFooter);
  cards.setAttribute("id", `${book.id}`);

  doneButton.addEventListener("click", () => {
    complete ? updateRead(book.id) : doneBook(book.id);
  });

  deleteButton.addEventListener("click", () => {
    deleteBook(book.id);
  });

  return cards;
};

const checkBook = (book) => {
  let result = true;
  if (books.length) {
    for (const item of books) {
      if (book.title == item.title && book.author == item.author && book.year == item.year) {
        result = false;
      }
    }
  }

  return result;
};

const deleteBook = (id) => {
  books.forEach((book) => {
    if (id === book.id) {
      const confirmDelete = confirm(`Are you sure want to delete this book?

Title: ${book.title}
Author: ${book.author}
Year: ${book.year}`);

      if (confirmDelete) {
        const index = books.indexOf(book);
        books.splice(index, 1);
      }
      return;
    }
  });

  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
};

const doneBook = (id) => {
  books.forEach((book) => {
    if (id == book.id) {
      book.isCompleted = true;
    }
  });

  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
};

const updateRead = (id) => {
  books.forEach((book) => {
    if (id == book.id) {
      book.isCompleted = false;
    }
  });

  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
};

const compatibleStorage = () => {
  if (typeof Storage === null) {
    alert("Browser anda tidak mendukung Web Storage");
    return false;
  }

  return true;
};

const saveData = () => {
  if (!compatibleStorage) {
    return;
  }

  const data = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, data);
};

const loadData = () => {
  let data = localStorage.getItem(STORAGE_KEY);

  data = JSON.parse(data);

  if (data) {
    data.forEach((book) => {
      books.push(book);
    });
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

const searchBook = () => {
  let title = searchForm.search.value;

  if (title === "") {
    document.dispatchEvent(new Event(RENDER_EVENT));
    return;
  }

  // let data = localStorage.getItem(STORAGE_KEY);
  // data = JSON.parse(data);
  const allCards = document.querySelectorAll(".cards");

  allCards.forEach((cards) => {
    cards.hidden = false;
    const cardHeader = cards.firstChild;
    let h3 = cardHeader.firstChild.innerText;
    title = title.toUpperCase();

    if (title !== h3) {
      cards.setAttribute("hidden", true);
    }

    cards.scrollIntoView();
  });
};
