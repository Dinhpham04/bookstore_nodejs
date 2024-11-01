import db from '../models/index';
import bcrypt from 'bcryptjs';
const salt = bcrypt.genSaltSync(10);

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
                attributes: ['email', 'roleId', 'password']
            });
            if (user) {
                let check = await bcrypt.compareSync(password, user.password);
                if (check) {
                    userData.errCode = 0;
                    userData.errMessage = 'Login successful';
                    const { password, ...userInfo } = user
                    userData.user = userInfo;
                } else {
                    userData.errCode = 3;
                    userData.errMessage = 'Password is incorrect';
                }
            }
            else {
                userData.errCode = 1;
                userData.errMessage = `Your email isn't exist in your system. please try other email`
            }
        } else {
            userData.errCode = 1;
            userData.errMessage = `Your email isn't exist in your system. please try other email`
        }
        return userData;
    } catch (error) {
        throw error;
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

let getAllUsers = async (userId) => {
    try {
        let users = '';
        if (userId === 'ALL') {
            users = await db.User.findAll({
                attributes: { exclude: ['password'] },
            });
        } else if (userId) {
            users = await db.User.findOne({
                where: {
                    id: userId
                },
                attributes: { exclude: ['password'] },
            });
        };
        return users;
    } catch (e) {
        throw e
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
        // check email exitted
        let check = await checkUserEmail(data.email);
        if (check) {
            return ({
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
            address: data.address,
            phoneNumber: data.phoneNumber,
            gender: data.gender == 1 ? true : false,
            image: data.image,
            roleId: data.roleId,
        })
        return ({
            errCode: 0,
            errMessage: 'Create new user successful'
        })
    } catch (e) {
        throw e;
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
                    errCode: 2,
                    errMessage: 'User not found'
                })
            } else {
                await user.destroy();
                return ({
                    errCode: 0,
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
                errCode: 1,
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
                errCode: 0,
                errMessage: 'Update user data successful'
            })
        }
        else {
            return ({
                errCode: 2,
                errMessage: 'User not found'
            })
        }
    } catch (e) {
        throw e;
    }
}


module.exports = {
    handleUserLogin,
    checkUserEmail,
    getAllUsers,
    createNewUser,
    deleteUser,
    updateUserData
}