const { Sequelize } = require('sequelize');

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize('DbCuaDinh', 'root', null, {
  host: 'localhost', // địa chỉ server 
  dialect:'mysql', 
  logging: false, // loai bo dong log 
});


let connectDB = async () => {
  try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
  }
}

module.exports = connectDB; 