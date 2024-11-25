// config/upload.js
const multer = require('multer');
const path = require('path');

// Definir onde os arquivos serão armazenados
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Pasta onde os arquivos serão salvos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Nome do arquivo com timestamp
  }
});

// Filtro de arquivos: aceitar apenas PDF, PNG e JPEG
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|png|jpeg|jpg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Arquivo não permitido, apenas PDF, PNG, JPEG são aceitos'));
  }
};

// Configuração do Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },  // Limite de 10MB por arquivo
});

module.exports = upload;
