const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Rota para criar uma nova tarefa
router.post('/tasks', taskController.createTask);
// Rota para listar todas as tarefas
router.get('/tasks', taskController.getAllTasks);

// Rota para listar uma tarefa por ID
router.get('/tasks/:id', taskController.getTaskById);

// Rota para editar uma tarefa
router.patch('/tasks/:id', taskController.updateTask);


// Rota para editar o status de uma tarefa
router.patch('/tasks/:id/status', taskController.updateStatusTask);

// Rota para deletar uma tarefa
router.delete('/tasks/:id', taskController.deleteTask);

module.exports = router;
