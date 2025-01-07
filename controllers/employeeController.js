const Employee = require('../models/Employeer');
const Regional = require('../models/Regional');  // Modelo de Regional
const Municipio = require('../models/Municipio');  // Modelo de Equipe
const Local = require('../models/Local');  // Modelo de Local

exports.createEmployee = async (req, res) => {
  try {
    const {
      name,
      codigoRegional,
      codigoMunicipio,
      company,
      codigoLocal,
      status,
      position,
      department,
      codigoEquipe,
      placaMoto,
      phone,
      cnh,
      cpf,
      rg,
      cnhValidity,
      address,
      admissionDate,
      birthDate,
      vehicleModel,
      vehicleYear
    } = req.body;

    // Verify if required data exists
    const regional = await Regional.findById(codigoRegional);
    const municipio = await Municipio.findById(codigoMunicipio);
    const local = await Local.findById(codigoLocal);

    if (!regional || !municipio || !local) {
      return res.status(400).json({ message: 'Dados de regional, equipe ou local inválidos' });
    }

    // Check if CPF already exists
    const existingEmployee = await Employee.findOne({ cpf });
    if (existingEmployee) {
      return res.status(400).json({ message: 'CPF já cadastrado no sistema' });
    }

    // Validate CNH validity date
    if (new Date(cnhValidity) < new Date()) {
      return res.status(400).json({ message: 'Data de validade da CNH inválida' });
    }

    // Validate required address fields
    if (!address || !address.street || !address.number || !address.neighborhood || 
        !address.zipCode) {
      return res.status(400).json({ message: 'Dados de endereço incompletos' });
    }

    const newEmployee = new Employee({
      name,
      codigoRegional: regional._id,
      codigoMunicipio: municipio._id,
      company,
      codigoEquipe,
      codigoLocal: local._id,
      status,
      position,
      department,
      placaMoto,
      admissionDate,
      birthDate,
      phone,
      cnh,
      vehicleModel,
      vehicleYear,
      cpf,
      rg,
      cnhValidity,
      address: {
        street: address.street,
        number: address.number,
        complement: address.complement || '',
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      }
    });

    await newEmployee.save();
    return res.status(201).json(newEmployee);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao criar funcionário', error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      cnh,
      position,
      department,
      name,
      codigoRegional,
      codigoMunicipio,
      company,
      codigoLocal,
      codigoEquipe,
      admissionDate,
      birthDate,
      phone,
      placaMoto,
      surname,
      cpf,
      rg,
      cnhValidity,
      address,
      vehicleModel,
      vehicleYear
    } = req.body;

    // Find employee by ID
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    // Check CPF uniqueness if it's being updated
    if (cpf && cpf !== employee.cpf) {
      const existingEmployee = await Employee.findOne({ cpf });
      if (existingEmployee) {
        return res.status(400).json({ message: 'CPF já cadastrado no sistema' });
      }
    }

    // Validate CNH validity date if it's being updated
    if (cnhValidity && new Date(cnhValidity) < new Date()) {
      return res.status(400).json({ message: 'Data de validade da CNH inválida' });
    }

    // Validate and fetch updated references
    const regional = await Regional.findById(codigoRegional);
    const municipio = await Municipio.findById(codigoMunicipio);
    const local = await Local.findById(codigoLocal);

    if (!regional || !municipio || !local) {
      return res.status(400).json({ message: 'Dados de regional, município ou local inválidos' });
    }

    // Validate address fields if address is being updated
    if (address) {
      if (!address.street || !address.number || !address.neighborhood || 
      !address.zipCode) {
        return res.status(400).json({ message: 'Dados de endereço incompletos' });
      }
    }

    // Update employee fields
    employee.name = name || employee.name;
    employee.codigoRegional = regional._id;
    employee.codigoMunicipio = municipio._id;
    employee.company = company || employee.company;
    employee.codigoLocal = local._id;
    employee.codigoEquipe = codigoEquipe || employee.codigoEquipe;
    employee.status = status || employee.status;
    employee.position = position || employee.position;
    employee.department = department || employee.department;
    employee.phone = phone || employee.phone;
    employee.surname = surname || employee.surname;
    employee.placaMoto = placaMoto || employee.placaMoto;
    employee.cnh = cnh || employee.cnh;
    employee.cnh = cnhValidity || employee.cnhValidity;
    employee.admissionDate = admissionDate || employee.admissionDate;
    employee.birthDate = birthDate || employee.birthDate;
    employee.vehicleModel = vehicleModel || employee.vehicleModel;
    employee.vehicleYear = vehicleYear || vehicleYear;
    // Update new fields
    if (cpf) employee.cpf = cpf;
    if (rg) employee.rg = rg;
    if (cnhValidity) employee.cnhValidity = cnhValidity;
    
    // Update address if provided
    if (address) {
      employee.address = {
        street: address.street,
        number: address.number,
        complement: address.complement || employee.address?.complement || '',
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      };
    }

    await employee.save();
    return res.status(200).json({ message: 'Funcionário atualizado com sucesso', employee });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar funcionário', error: error.message });
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
