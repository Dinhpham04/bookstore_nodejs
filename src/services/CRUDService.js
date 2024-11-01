
import db from "../models/index";
import bcrypt from 'bcryptjs'; // package để hash password 
const salt = bcrypt.genSaltSync(10);

let createNewUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            await db.User.create({ // phương thức create nhận vào 1 object là 1 dòng trong database 
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phoneNumber: data.phoneNumber,
                gender: data.gender == 1 ? true : false,
                image: data.image,
                roleId: data.roleId,
            })

            resolve('ok! create new user seccess'); // sai khi tạo xong dữ liệu không cần trả về, gọi resolve() để thoát khỏi promise 
        } catch (error) {
            reject(error);
        }
    });
}

let hashUserPassword = (password) => { // hàm hash password 
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (error) {
            reject(error);
        }
    })
}

let getAllUsers = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                raw: true,
            });
            resolve(users); // trả về tất cả dữ liệu user
        } catch (error) {
            reject(error);
        }
    })
}

let getUserInfoById = async (userId) => {
    try {
        let userInfo = await db.User.findOne({
            where: {
                id: userId,
            },
            raw: true,  // trả về dữ liệu theo cấu trúc khi lấy dữ liệu
        })
        if (userInfo) {
            return userInfo;
        }
        else {
            return {};
        }
    } catch (error) {
        throw error;
    }

}

let updateUserData = async (data) => {
    try {
        await db.User.update(
            {
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phoneNumber: data.phoneNumber
            },
            {
                where: { id: data.id },
                raw: false
            })
    } catch (error) {
        throw error;
    }
}

let deleteUser = async (userId) => {
    try {
        let deletedRows = await db.User.destroy({
            where: {
                id: userId,
            }
        }
        )
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createNewUser,
    getAllUsers,
    getUserInfoById,
    updateUserData,
    deleteUser,
}