import db from '../models/index';
import bcrypt from 'bcryptjs';
const jwt = require('jsonwebtoken');

const salt = bcrypt.genSaltSync(10);
const JWT_SECRET = 'my_key';


let handleUserLogin = async (email, password) => {
    try {
        let userData = {};
        let isExist = await checkUserEmail(email);
        if (isExist) { // email tồn tại => lấy password để so sánh 
            // compare password 
            let user = await db.User.findOne({
                where: {
                    email: email
                },
                raw: true,
                attributes: ['id', 'email', 'password']
            });
            if (user) {
                let check = await bcrypt.compareSync(password, user.password);
                if (check) {
                    userData.statusCode = 200;
                    userData.errCode = 0;
                    userData.errMessage = 'Login successful';
                    const { password, ...userInfo } = user
                    userData.user = userInfo;
                    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
                    userData.token = token;
                } else {
                    userData.statusCode = 401;  // Unauthorized
                    userData.errCode = 3;
                    userData.errMessage = 'Invalid email or password';
                }
            }
            else {
                userData.statusCode = 401;  // Unauthorized
                userData.errCode = 1;
                userData.errMessage = 'Invalid email or password';
            }
        } else {
            userData.statusCode = 401;  // Unauthorized
            userData.errCode = 1;
            userData.errMessage = 'Invalid email or password';
        }
        return userData;
    } catch (error) {
        return {
            statusCode: 500,
            errCode: -1,
            errMessage: 'An error occurred while processing your request',
            error: error.message
        };
    }
}

let checkUserEmail = async (userEmail) => {
    try {
        let user = await db.User.findOne(
            {
                where: {
                    email: userEmail
                }
            }
        )
        if (user) {
            return true;
        } return false;
    } catch (error) {
        throw error;
    }
}

let getAllUsers = async (page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;
        const totalUsers = await db.User.count();
        const totalPages = Math.ceil(totalUsers / limit);
        const users = await db.User.findAll({
            attributes: { exclude: ['password'] },
            limit: limit,
            offset: offset
        });
        return {
            status: 'success',
            statusCode: 200,
            message: 'Get all users successfully',
            users,
            pagination: {
                totalItems: totalUsers,
                totalPages,
                currentPage: page
            }
        };
    } catch (e) {
        throw e;
    }
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

let createNewUser = async (data) => {
    try {
        if (!data.email || !data.password) {
            return ({
                statusCode: 400,
                errCode: 2,
                errMessage: 'Email, password are required.'
            })
        }
        // check email exitted
        let check = await checkUserEmail(data.email);
        if (check) {
            return ({
                statusCode: 400,
                errCode: 1,
                errMessage: 'Email already exists in your system. Please try other email'
            })
        }
        let hashPasswordFromBcrypt = await hashUserPassword(data.password);
        await db.User.create({ // phương thức create nhận vào 1 object là 1 dòng trong database 
            email: data.email,
            password: hashPasswordFromBcrypt,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            gender: data.gender == 1 ? true : false,
            profileImage: data.image,
            userType: data.userType
        })
        return ({
            statusCode: 201,
            errCode: 0,
            errMessage: 'Create new user successful'
        })
    } catch (e) {
        return {
            statusCode: 500,
            errCode: -1,
            errMessage: 'An error occurred while processing your request',
            error: e.message
        }
    }
}

let deleteUser = async (userId) => {
    if (userId) {
        try {
            let user = await db.User.findOne({
                where: {
                    id: userId
                },
                raw: false,
            })
            if (!user) {
                return ({
                    statusCode: 404,
                    status: 'error',
                    errMessage: 'User not found'
                })
            } else {
                await user.destroy();
                return ({
                    statusCode: 200,
                    status: "success",
                    errMessage: 'Delete user successful'
                })
            }
        } catch (e) {
            throw e
        }
    }
}

let updateUserData = async (data) => {
    try {
        if (!data.id) {
            return ({
                statusCode: 400,
                errMessage: 'User ID is missing'
            })
        }
        let user = await db.User.findOne({
            where: {
                id: data.id
            },
            raw: false,
        })
        if (user) {
            await db.User.update(
                {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phoneNumber: data.phoneNumber
                },
                { where: { id: data.id } }
            )
            return ({
                statusCode: 200,
                errMessage: 'Update user data successful'
            })
        }
        else {
            return ({
                statusCode: 404,
                errMessage: 'User not found'
            })
        }
    } catch (e) {
        throw e;
    }
}

let getUserInfo = async (userId) => {
    const user = await db.User.findOne({
        where: { id: userId },
        attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'profileImage', 'gender']
    });
    if (!user) {
        return {
            statusCode: 404,
            message: 'User not found'
        }
    }
    return {
        statusCode: 200,
        message: 'User information retrieved successfully',
        userInfo: {
            isLogin: true,
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            profileImage: user.profileImage,
            gender: user.gender
        }
    }
}

module.exports = {
    handleUserLogin,
    checkUserEmail,
    getAllUsers,
    createNewUser,
    deleteUser,
    updateUserData,
    getUserInfo,
}