const Task = require('../models/Task');

// Criar uma nova tarefa
exports.createTask = async (req, res) => {
  try {
    const { company, status, title, description, priority, deadline, notes, createdBy, assignedTo } = req.body;

    const newTask = new Task({
      company,
      status,
      title,
      description,
      priority,
      deadline,
      notes,
      createdBy,
      assignedTo,
      history: [
        {
          user: createdBy, // ID ou nome do usuário que criou a tarefa
          event: 'Task Created',
          details: { title, description, priority, deadline, notes, assignedTo },
        },
      ],
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar a tarefa', error });
  }
};


// Listar todas as tarefas com os dados do usuário que criou a tarefa
exports.getAllTasks = async (req, res) => {
  try {
    // Popula o campo 'createdBy' com os dados do usuário (ex.: nome e email)
    const tasks = await Task.find().populate('createdBy');

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar as tarefas', error });
  }
};

  
  // Listar tarefa por ID
  exports.getTaskById = async (req, res) => {
    try {
      const { id } = req.params;
      const task = await Task.findById(id).populate('createdBy', 'name');
  
      if (!task) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
      }
  
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao obter a tarefa', error });
    }
  };
  
  exports.updateTask = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, priority, deadline, notes, assignedTo, user } = req.body;
  
      const task = await Task.findById(id);
  
      if (!task) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
      }
  
      const changes = {};
      if (title && title !== task.title) changes.title = { old: task.title, new: title };
      if (description && description !== task.description) changes.description = { old: task.description, new: description };
      if (priority && priority !== task.priority) changes.priority = { old: task.priority, new: priority };
      if (deadline && deadline !== task.deadline?.toISOString()) changes.deadline = { old: task.deadline, new: deadline };
      if (notes && notes !== task.notes) changes.notes = { old: task.notes, new: notes };
      if (assignedTo && assignedTo.toString() !== task.assignedTo?.toString()) changes.assignedTo = { old: task.assignedTo, new: assignedTo };
  
      Object.assign(task, { title, description, priority, deadline, notes, assignedTo });
  
      task.history.push({
        user,
        event: 'Task Updated',
        details: changes,
      });
  
      await task.save();
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar a tarefa', error });
    }
  };
  

  exports.updateStatusTask = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, user } = req.body;
  
      const task = await Task.findById(id);
  
      if (!task) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
      }
  
      const oldStatus = task.status;
      task.status = status;
  
      task.history.push({
        user,
        event: 'Status Updated',
        details: { old: oldStatus, new: status },
      });
  
      await task.save();
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar o status da tarefa', error });
    }
  };
  
  
  
  // Deletar tarefa
  exports.deleteTask = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedTask = await Task.findByIdAndDelete(id);
  
      if (!deletedTask) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
      }
  
      res.status(200).json({ message: 'Tarefa deletada com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao deletar a tarefa', error });
    }
  };
