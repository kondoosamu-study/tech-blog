const mysql = require('mysql');
const connection = mysql.createConnection({
	host : 'host IP',
  user : 'user name',
  password : 'password',
  port : 3306,
  database: 'DB name'
});

// node native promisify

connection.connect();

// module.exports = query;
module.exports = connection;