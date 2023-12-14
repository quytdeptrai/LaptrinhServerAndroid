const express = require("express");
const userModel = require("../models/user");
const app = express();

app.get("/", (req, res) => {
  res.render("users/addOrEdit.hbs", {
    viewTitle: " THÊM THÀNH VIÊN",
  });
});

//add and update data
app.post("/add", async (req, res) => {
  console.log(req.body); //để in ra dữ liệu được gửi trong yêu cầu POST (req.body).
  if (req.body.id == "") {
    // rỗng (""), nghĩa là yêu cầu POST này là để thêm một bản ghi người dùng mới.
    //hàm addRecord() được gọi để thêm bản ghi người dùng mới vào cơ sở dữ liệu.
    addRecord(req, res);
  } else {
    // không rỗng, nghĩa là yêu cầu POST này là để cập nhật thông tin của một bản ghi người dùng đã có trong cơ sở dữ liệu.
    updateRecord(req, res);
     // được gọi để cập nhật thông tin của bản ghi người dùng đó.
  }
});

//để thêm một bản ghi người dùng mới vào cơ sở dữ liệu MongoDB
function addRecord(req, res) {
  // POST (req.body).
  const u = new userModel(req.body);
  try {
    //Sử dụng từ khóa try để bắt đầu khối mã có thể gây ra lỗi.
    u.save(); //save() để lưu đối tượng người dùng mới vào cơ sở dữ liệu MongoDB.
    res.render("users/addOrEdit.hbs", {
      // nếu thành công hiển thị trang "addOrEdit.hbs và tiêu đề viewTitle
      viewTitle: " THÊM THÀNH VIÊN THÀNH CÔNG",
    });
  } catch (error) {
    res.status(500).send(error);
    //hàm catch() được sử dụng để xử lý lỗi và trả về mã lỗi 500
  }
}

// cập nhật thông tin của một bản ghi người dùng
function updateRecord(req, res) {
  userModel //tìm kiếm bản ghi người dùng theo ID và cập nhật thông tin
    .findByIdAndUpdate(req.body.id, req.body, { new: true })
    .then((doc) => {
      //xử lý kết quả
      res.redirect("/user/list");
      //để chuyển hướng người dùng đến đường dẫn "/user/list" sau khi cập nhật thành công.
    })
    .catch((err) => {
      //để xử lý lỗi xảy ra trong quá trình cập nhật
      console.log(err); //err chứa thông tin về lỗi được trả về.
      res.render("users/addOrEdit.hbs", {
        viewTitle: "LỖI CẬP NHẬT",
//render() được sử dụng để hiển thị trang "addOrEdit.hbs" với tiêu đề "LỖI CẬP NHẬT" nếu có lỗi xảy ra.
      });
    });
}



app.get("/list", (req, res) => {
  userModel.find({}).then((users) => {
    // phương thức then() để xử lý kết quả trả về từ truy vấn.
    res.render("users/view-users.hbs", {
      users: users.map((user) => user.toJSON()),
      // phương thức map() để lặp qua tất cả các đối tượng người dùng trong mảng
      //và chuyển đổi mỗi đối tượng người dùng thành một đối tượng JSON
    });
  });
});

//edit user =>xuất hiện lỗi MongooseError: Model.findById() no longer accepts a callback
//=> callback đã bị loại bỏ cho phương thức findById() của một mô hình Mongoose.
//=> Ở phiên bản Mongoose 6.0, phương thức findById() không còn chấp nhận một callback như một tham số nữa.
// app.get("/edit/:id", (req, res) => {
//   userModel.findById(req.params.id, (err, user) => {
//     if (!err) {
//       res.render("users/addOrEdit.hbs",  {
//         viewTitle: "Cập nhật người dùng",
//         user: user.toJSON(),
//       });
//     }
//   });
// });

//edit 
app.get("/edit/:id", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).lean();
    //người dùng có "id" tương ứng với tham số được truyền vào đường dẫn
    //Promise và được gán cho biến "user" bằng cách sử dụng từ khóa "await"
    //lean() được sử dụng để chuyển đổi đối tượng người dùng trả về thành đối tượng plain JavaScript.
    res.render("users/addOrEdit.hbs", { user });
  } catch (err) {
    console.log(err);
    res.redirect("/");
    //mã try, hàm catch() được sử dụng để xử lý lỗi và chuyển hướng người dùng đến trang chủ ("/").
  }
});

//delete
app.get("/delete/:id", async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id, req.body);
    // Ngoài tham số "id", phương thức này cũng nhận một tham số "req.body" để xóa các trường dữ liệu khác của bản ghi người dùng (nếu có).
    if (!user) res.status(404).send("No item found");
    else {
      res.redirect("/user/list");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});



//đăng nhập
app.post("/passport", (req, res) => {
  // Lấy username và password từ request
  const { username, password } = req.body;
  //destructuring để lấy hai trường "username" và "password" từ đối tượng "req.body" được gửi đến từ form đăng nhập.

  // Tìm kiếm người dùng với username và password tương ứng
  userModel
    .findOne({ username, password }) //để tìm kiếm bản ghi người dùng có tương ứng
    .then((user) => {
      if (!user) {
        console.log("Thông tin đăng nhập không hợp lệ");
        res.render("layouts/error.hbs");
      } else {
        console.log(`Đăng nhập thành công với thông tin: ${user}`);
        res.render("layouts/home.hbs");
      }
    })
    .catch((err) => {
      console.error("Đã xảy ra lỗi khi đăng nhập", err);
      res.status(500).send("Đăng nhập thất bại");
    });
});



app.get("/home", (req, res) => {
  res.render("layouts/home.hbs");
});
app.get("/product", (req, res) => {
  res.render("layouts/product.hbs");
});

module.exports = app;
