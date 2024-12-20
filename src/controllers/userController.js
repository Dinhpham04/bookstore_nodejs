import userService from '../services/userService'
let handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;



    // return userInfor 
    // access token jwt 

    // check email exist 
    if (!email || !password) {
        return res.status(400).json({
            errCode: 1,
            message: 'email or password is empty!'
        })
    }
    // compare password 
    let userData = await userService.handleUserLogin(email, password);
    res.status(userData.statusCode).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: (userData.user ? userData.user : {}),
        token: userData.user ? userData.token : ""
    })
}

let handleGetAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const usersData = await userService.getAllUsers(page, limit);
        return res.status(usersData.statusCode).json({
            message: usersData.message,
            users: usersData.users,
            pagination: usersData.pagination
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'An error occurred',
            error: error.message
        });
    }
}

let handleCreateNewUser = async (req, res) => {
    try {
        let message = await userService.createNewUser(req.body);
        return res.status(message.statusCode).json(message);
    } catch (e) {
        throw e
    }
}

let handleEditUser = async (req, res) => {
    try {
        let message = await userService.updateUserData(req.body);
        return res.status(message.statusCode).json(message);
    } catch (e) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

let handleDeleteUser = async (req, res) => {
    if (!req.query.id) {
        return res.status(400).json({
            status: 'error',
            message: 'id missing'
        })
    }

    let message = await userService.deleteUser(req.query.id);
    return res.status(message.statusCode).json(message);
}

let handleGetUserInfo = async (req, res) => {
    try {
        if (!req.user) {
            res.status(200).json({
                isLogin: false,
                message: 'Login required'
            })
        } else {
            const userId = req.user.id;
            const respon = await userService.getUserInfo(userId);
            res.status(respon.statusCode).json({
                userData: respon.userInfo,
                message: respon.message
            });
        }
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            errCode: -1,
            message: "An error occurred while retrieving user information",
            error: error.message
        });
    }
}

let handleGetUserById = async (req, res) => {
    try {
        const userId = req.query.userId;
        const respon = await userService.getUserById(userId);
        const { statusCode, ...data } = respon;
        res.status(statusCode).json({
            message: respon.message,
            ...data
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

module.exports = {
    handleLogin,
    handleGetAllUsers,
    handleCreateNewUser,
    handleEditUser,
    handleDeleteUser,
    handleGetUserInfo,
    handleGetUserById,
}