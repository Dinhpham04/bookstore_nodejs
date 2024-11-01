import db from "../models/index"; // Lấy database 
import CRUDService from "../services/CRUDService"; // service là nơi đẩy dữ liệu vào để xử lý dữ liệu
let getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll(); // lấy bảng user 
        res.render('homePage.ejs', {
            data: JSON.stringify(data),
        }); // truyền data vào view
    } catch (error) {
        console.log(error);
    }
}

let getAboutMe = (req, res) => {
    return res.render('test/about.ejs');
}

let getCRUD = async (req, res) => {
    return res.render('crud.ejs') // render ra giạo diện crud bằng cách chạy file crud.ejs 
}

let postCRUD = async (req, res) => { // đẩy dữ liệu vào service để sử lý 
    let message = await CRUDService.createNewUser(req.body);
    console.log(message);
    res.send(message);
}

let displayGetCRUD = async (req, res) => {
    let data = await CRUDService.getAllUsers();
    res.render('displayCRUD.ejs', {
        dataTable: data,
    });
}

let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    if (userId) {
        let userData = await CRUDService.getUserInfoById(userId);
        res.render('editCRUD.ejs', {
            userData: userData,
        });
    }
    else {
        res.send('User not found')
    }
}

let putCRUD = async (req, res) => {
    let data = req.body; // lấy data của các thẻ input có trường nam 
    await CRUDService.updateUserData(data);
    res.redirect('/get-crud');
}

let deleteCRUD = async (req, res) => {
    let userId = req.query.id;
    if (userId) {
        await CRUDService.deleteUser(userId);
        res.redirect('/get-crud');
    } else {
        res.send('User not found')
    }
}

module.exports = {
    getHomePage,
    getAboutMe,
    getCRUD,
    postCRUD,
    displayGetCRUD,
    getEditCRUD,
    putCRUD,
    deleteCRUD
}