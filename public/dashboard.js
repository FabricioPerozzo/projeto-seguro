const todoList = document.getElementById('todoList');
const todoInput = document.getElementById('todoInput');
const emptyMsg = document.getElementById('emptyMsg');

fetch('/user')
    .then((r) => r.json())
    .then((data) => {
        document.getElementById('titulo').innerText = 'Bem-vindo, ' + data.username;
        document.getElementById('email').innerText = 'Email: ' + data.email;
    });

function renderTodos(todos) {
    todoList.innerHTML = '';
    emptyMsg.style.display = todos.length ? 'none' : 'block';
    todos.forEach((todo) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.done ? ' done' : '');

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!todo.done;
        cb.onchange = () => toggleTodo(todo.id, !todo.done);

        const span = document.createElement('span');
        span.textContent = todo.title;

        const btn = document.createElement('button');
        btn.className = 'btn-delete';
        btn.textContent = 'x';
        btn.onclick = () => deleteTodo(todo.id);

        li.appendChild(cb);
        li.appendChild(span);
        li.appendChild(btn);
        todoList.appendChild(li);
    });
}

function loadTodos() {
    fetch('/api/todos')
        .then((r) => r.json())
        .then(renderTodos);
}

function addTodo() {
    const title = todoInput.value.trim();
    if (!title) {
        return;
    }
    fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    }).then(() => {
        todoInput.value = '';
        loadTodos();
    });
}

function toggleTodo(id, done) {
    fetch('/api/todos/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done })
    }).then(() => loadTodos());
}

function deleteTodo(id) {
    fetch('/api/todos/' + id, { method: 'DELETE' }).then(() => loadTodos());
}

document.getElementById('addBtn').addEventListener('click', addTodo);

todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

loadTodos();
