const Collector = require('../models/Coletors');
const Regional = require('../models/Regional');
const Municipio = require('../models/Municipio');
const Local = require('../models/Local');

exports.createCollector = async (req, res) => {
  try {
    const {
      name,
      mei,
      condition,
      description,
      company,
      registration,
      status,employee
    } = req.body;

    console.log(req.body)

    
    // Check if IMEI already exists
    const existingCollector = await Collector.findOne({ mei });
    if (existingCollector) {
      return res.status(400).json({ message: 'IMEI já cadastrado no sistema' });
    }

    const newCollector = new Collector({
      name,
      mei,
      condition,
      description,
      registration,
      company,
      employee,
      status: status || 'Inativo'
    });

    await newCollector.save();
    return res.status(201).json(newCollector);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao criar coletor', error: error.message });
  }
};

exports.updateCollector = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const collector = await Collector.findById(id);
    if (!collector) {
      return res.status(404).json({ message: 'Coletor não encontrado' });
    }

    // Check IMEI uniqueness if it's being updated
    if (updateData.mei && updateData.mei !== collector.mei) {
      const existingCollector = await Collector.findOne({ mei: updateData.mei });
      if (existingCollector) {
        return res.status(400).json({ message: 'IMEI já cadastrado no sistema' });
      }
    }

    // Validate and fetch updated references if provided
    if (updateData.codigoRegional) {
      const regional = await Regional.findById(updateData.codigoRegional);
      if (!regional) {
        return res.status(400).json({ message: 'Regional inválida' });
      }
    }

    if (updateData.codigoMunicipio) {
      const municipio = await Municipio.findById(updateData.codigoMunicipio);
      if (!municipio) {
        return res.status(400).json({ message: 'Município inválido' });
      }
    }

    if (updateData.codigoLocal) {
      const local = await Local.findById(updateData.codigoLocal);
      if (!local) {
        return res.status(400).json({ message: 'Local inválido' });
      }
    }

    // Update collector
    Object.assign(collector, updateData);
    await collector.save();

    return res.status(200).json({ message: 'Coletor atualizado com sucesso', collector });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar coletor', error: error.message });
  }
};

exports.getAllCollectors = async (req, res) => {
  const { company } = req.query;

  try {
    if (!company) {
      return res.status(400).json({ message: 'A "company" é um parâmetro obrigatório' });
    }

    const collectors = await Collector.find({ 
      company,
      deletedAt: null 
    }).populate('employee', 'name')
      


    if (collectors.length === 0) {
      return res.status(404).json({ message: 'Nenhum coletor encontrado para a empresa fornecida' });
    }

    return res.status(200).json(collectors);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao obter coletores', error: error.message });
  }
};

exports.getCollectorById = async (req, res) => {
  try {
    const collector = await Collector.findOne({
      _id: req.params.id,
      deletedAt: null
    })
      .populate('codigoRegional')
      .populate('codigoMunicipio')
      .populate('codigoLocal');

    if (!collector) {
      return res.status(404).json({ message: 'Coletor não encontrado' });
    }

    return res.status(200).json(collector);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao obter coletor', error: error.message });
  }
};

exports.deleteCollector = async (req, res) => {
  try {
    const { id } = req.params;

    const collector = await Collector.findById(id);
    if (!collector) {
      return res.status(404).json({ message: 'Coletor não encontrado' });
    }

    collector.deletedAt = new Date();
    await collector.save();

    return res.status(200).json({ message: 'Coletor deletado com sucesso', collector });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao deletar coletor', error: error.message });
  }
};

exports.addMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, cost } = req.body;

    const collector = await Collector.findById(id);
    if (!collector) {
      return res.status(404).json({ message: 'Coletor não encontrado' });
    }

    collector.maintenanceHistory.push({
      date: new Date(),
      description,
      cost
    });
    collector.lastMaintenance = new Date();
    collector.status = 'Em Manutenção';

    await collector.save();
    return res.status(200).json({ message: 'Manutenção registrada com sucesso', collector });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao registrar manutenção', error: error.message });
  }
};