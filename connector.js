const mysql = require( 'mysql' );
require('dotenv').config();

class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME} );
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }

    execute ( callback ) {
        // const database = new Database( config );
        return callback( this.connection ).then(
            result => this.close().then( () => result ),
            err => this.close().then( () => { throw err; } )
        );
    };
}

module.exports = Database;