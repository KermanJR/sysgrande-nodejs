const Epi = require('../models/EpiRequest');
const EpiRequest = require('../models/EpiRequest');
const Employee = require('../models/Employee');

exports.createEpiRequest = async (req, res) => {
  try {
    const {
      employeeId,
      items,
      observations
    } = req.body;

    // Verify if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    // Create the EPI request
    const epiRequest = new EpiRequest({
      employee: employeeId,
      items: items.map(item => ({
        epi: item.epiId,
        size: item.size,
        quantity: item.quantity,
        reason: item.reason
      })),
      observations,
      company: employee.company,
      regional: employee.codigoRegional
    });

    await epiRequest.save();
    
    return res.status(201).json(epiRequest);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao criar pedido de EPI', error: error.message });
  }
};

exports.getEpiRequests = async (req, res) => {
  try {
    const { company, regional, status, startDate, endDate } = req.query;
    
    const query = {};
    if (company) query.company = company;
    if (regional) query.regional = regional;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.requestDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const requests = await EpiRequest.find(query)
      .populate('employee', 'name position department')
      .populate('items.epi')
      .populate('regional', 'name');

    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar pedidos de EPI', error: error.message });
  }
};

exports.approveEpiRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approverId } = req.body;

    const request = await EpiRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    request.status = 'Aprovado';
    request.approvedBy = approverId;
    await request.save();

    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao aprovar pedido', error: error.message });
  }
};

exports.deliverEpi = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await EpiRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    request.status = 'Entregue';
    request.deliveryDate = new Date();
    await request.save();

    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao registrar entrega', error: error.message });
  }
};