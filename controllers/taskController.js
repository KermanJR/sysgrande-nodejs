const Task = require('../models/Task');
const User = require('../models/User');
const { sendAssignmentEmail } = require('../services/emailService');

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


exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('history.user', 'name email')
      .populate('history.details.assignedUser', 'name email'); // Inclui o assignedUser no histórico

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar as tarefas', error });
  }
};


  
  // Listar tarefa por ID
  exports.getTaskById = async (req, res) => {
    try {
      const { id } = req.params;
      const task = await Task.findById(id).populate('createdBy', 'name', 'history');
  
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

  // Nova função para atribuir usuário à tarefa
exports.assignUserToTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId, currentUser } = req.body;

    // Busca a tarefa e o usuário
    const task = await Task.findById(taskId);
    const user = await User.findById(userId);

    console.log(taskId)

    if (!task || !user) {
      return res.status(404).json({ 
        message: 'Tarefa ou usuário não encontrado' 
      });
    }

    // Verifica se o usuário já está atribuído
    const isUserAlreadyAssigned = task.assignedTo.some(
      id => id.toString() === userId
    );

    if (isUserAlreadyAssigned) {
      // Remove o usuário se já estiver atribuído
      task.assignedTo = task.assignedTo.filter(
        id => id.toString() !== userId
      );
      
      task.history.push({
        user: currentUser,
        event: 'User Unassigned',
        details: { 
          unassignedUser: userId,
          timestamp: new Date()
        }
      });

      await task.save();

      return res.status(200).json({
        message: 'Usuário removido da tarefa com sucesso',
        task
      });
    }

    // Adiciona o usuário à tarefa
    task.assignedTo.push(userId);

    // Registra no histórico
    task.history.push({
      user: currentUser,
      event: 'User Assigned',
      details: {
        assignedUser: userId,
        timestamp: new Date()
      }
    });

    // Salva as alterações
    await task.save();

    // Envia email para o usuário
    const emailSent = await sendAssignmentEmail(user, task);

    res.status(200).json({
      message: 'Usuário atribuído com sucesso',
      emailSent,
      task
    });

  } catch (error) {
    console.error('Erro ao atribuir usuário:', error);
    res.status(500).json({
      message: 'Erro ao atribuir usuário à tarefa',
      error: error.message
    });
  }
};

