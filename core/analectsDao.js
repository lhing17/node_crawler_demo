let mysql = require('mysql');
let sql = 'insert into analects (chapter, content, translation) values (?, ?, ?)'

exports.save = function save(analects) {
    let connection = mysql.createConnection({
        port: 3306,
        user: 'root',
        database: 'analects',
    })

    connection.connect();
    for (const chapter of Object.keys(analects)) {
        for (const analect of analects[chapter]) {
            let values = [chapter, analect.content, analect.translation];
            connection.query(sql, values, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(result);
                }
            });
        }
    }

}
