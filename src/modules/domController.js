// src/modules/domController.js
import todoManager from './todoManager.js';
import { parseISO, format } from 'date-fns';


const domController = (() => {
    const openEditDialog = (todo) => {
        const todoDialog = document.getElementById('todo-dialog');
        const todoForm = document.getElementById('todo-form');
        const submitBtn = todoForm.querySelector('button[type="submit"]');
        const dialogTitle = todoDialog.querySelector('h3');

        // Populate form with existing todo data
        document.getElementById('todo-title').value = todo.title;
        document.getElementById('todo-description').value = todo.description || '';
        document.getElementById('todo-dueDate').value = todo.dueDate || '';
        document.getElementById('todo-priority').value = todo.priority;
        document.getElementById('todo-project').value = todo.projectName || '';

        // Change submit button text
        submitBtn.textContent = 'update to-do';
        dialogTitle.textContent = 'edit to-do';

        // Store the todo ID on the form for reference
        todoForm.dataset.editingId = todo.id;

        todoDialog.showModal();
    };

    const renderProjects = () => {
        const projectList = document.getElementById('project-list');
        projectList.innerHTML = '';

        const projects = todoManager.getProjects();

        if (projects.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'no projects yet!';
            //   li.style.cursor = 'default';
            //   li.style.background = 'transparent';
            projectList.appendChild(li);
            return;
        }

        projects.forEach(project => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.textContent = project.name;
            btn.type = 'button';
            if (todoManager.getCurrentProject() === project.name) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                todoManager.setCurrentProject(project.name);
                todoManager.setCurrentFilter('all');
                updateMainTitle();
                renderProjects();
                renderTodos();
                updateFilterButtons();
            });
            li.appendChild(btn);
            projectList.appendChild(li);
        });
    };

    const updateProjectSelect = () => {
        const select = document.getElementById('todo-project');
        select.innerHTML = '<option value="">none</option>';

        const projects = todoManager.getProjects();
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.name;
            option.textContent = project.name;
            select.appendChild(option);
        });
    };

    const updateMainTitle = () => {
        const mainTitle = document.getElementById('main-title');
        if (!mainTitle) return; // safety check

        const currentProject = todoManager.getCurrentProject();
        const currentFilter = todoManager.getCurrentFilter();

        if (currentProject) {
            mainTitle.textContent = currentProject;
        } else {
            switch (currentFilter) {
                case 'today':
                    mainTitle.textContent = 'today';
                    break;
                case 'tomorrow':
                    mainTitle.textContent = 'tomorrow';
                    break;
                case 'week':
                    mainTitle.textContent = 'this week';
                    break;
                default:
                    mainTitle.textContent = 'all to-do\'s';
            }
        }
    };

    const updateFilterButtons = () => {
        const buttons = document.querySelectorAll('.todo-options button');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === todoManager.getCurrentFilter() && !todoManager.getCurrentProject()) {
                btn.classList.add('active');
            }
        });

        const projectButtons = document.querySelectorAll('.project-list button');
        projectButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === todoManager.getCurrentProject()) {
                btn.classList.add('active');
            }
        });
    };

    const renderTodos = () => {
        const todoList = document.getElementById('todo-list');
        if (!todoList) return;
        todoList.innerHTML = '';

        const todosToRender = todoManager.getTodosByFilter();

        if (todosToRender.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = '<p>no to-do\'s yet! click the + button to add one 😊</p>';
            todoList.appendChild(emptyState);
            return;
        }

        todosToRender.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item priority-${todo.priority}`;

            if (todo.completed) {
                li.classList.add('completed');
            }

            // Add checkbox at the beginning
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => {
                todoManager.toggleTodoComplete(todo.id);
                renderTodos();
            });

            const content = document.createElement('div');
            content.className = 'todo-content';

            const title = document.createElement('div');
            title.className = 'todo-title';
            title.textContent = todo.title;

            content.appendChild(title);

            if (todo.description) {
                const desc = document.createElement('div');
                desc.className = 'todo-description';
                desc.textContent = todo.description;
                content.appendChild(desc);
            }

            const meta = document.createElement('div');
            meta.className = 'todo-meta';

            let dueDateText = 'No due date';
            if (todo.dueDate) {
                const todoDate = parseISO(todo.dueDate);
                dueDateText = format(todoDate, 'MMM d, yyyy');
            }

            meta.innerHTML = `<span>📅 ${dueDateText}</span><span>⚡ ${todo.priority}</span>`;
            if (todo.projectName) {
                meta.innerHTML += `<span>📁 ${todo.projectName}</span>`;
            }

            content.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'todo-actions';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'delete';
            deleteBtn.addEventListener('click', () => {
                todoManager.deleteTodo(todo.id);
                renderTodos();
            });

            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = 'edit';
            editBtn.addEventListener('click', () => {
                openEditDialog(todo);
                renderTodos();
            });

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            li.appendChild(checkbox);
            li.appendChild(content);
            li.appendChild(actions);
            todoList.appendChild(li);
        });
    };

    const init = () => {
        renderProjects();
        renderTodos();
        updateProjectSelect();
        updateMainTitle();

        // Todo dialog handlers
        const todoDialog = document.getElementById('todo-dialog');
        const addTodoBtn = document.getElementById('add-todo-btn');
        const cancelTodoBtn = document.getElementById('cancel-todo-btn');
        const todoForm = document.getElementById('todo-form');

        addTodoBtn.addEventListener('click', () => {
            todoDialog.showModal();
        });

        cancelTodoBtn.addEventListener('click', () => {
            todoDialog.close();
            todoForm.reset();
        });

        todoDialog.addEventListener('click', (e) => {
            if (e.target === todoDialog) {
                todoDialog.close();
                todoForm.reset();
            }
        });

        todoForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('todo-title').value.trim();
            const description = document.getElementById('todo-description').value.trim();
            const dueDate = document.getElementById('todo-dueDate').value; // empty string if not set
            const priority = document.getElementById('todo-priority').value;
            const projectName = document.getElementById('todo-project').value;

            console.log('Form dueDate value:', dueDate); // Debug log

            if (!title) return;

            const editingId = todoForm.dataset.editingId;

            if (editingId) {
                // Edit mode
                todoManager.editTodo(Number(editingId), {
                    title,
                    description,
                    dueDate: dueDate || null,
                    priority,
                    projectName: projectName || null
                });
                delete todoForm.dataset.editingId;
                todoForm.querySelector('button[type="submit"]').textContent = 'Add To-Do';
            } else {
                // Add mode
                todoManager.addTodo(title, description, dueDate || null, priority, projectName);
            }

            todoForm.reset();
            todoDialog.close();
            renderTodos();
        });

        // Project dialog handlers
        const projectDialog = document.getElementById('project-dialog');
        const addProjectBtn = document.getElementById('add-project-btn');
        const cancelProjectBtn = document.getElementById('cancel-project-btn');
        const projectForm = document.getElementById('project-form');

        addProjectBtn.addEventListener('click', () => {
            projectDialog.showModal();
        });

        cancelProjectBtn.addEventListener('click', () => {
            projectDialog.close();
            projectForm.reset();
        });

        projectDialog.addEventListener('click', (e) => {
            if (e.target === projectDialog) {
                projectDialog.close();
                projectForm.reset();
            }
        });

        const resetFormState = () => {
            todoForm.reset();
            delete todoForm.dataset.editingId;
            todoForm.querySelector('button[type="submit"]').textContent = 'Add To-Do';
        };

        cancelTodoBtn.addEventListener('click', () => {
            todoDialog.close();
            resetFormState();
        });

        todoDialog.addEventListener('click', (e) => {
            if (e.target === todoDialog) {
                todoDialog.close();
                resetFormState();
            }
        });

        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('project-name').value.trim();

            if (!name) return;

            todoManager.addProject(name);

            projectForm.reset();
            projectDialog.close();
            renderProjects();
            updateProjectSelect();
        });

        // Filter buttons
        const filterButtons = document.querySelectorAll('.todo-options button');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                todoManager.setCurrentFilter(filter);
                todoManager.setCurrentProject(null);
                updateMainTitle();
                updateFilterButtons();
                renderProjects();
                renderTodos();
            });
        });
    };

    return { init, renderProjects, renderTodos };
})();

export default domController;