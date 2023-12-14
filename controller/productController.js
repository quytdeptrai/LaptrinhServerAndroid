const express = require("express");
const productModel = require("../models/product");
const app = express();

// Kết xuất biểu mẫu để thêm một sản phẩm mới
app.get("/", (req, res) => {
  //Đăng ký một endpoint API GET tại URL "/" bằng phương thức app.get().
  res.render("users/addOrEditProduct.hbs", {
    viewTitle: "THÊM SẢN PHẨM",
    // Trang sẽ được hiển thị với tiêu đề "THÊM SẢN PHẨM".
  });
});

//Thêm sản phẩm mới hoặc cập nhật sản phẩm hiện có
app.post("/add", async (req, res) => {
  //Đăng ký một endpoint API POST tại URL "/add" bằng phương thức app.post().
  if (req.body.id == "") {
    // Nếu bằng rỗng, đoạn mã sẽ gọi hàm addProduct() để thêm mới sản phẩm.
    addProduct(req, res);
  } else {
    // đoạn mã sẽ gọi hàm updateProduct() để cập nhật thông tin sản phẩm đã có
    updateProduct(req, res);
  }
});

// Chức năng thêm sản phẩm mới
async function addProduct(req, res) {
  // /Khai báo một hàm xử lý yêu cầu với tên là addProduct và tham số req và res.
  const p = new productModel(req.body);
  //Khởi tạo một đối tượng mới của lớp productModel với thông tin sản phẩm được truyền vào qua đối tượng req.body, gán vào biến p.
  try {
    // await p.save();/thêm sản phẩm mới vào cơ sở dữ liệu thông qua phương thức p.save().
    res.render("users/addOrEditProduct.hbs", {
      viewTitle: "THÊM SẢN PHẨM THÀNH CÔNG",
    });
  } catch (error) {
    res.status(500).send(error);
  }
}

// Chức năng cập nhật một sản phẩm hiện có
async function updateProduct(req, res) {
  //Khai báo một hàm xử lý yêu cầu với tên là updateProduct và tham số req và res.
  productModel
    .findByIdAndUpdate(req.body.id, req.body, { new: true })
    //cập nhật thông tin của sản phẩm trong cơ sở dữ liệu thông qua hàm productModel.findByIdAndUpdate().
    .then((doc) => {
      res.redirect("/product/list");
    })
    // thành công, đoạn mã sẽ chuyển hướng người dùng đến trang "/product/list" thông qua hàm res.redirect().
    .catch((err) => {
      console.log(err);
      res.render("users/addOrEditProduct.hbs", {
        viewTitle: "LỖI CẬP NHẬT SẢN PHẨM",
      });
      //không thành công, đoạn mã sẽ log lỗi ra console và render lại trang "addOrEditProduct.hbs"
    });
}

// danh sách tất cả các sản phẩm
app.get("/list", (req, res) => {
  //Đăng ký một endpoint API GET tại URL "/list" bằng phương thức app.get().
  productModel.find({}).then((products) => {
    //Kết quả truy vấn được gán vào biến products.
    res.render("layouts/product.hbs", {
      products: products.map((product) => product.toJSON()),
    });
  });
});

//chỉnh sửa một sản phẩm hiện có
app.get("/edit/:id", async (req, res) => {
  //Đăng ký một endpoint API GET tại URL "/edit/:id" bằng phương thức app.get().
  try {
    const product = await productModel.findById(req.params.id).lean();
    res.render("users/addOrEditProduct.hbs", { product }); 
    //Kết quả truy vấn sẽ được gán vào biến product.
  } catch (err) {
    console.log(err);
    res.redirect("/product/list");
  }
});

// Xóa một sản phẩm hiện có
app.get("/delete/:id", async (req, res) => {
  //Đăng ký một endpoint API GET tại URL "/delete/:id" bằng phương thức app.get().
  try {
    const product = await productModel.findByIdAndDelete(
      req.params.id,
      req.body
      //cơ sở dữ liệu thông qua phương thức productModel.findByIdAndDelete()
      //Tham số đầu tiên là ID của sản phẩm cần xóa được truyền vào qua đường dẫn URL
      //tham số thứ hai là body của yêu cầu. Kết quả trả về là sản phẩm đã bị xóa.
    );
    
    if (!product) res.status(404).send("Không tìm thấy sản phẩm");
    else {
      res.redirect("/product/list");
      //Kiểm tra xem sản phẩm đã bị xóa thành công hay không.
      //Nếu sản phẩm không tồn tại, đoạn mã sẽ trả về mã lỗi 404 và thông báo "Không tìm thấy sản phẩm".
      //Ngược lại, đoạn mã sẽ chuyển hướng đến trang "list" để hiển thị danh sách sản phẩm còn lại.
    }
  } catch (error) {
    res.status(500).send(error);
    //Nếu có lỗi, đoạn mã sẽ trả về mã lỗi 500 và thông báo lỗi được gửi đến client.
  }
});

//upload img
// const path = require("path");
// const multer = require("multer");
// // Cấu hình Multer để lưu trữ file
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "users/addOrEditProduct"));  // Thư mục lưu trữ file
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname); // Giữ nguyên tên file
//   },
// });

// // Cấu hình Multer để chỉ chấp nhận file ảnh và dung lượng file tối đa là 1MB
// const upload = multer({
//   storage: storage,
//   fileFilter: function (req, file, callback) {
//     const ext = path.extname(file.originalname);
//     if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
//       return callback(new Error("Chỉ cho phép tải lên file ảnh"));
//     }
//     callback(null, true);
//   },
//   limits: {
//     fileSize: 1 * 1024 * 1024, // 1MB
//   },
// });

// // Hiển thị form tải lên
// app.get("/upload", (req, res) => {
//   res.render("upload.hbs");
// });

// // Xử lý tải lên file
// app.post("product/upload", upload.single("avatar"), (req, res) => {
//   // Kiểm tra nếu không có file được tải lên
//   if (!req.file) {
//     return res.send("Bạn chưa chọn file để tải lên");
//   }

//   // Trả về thông tin của file vừa tải lên
//   res.send({
//     filename: req.file.filename,
//     size: req.file.size,
//   });
// });




module.exports = app;
