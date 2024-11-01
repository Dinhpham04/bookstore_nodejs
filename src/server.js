import express from "express";
import bodyParser from "body-parser";  // body-parser dùng để biên dịch các phiên bản code js khác nhau 
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB"; // connect và check xem đã kết nối được với database chưa 
require('dotenv').config(); // dùng để chạy câu lệnh process.env.PORT 
const cors = require('cors');
let app = express(); // instance of express
app.use(cors({
    origin: 'http://localhost:3000', // Chỉ định cụ thể origin
    credentials: true // Cho phép gửi cookie
}));
// config app 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

viewEngine(app);  // config view engine 
initWebRoutes(app); // khởi tạo các router

connectDB(); // kết nối với database

let port = process.env.PORT || 6969; // Xác định port app chạy 
// PORT === undefined => port = 6969; 
app.listen(port, () => {
    // callback
    console.log("Website is running on the port : " + port);
})