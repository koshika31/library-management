class LibraryManager {
    constructor() {
        this.books = [];
        this.issuedBooks = [];
        this.FINE_RATE = 5;
        this.LOAN_PERIOD = 7;
    }

    init() {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });

        document.getElementById('addBookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBook();
            modal.style.display = "none";
        });

        document.getElementById('issueBookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.issueBook();
        });

        document.getElementById('returnStudentIdSearch').addEventListener('input', () => {
            this.displayReturnBooks();
        });
        
        document.getElementById('returnStudentIdSearch').addEventListener('focus', () => {
            const fineDisplay = document.getElementById('fineDisplay');
            fineDisplay.textContent = '';
        });

        document.getElementById('studentHistoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.showStudentHistory();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterBooks();
        });

        document.getElementById('searchInput').addEventListener('input', () => {
            this.searchBooks();
        });

        const modal = document.getElementById("addBookModal");
        const btn = document.getElementById("addBookModalBtn");
        const span = document.getElementsByClassName("close-btn")[0];

        btn.onclick = function() {
            modal.style.display = "block";
        }

        span.onclick = function() {
            modal.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        this.loadBooks();
        this.loadIssuedBooks();
    }

    async loadBooks() {
        try {
            const response = await fetch('/api/books');
            const books = await response.json();
            if (Array.isArray(books)) {
                this.books = books.filter(book => book.title);
            } else {
                this.books = [];
            }
        } catch (error) {
            console.error('Error loading books:', error);
            this.books = [];
        } finally {
            this.displayBooks();
            this.updateBookLists();
        }
    }

    async loadIssuedBooks() {
        try {
            const response = await fetch('/api/issued-books');
            const issuedBooks = await response.json();
            if (Array.isArray(issuedBooks)) {
                this.issuedBooks = issuedBooks.filter(book => book.title).map(book => ({
                    ...book,
                    fine_paid: parseFloat(book.fine_paid) || 0,
                }));
            } else {
                this.issuedBooks = [];
            }
        } catch (error) {
            console.error('Error loading issued books:', error);
            this.issuedBooks = [];
        } finally {
            this.updateIssuedBooksTable();
            this.updateFinesList();
        }
    }

    async saveBooks() {
        await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: this.books }),
        });
    }

    async saveIssuedBooks() {
        await fetch('/api/issued-books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: this.issuedBooks }),
        });
    }

    addBook() {
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const category = document.getElementById('category').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const price = parseFloat(document.getElementById('price').value);

        const newId = this.books.length > 0 ? Math.max(...this.books.map(b => b.id)) + 1 : 1;

        const book = {
            id: newId,
            title,
            author,
            category,
            quantity,
            price
        };

        this.books.push(book);
        this.updateBookLists();
        this.displayBooks();
        this.saveBooks();
        document.getElementById('addBookForm').reset();
    }

    removeBook(id) {
        this.books = this.books.filter(book => book.id != id);
        this.displayBooks();
        this.saveBooks();
    }

    updateBookLists() {
        const issueBookSelect = document.getElementById('issueBookSelect');
        issueBookSelect.innerHTML = '<option value="">Select Book</option>';

        this.books.forEach(book => {
            if (book.quantity > 0) {
                const option = new Option(book.title, book.title);
                issueBookSelect.add(option);
            }
        });
    }

    issueBook() {
        const studentName = document.getElementById('studentName').value;
        const studentId = document.getElementById('studentId').value;
        const bookTitle = document.getElementById('issueBookSelect').value;

        const book = this.books.find(b => b.title === bookTitle);
        if (book && book.quantity > 0) {
            book.quantity--;
            const issueDate = new Date();
            const dueDate = new Date(issueDate);
            dueDate.setDate(issueDate.getDate() + this.LOAN_PERIOD);

            const issuedBook = {
                title: bookTitle,
                student_id: studentId,
                student_name: studentName,
                issue_date: issueDate.toLocaleString(),
                due_date: [
                    dueDate.getFullYear(),
                    ('0' + (dueDate.getMonth() + 1)).slice(-2),
                    ('0' + dueDate.getDate()).slice(-2)
                ].join('-'),
                return_date: '',
                fine_paid: 0
            };

            this.issuedBooks.push(issuedBook);
            this.updateBookLists();
            this.updateFinesList();
            this.displayBooks();
            this.saveBooks();
            this.saveIssuedBooks();
            document.getElementById('issueBookForm').reset();
            this.updateIssuedBooksTable();
        } else {
            alert('Book not available or not found.');
        }
    }

    displayReturnBooks() {
        const studentId = document.getElementById('returnStudentIdSearch').value;
        const tableBody = document.querySelector('#returnBooksTable tbody');
        tableBody.innerHTML = '';
        document.getElementById('fineDisplay').textContent = '';

        if (studentId) {
            const studentBooks = this.issuedBooks.filter(book => book.student_id === studentId && !book.return_date);
            studentBooks.forEach(book => {
                const tempBookForFineCalc = {
                    ...book,
                    return_date: new Date().toLocaleString()
                };
                const potentialFine = this.calculateFine(tempBookForFineCalc);

                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.issue_date}</td>
                    <td>${book.due_date}</td>
                    <td>₹${potentialFine}</td>
                    <td><button class="btn-primary return-btn" data-title="${book.title}">Return</button></td>
                `;
            });

            document.querySelectorAll('.return-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const bookTitle = e.target.dataset.title;
                    this.returnBook(bookTitle);
                });
            });
        }
    }

    returnBook(bookTitle) {
        const studentId = document.getElementById('returnStudentIdSearch').value;

        const issuedBook = this.issuedBooks.find(b => b.student_id === studentId && b.title === bookTitle && !b.return_date);

        if (issuedBook) {
            const book = this.books.find(b => b.title === bookTitle);
            if (book) {
                book.quantity++;
            }

            const returnDate = new Date();
            issuedBook.return_date = returnDate.toLocaleString();
            const fine = this.calculateFine(issuedBook);
            issuedBook.fine_paid = fine;

            this.updateBookLists();
            this.updateFinesList();
            this.displayBooks();
            this.saveBooks();
            this.saveIssuedBooks();
            this.displayReturnBooks();
            this.updateIssuedBooksTable();

            const fineDisplay = document.getElementById('fineDisplay');
            fineDisplay.textContent = `Book "${bookTitle}" returned successfully. Fine: ₹${fine}`;
            fineDisplay.style.color = 'var(--success-color)';
            fineDisplay.style.borderColor = 'var(--success-color)';
        } else {
            alert('Issued book not found.');
        }
    }

    calculateFine(issuedBook) {
        const [year, month, day] = issuedBook.due_date.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);

        const returnDate = new Date(issuedBook.return_date);
        dueDate.setHours(0, 0, 0, 0);
        returnDate.setHours(0, 0, 0, 0);

        if (returnDate > dueDate) {
            const diffTime = Math.abs(returnDate - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays * this.FINE_RATE;
        }
        return 0;
    }

    updateFinesList() {
        const finesList = document.getElementById('finesList');
        const totalFinesDisplay = document.getElementById('totalFinesDisplay');
        finesList.innerHTML = '';
        let grandTotalFine = 0;
        const studentFines = {};

        this.issuedBooks.forEach(issuedBook => {
            if (!issuedBook.return_date) {
                const [year, month, day] = issuedBook.due_date.split('-').map(Number);
                const dueDate = new Date(year, month - 1, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (today > dueDate) {
                    const diffTime = Math.abs(today - dueDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const fine = diffDays * this.FINE_RATE;

                    if (!studentFines[issuedBook.student_id]) {
                        studentFines[issuedBook.student_id] = {
                            name: issuedBook.student_name,
                            totalFine: 0,
                            books: []
                        };
                    }
                    studentFines[issuedBook.student_id].totalFine += fine;
                    studentFines[issuedBook.student_id].books.push(`<li>${issuedBook.title}: ₹${fine}</li>`);
                }
            }
        });

        for (const studentId in studentFines) {
            const studentData = studentFines[studentId];
            grandTotalFine += studentData.totalFine;

            const fineItem = document.createElement('div');
            fineItem.className = 'fine-item';
            fineItem.innerHTML = `
                <h3>${studentData.name} (ID: ${studentId})</h3>
                <p class="fine-due">Holds a Fine of: ₹${studentData.totalFine}</p>
                <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">${studentData.books.join('')}</ul>
            `;
            finesList.appendChild(fineItem);
        }

        totalFinesDisplay.textContent = `Total Outstanding Fine: ₹${grandTotalFine}`;
    }

    updateIssuedBooksTable() {
        const tableBody = document.querySelector('#issuedBooksTable tbody');
        tableBody.innerHTML = '';
        this.issuedBooks.forEach(issuedBook => {
            if (!issuedBook.return_date) {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${issuedBook.title}</td>
                    <td>${issuedBook.student_id}</td>
                    <td>${issuedBook.student_name}</td>
                    <td>${issuedBook.issue_date}</td>
                    <td>${issuedBook.due_date}</td>
                `;
            }
        });
    }

    filterBooks() {
        this.searchBooks();
    }

    searchBooks() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value;

        let filteredBooks = this.books;

        if (category !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.category === category);
        }

        if (searchTerm) {
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm) || 
                book.author.toLowerCase().includes(searchTerm)
            );
        }

        this.displayBooks(filteredBooks);
    }

    displayBooks(booksToDisplay = this.books) {
        const container = document.getElementById('booksContainer');
        container.innerHTML = '';

        booksToDisplay.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <span class="category-tag">${book.category}</span>
                <h3>${book.title}</h3>
                <p>by ${book.author}</p>
                <p>Quantity: ${book.quantity}</p>
                <p>Price: ₹${book.price}</p>
                <button class="remove-btn" onclick="libraryManager.removeBook(${book.id})">
                    Remove
                </button>
            `;
            container.appendChild(bookCard);
        });
    }

    showStudentHistory() {
        const studentId = document.getElementById('studentHistoryId').value;
        const historyDisplay = document.getElementById('studentHistoryDisplay');
        historyDisplay.innerHTML = '';

        if (studentId) {
            const studentBooks = this.issuedBooks.filter(book => book.student_id === studentId);
            if (studentBooks.length > 0) {
                const studentName = studentBooks[0].student_name;
                let historyHTML = `<h3>History for ${studentName} (ID: ${studentId})</h3>`;
                historyHTML += `<p>Total books issued: ${studentBooks.length}</p>`;
                
                const returnedBooks = studentBooks.filter(book => book.return_date);
                historyHTML += `<p>Total books returned: ${returnedBooks.length}</p>`;

                const totalFinePaid = returnedBooks.reduce((sum, book) => sum + (parseFloat(book.fine_paid) || 0), 0);
                historyHTML += `<p>Total fine paid: ₹${totalFinePaid}</p>`;

                historyHTML += `
                    <table>
                        <thead>
                            <tr>
                                <th>Book Title</th>
                                <th>Issue Date</th>
                                <th>Return Date</th>
                                <th>Fine Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                studentBooks.forEach(book => {
                    const fineDisplay = book.return_date ? `₹${book.fine_paid || 0}` : '₹0';
                    historyHTML += `
                        <tr>
                            <td>${book.title}</td>
                            <td>${book.issue_date}</td>
                            <td>${book.return_date || 'Not Returned'}</td>
                            <td>${fineDisplay}</td>
                        </tr>
                    `;
                });
                historyHTML += '</tbody></table>';
                historyDisplay.innerHTML = historyHTML;
            } else {
                historyDisplay.innerHTML = '<p>No history found for this student.</p>';
            }
        }
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.getElementById(tabId + 'Tab').classList.add('active');
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    }
}

const libraryManager = new LibraryManager();

document.addEventListener('DOMContentLoaded', () => {
    libraryManager.init();
});