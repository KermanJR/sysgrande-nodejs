const Item = require('../models/Item');

// POST: Adicionar novo item ao inventário
exports.addItem = async (req, res) => {
  const {
    name, quantity, description, serialNumber, patrimonyNumber,
    brand, model, condition, location, observations,
    regionalCode  // Campo para o código da regional
  } = req.body;

  try {
    const newItem = new Item({
      name, quantity, description, serialNumber, patrimonyNumber,
      brand, model, condition, location, observations, 
      regionalCode  // Incluindo o código da regional no novo item
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar item', error });
  }
};

// GET: Listar todos os itens do inventário
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar itens', error });
  }
};

// PUT: Atualizar um item existente
exports.updateItem = async (req, res) => {
  const { id } = req.params;  // O id será o UUID gerado
  const {
    name, quantity, description, serialNumber, patrimonyNumber,
    brand, model, condition, location, observations,
    regionalCode  // Atualizando o código da regional no item existente
  } = req.body;

  try {
    const updatedItem = await Item.findOneAndUpdate(
      { id },  // Busca pelo campo `id` definido no schema
      {
        name, quantity, description, serialNumber, patrimonyNumber,
        brand, model, condition, location, observations, 
        regionalCode
      },
      { new: true }  // Retorna o item atualizado
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar item', error });
  }
};

// DELETE: Remover um item do inventário
exports.deleteItem = async (req, res) => {
  const { id } = req.params;  // O id será o UUID gerado

  try {
    const deletedItem = await Item.findOneAndDelete({ id });  // Busca pelo campo `id`

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }

    res.status(200).json({ message: 'Item removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover item', error });
  }
};
