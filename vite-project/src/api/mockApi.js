import { v4 as uuidv4 } from 'uuid';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStorage = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize default seed data if empty
if (!localStorage.getItem('taskflow_users')) {
  setStorage('taskflow_users', [{ id: 'seed-user-uuid', name: 'Test User', email: 'test@example.com', password: 'password123' }]);
}
if (!localStorage.getItem('taskflow_projects')) {
  setStorage('taskflow_projects', [{ id: 'seed-project-uuid', name: 'Website Redesign', description: 'Q2 Project Delivery', owner_id: 'seed-user-uuid', created_at: new Date().toISOString() }]);
}
if (!localStorage.getItem('taskflow_tasks')) {
  setStorage('taskflow_tasks', [
    { id: 'seed-task-1', title: 'Design Homepage', description: 'Create Figma mockups', status: 'todo', priority: 'high', project_id: 'seed-project-uuid', assignee_id: 'seed-user-uuid', due_date: '2026-04-15', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'seed-task-2', title: 'Setup Authentication', description: 'JWT strategy', status: 'in_progress', priority: 'medium', project_id: 'seed-project-uuid', assignee_id: 'seed-user-uuid', due_date: '2026-04-20', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'seed-task-3', title: 'Initialize Repository', description: 'Vite + React', status: 'done', priority: 'low', project_id: 'seed-project-uuid', assignee_id: 'seed-user-uuid', due_date: '2026-04-10', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ]);
}

const mockApi = {
  // --- AUTH ---
  register: async (data) => {
    await delay(500);
    const users = getStorage('taskflow_users', []);
    if (users.find((u) => u.email === data.email)) {
      return { error: 'validation failed', fields: { email: 'already exists' } };
    }
    const newUser = { id: uuidv4(), name: data.name, email: data.email, password: data.password };
    users.push(newUser);
    setStorage('taskflow_users', users);
    const userWithoutPass = { id: newUser.id, name: newUser.name, email: newUser.email };
    return { status: 201, data: { token: 'mock-jwt-token-' + newUser.id, user: userWithoutPass } };
  },

  login: async (data) => {
    await delay(500);
    const users = getStorage('taskflow_users', []);
    const user = users.find((u) => u.email === data.email && u.password === data.password);
    if (!user) {
      return { status: 401, error: 'unauthorized', message: 'Invalid credentials' };
    }
    const userWithoutPass = { id: user.id, name: user.name, email: user.email };
    return { status: 200, data: { token: 'mock-jwt-token-' + user.id, user: userWithoutPass } };
  },

  // --- PROJECTS ---
  getProjects: async (userId) => {
    await delay(300);
    const projects = getStorage('taskflow_projects', []);
    const tasks = getStorage('taskflow_tasks', []);
    
    const userProjects = projects.filter(p => p.owner_id === userId).map(p => {
      const projectTasks = tasks.filter(t => t.project_id === p.id);
      return {
        ...p,
        total_tasks: projectTasks.length,
        completed_tasks: projectTasks.filter(t => t.status === 'done').length
      };
    });
    
    return { status: 200, data: { projects: userProjects } };
  },

  createProject: async (userId, data) => {
    await delay(400);
    const newProject = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      owner_id: userId,
      created_at: new Date().toISOString()
    };
    const projects = getStorage('taskflow_projects', []);
    projects.push(newProject);
    setStorage('taskflow_projects', projects);
    return { status: 201, data: newProject };
  },

  getProjectById: async (userId, id) => {
    await delay(300);
    const projects = getStorage('taskflow_projects', []);
    const project = projects.find(p => p.id === id);
    if (!project || project.owner_id !== userId) return { status: 404, error: 'not found' };
    
    const tasks = getStorage('taskflow_tasks', []).filter(t => t.project_id === id);
    return { status: 200, data: { ...project, tasks } };
  },

  updateProject: async (userId, id, data) => {
    await delay(400);
    const projects = getStorage('taskflow_projects', []);
    const index = projects.findIndex(p => p.id === id);
    if (index === -1 || projects[index].owner_id !== userId) return { status: 404, error: 'not found' };
    
    projects[index] = { ...projects[index], ...data };
    setStorage('taskflow_projects', projects);
    return { status: 200, data: projects[index] };
  },

  deleteProject: async (userId, id) => {
    await delay(400);
    let projects = getStorage('taskflow_projects', []);
    const project = projects.find(p => p.id === id);
    if (!project || project.owner_id !== userId) return { status: 403, error: 'forbidden' };
    
    projects = projects.filter(p => p.id !== id);
    setStorage('taskflow_projects', projects);
    
    let tasks = getStorage('taskflow_tasks', []);
    tasks = tasks.filter(t => t.project_id !== id);
    setStorage('taskflow_tasks', tasks);
    
    return { status: 204 };
  },

  // --- TASKS ---
  createTask: async (projectId, data) => {
    await delay(400);
    if (!data.title) return { status: 400, error: 'validation failed', fields: { title: 'is required' } };

    const newTask = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      project_id: projectId,
      assignee_id: data.assignee_id || null,
      due_date: data.due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const tasks = getStorage('taskflow_tasks', []);
    tasks.push(newTask);
    setStorage('taskflow_tasks', tasks);
    
    return { status: 201, data: newTask };
  },

  updateTask: async (id, data) => {
    await delay(300);
    const tasks = getStorage('taskflow_tasks', []);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return { status: 404, error: 'not found' };
    
    tasks[index] = { ...tasks[index], ...data, updated_at: new Date().toISOString() };
    setStorage('taskflow_tasks', tasks);
    
    return { status: 200, data: tasks[index] };
  },

  deleteTask: async (id) => {
    await delay(400);
    let tasks = getStorage('taskflow_tasks', []);
    if (!tasks.find(t => t.id === id)) return { status: 404, error: 'not found' };
    
    tasks = tasks.filter(t => t.id !== id);
    setStorage('taskflow_tasks', tasks);
    
    return { status: 204 };
  },

  getUsers: async () => {
    await delay(200);
    const users = getStorage('taskflow_users', []);
    return { status: 200, data: users.map(u => ({ id: u.id, name: u.name, email: u.email })) };
  }
};

export default mockApi;
