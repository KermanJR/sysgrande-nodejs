const Employee = require('../models/Employeer');
const Regional = require('../models/Regional');  // Modelo de Regional
const Municipio = require('../models/Municipio');  // Modelo de Equipe
const Local = require('../models/Local');  // Modelo de Local

exports.createEmployee = async (req, res) => {
    try {
      const { name, codigoRegional, codigoMunicipio, company, codigoLocal, codigoEquipe } = req.body;
  
      // Verifica se os dados necessários existem
      const regional = await Regional.findById(codigoRegional);
      const municipio = await Municipio.findById(codigoMunicipio);
      const local = await Local.findById(codigoLocal);
  
      if (!regional || !municipio || !local) {
        return res.status(400).json({ message: 'Dados de regional, equipe ou local inválidos' });
      }
  
      const newEmployee = new Employee({
        name,
        codigoRegional: regional._id,
        codigoMunicipio: municipio._id,
        company,
        codigoEquipe,
        codigoLocal,
        local: local._id
      });
  
      await newEmployee.save();
      return res.status(201).json(newEmployee);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao criar funcionário', error });
    }
  };

  // Atualizar Funcionário pelo ID
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, name, codigoRegional, codigoMunicipio, company, codigoLocal, codigoEquipe } = req.body;

    // Buscar o funcionário pelo ID
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    // Validação e busca das referências atualizadas
    const regional = await Regional.findById(codigoRegional);
    const municipio = await Municipio.findById(codigoMunicipio);
    const local = await Local.findById(codigoLocal);

    if (!regional || !municipio || !local) {
      return res.status(400).json({ message: 'Dados de regional, município ou local inválidos' });
    }

    // Atualizar os campos do funcionário
    employee.name = name || employee.name;
    employee.codigoRegional = regional._id;
    employee.codigoMunicipio = municipio._id;
    employee.company = company || employee.company;
    employee.codigoLocal = local._id;
    employee.codigoEquipe = codigoEquipe || employee.codigoEquipe;
    employee.status = status
    // Salvar as alterações
    await employee.save();

    return res.status(200).json({ message: 'Funcionário atualizado com sucesso', employee });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar funcionário', error });
  }
};



  exports.getAllEmployees = async (req, res) => {
    const { company } = req.query;
  
    try {
      if (!company) {
        return res.status(400).json({ message: 'A "company" é um parâmetro obrigatório' });
      }
  
      // Buscar os funcionários com base na company e popular as referências
      const employees = await Employee.find({ company })
        .populate('codigoRegional')   // Popular a referência da Regional
        .populate('codigoMunicipio')  // Popular a referência do Município
        .populate('codigoLocal')      // Popular a referência do Local
  
      if (employees.length === 0) {
        return res.status(404).json({ message: 'Nenhum funcionário encontrado para a empresa fornecida' });
      }
  
      return res.status(200).json(employees);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao obter funcionários', error });
    }
  };
  


// Consultar Funcionário pelo ID com detalhes das referências
exports.getEmployeeById = async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id)
  
      if (!employee) {
        return res.status(404).json({ message: 'Funcionário não encontrado' });
      }
  
      return res.status(200).json(employee);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao obter funcionário', error });
    }
  };
  
// Soft Delete (Marcar como excluído)
exports.deleteEmployee = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Buscar o funcionário
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({ message: 'Funcionário não encontrado' });
      }
  
      // Marcar o funcionário como deletado (soft delete)
      employee.deletedAt = new Date(); // Define a data de exclusão
      await employee.save();
  
      return res.status(200).json({ message: 'Funcionário deletado com sucesso', employee });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao deletar funcionário', error });
    }
  };
