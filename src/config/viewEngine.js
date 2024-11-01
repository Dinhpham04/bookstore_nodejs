import express from "express";

let configViewEngine = (app) => {
    app.use(express.static("./src/public")); // phía client có thể truy cập vào file nào 
    app.set("view engine", "ejs");  // cài đặt view engine là ejs 
    app.set("views", "./src/views"); // Mặc định khi render 1 file thì sẽ tự động tìm đến thư mục src/views
}

module.exports = configViewEngine; 