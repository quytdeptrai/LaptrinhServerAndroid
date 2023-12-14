const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphdbs = require("express-handlebars");
const useController = require("./controller/useController");
const productController = require("./controller/productController");
const url =
  "mongodb+srv://quocpcpd06159:olgpVkOuFObRCNHm@cluster0.agtaxzj.mongodb.net/dbUserManagerPolyDN?retryWrites=true&w=majority";
const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//đăng ký và cấu hình các middleware và kết nối cơ sở dữ liệu MongoDB.
app.use(bodyParser.json());
app.engine(".hbs", exphdbs.engine({ extname: ".hbs", defaultLayout: false }));
app.set("views engine", ".hbs");
app.use(express.json());
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });

// app.use(userRoutes);


//đăng ký các middleware và endpoint API của ứng dụng.
app.use("/user", useController);//đại diện cho các endpoint API liên quan đến người dùng.
app.use("/product", productController);//đại diện cho các endpoint API liên quan đến sản phẩm.
app.get("/main", function (req, res) {
  //Gọi tên nó ra
  res.render("layouts/main.hbs");
});



app.listen(3000, () => {
  console.log("Chạy server thành công");
});
