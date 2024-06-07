document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const taskSection = document.getElementById('task-section');
    const userNameSpan = document.getElementById('user-name');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const sharedTaskList = document.getElementById('shared-task-list');
    const logoutBtn = document.getElementById('logout-btn');

    // Modal elements
    const editTaskModal = document.getElementById('edit-task-modal');
    const closeModalBtn = document.querySelector('.close');
    const editTaskForm = document.getElementById('edit-task-form');
    const editTaskTitle = document.getElementById('edit-task-title');
    const editTaskDesc = document.getElementById('edit-task-desc');
    const editTaskDeadline = document.getElementById('edit-task-deadline');

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let currentTaskToEdit = null;

    if (currentUser) {
        showTaskSection();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showTaskSection();
        } else {
            alert('Invalid username or password');
        }
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        if (users.find(user => user.username === username)) {
            alert('Username already exists');
            return;
        }

        const newUser = { name, username, password, tasks: [], sharedTasks: [] };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('User registered successfully');
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const deadline = document.getElementById('task-deadline').value;

        const newTask = { title, description, deadline, owner: currentUser.username, sharedWith: [] };
        currentUser.tasks.push(newTask);
        users = users.map(user => user.username === currentUser.username ? currentUser : user);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        displayTasks();
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        authSection.style.display = 'block';
        taskSection.style.display = 'none';
    });

    function showTaskSection() {
        authSection.style.display = 'none';
        taskSection.style.display = 'block';
        userNameSpan.textContent = currentUser.name;
        displayTasks();
    }

    function displayTasks() {
        taskList.innerHTML = '';
        currentUser.tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${task.title} - ${task.description} - ${task.deadline}</span>
                            <button onclick="editTask('${task.title}')">Edit</button>
                            <button onclick="deleteTask('${task.title}')">Delete</button>
                            <button onclick="shareTask('${task.title}')">Share</button>`;
            taskList.appendChild(li);
        });

        sharedTaskList.innerHTML = '';
        currentUser.sharedTasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${task.title} - ${task.description} - ${task.deadline} (Owner: ${task.owner})</span>`;
            sharedTaskList.appendChild(li);
        });
    }

    window.editTask = (title) => {
        currentTaskToEdit = currentUser.tasks.find(task => task.title === title);
        editTaskTitle.value = currentTaskToEdit.title;
        editTaskDesc.value = currentTaskToEdit.description;
        editTaskDeadline.value = currentTaskToEdit.deadline;
        editTaskModal.style.display = 'block';
    };

    window.deleteTask = (title) => {
        currentUser.tasks = currentUser.tasks.filter(task => task.title !== title);
        users = users.map(user => user.username === currentUser.username ? currentUser : user);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        displayTasks();
    };

    window.shareTask = (title) => {
        const shareWithUsername = prompt('Enter the username to share this task with:');
        const userToShareWith = users.find(user => user.username === shareWithUsername);

        if (userToShareWith) {
            const taskToShare = currentUser.tasks.find(task => task.title === title);
            userToShareWith.sharedTasks.push({ ...taskToShare });
            users = users.map(user => user.username === userToShareWith.username ? userToShareWith : user);
            localStorage.setItem('users', JSON.stringify(users));
            alert('Task shared successfully');
        } else {
            alert('User not found');
        }
    };

    editTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentTaskToEdit.title = editTaskTitle.value;
        currentTaskToEdit.description = editTaskDesc.value;
        currentTaskToEdit.deadline = editTaskDeadline.value;
        users = users.map(user => user.username === currentUser.username ? currentUser : user);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        editTaskModal.style.display = 'none';
        displayTasks();
    });

    closeModalBtn.onclick = () => {
        editTaskModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == editTaskModal) {
            editTaskModal.style.display = 'none';
        }
    };
});
