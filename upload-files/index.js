const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const { fileURLToPath } = require('url');
const app = express();

app.set('view engine', 'ejs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    //cb(null, file.originalname + Date.now() + path.extname(file.originalname));
    crypto.randomBytes(16, (err, hash) => {
      if (err) cb(err)

      const fileName = `${hash.toString('hex')}-${file.originalname}`;

      cb(null, fileName);
    })
  }
})

const upload = multer({ storage })

app.get("/", (req, res) => {
  res.render("index")
})

app.post('/uploads', upload.single("file"), function (req, res) {
  res.send('Arquivo enviado.');
});

app.listen(3000, () => {
  console.log("Servidor online!\nhttp://localhost:3000/")
})