// src/modules/todoManager.js
import { isToday, isTomorrow, isWithinInterval, addDays, startOfDay, parseISO } from 'date-fns';

const todoManager = (() => {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let currentProject = null;
    let currentFilter = 'all';

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const saveProjects = () => {
        localStorage.setItem('projects', JSON.stringify(projects));
    };

    const addTodo = (title, description, dueDate, priority, projectName) => {
        const todo = {
            id: Date.now(),
            title,
            description,
            dueDate: dueDate || null,
            priority,
            projectName: projectName || null,
            completed: false
        };
        todos.push(todo);
        saveTodos();
        return todo;
    };

    const deleteTodo = (id) => {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
    };

    const editTodo = (id, updatedFields) => {
        todos = todos.map(t => t.id === id ? { ...t, ...updatedFields } : t);
        saveTodos();
    };

    const addProject = (name) => {
        const project = { name };
        projects.push(project);
        saveProjects();
        return project;
    };

    const getProjects = () => projects;

    const setCurrentProject = (projectName) => {
        currentProject = projectName;
    };

    const getCurrentProject = () => currentProject;

    const setCurrentFilter = (filter) => {
        currentFilter = filter;
    };

    const getCurrentFilter = () => currentFilter;

    const getTodosByFilter = () => {
        let filtered = [...todos];

        if (currentProject) {
            filtered = filtered.filter(t => t.projectName === currentProject);
        }

        if (currentFilter === 'today') {
            filtered = filtered.filter(t => {
                if (!t.dueDate) return false;
                const todoDate = parseISO(t.dueDate);
                return isToday(todoDate);
            });
        } else if (currentFilter === 'tomorrow') {
            filtered = filtered.filter(t => {
                if (!t.dueDate) return false;
                const todoDate = parseISO(t.dueDate);
                return isTomorrow(todoDate);
            });
        } else if (currentFilter === 'week') {
            filtered = filtered.filter(t => {
                if (!t.dueDate) return false;
                const todoDate = parseISO(t.dueDate);
                const today = startOfDay(new Date());
                const weekEnd = addDays(today, 7);
                return isWithinInterval(todoDate, { start: today, end: weekEnd });
            });
        }

        return filtered;
    };

    const getAllTodos = () => todos;

    const toggleTodoComplete = (id) => {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            saveTodos();
        }
    };

    return {
        addTodo,
        editTodo,
        deleteTodo,
        addProject,
        getProjects,
        setCurrentProject,
        getCurrentProject,
        setCurrentFilter,
        getCurrentFilter,
        getTodosByFilter,
        getAllTodos,
        toggleTodoComplete  
    };
})();

export default todoManager;