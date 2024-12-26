const Task = require('../models/Task');

// Criar uma nova tarefa
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, deadline, notes, createdBy, assignedTo } = req.body;
    //const createdByObjectId = mongoose.Types.ObjectId(createdBy);
    // Criar uma nova instância de Task
    const newTask = new Task({
      title,
      description,
      priority,
      deadline,
      notes,
      createdBy,
      assignedTo,
    });

    // Salvar a tarefa no banco de dados
    await newTask.save();

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar a tarefa', error });
  }
};

// Listar todas as tarefas
exports.getAllTasks = async (req, res) => {
    try {
      const tasks = await Task.find();
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
  
  // Editar tarefa
  exports.updateTask = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, priority, deadline, notes, assignedTo } = req.body;
  
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { title, description, priority, deadline, notes, assignedTo },
        { new: true }
      ).populate('createdBy assignedTo');
  
      if (!updatedTask) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
      }
  
      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar a tarefa', error });
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
