

const { MongoClient, ServerApiVersion } = require('mongodb');
const { DATABASE } = require("../../config");
const logger = require('../../logger');
const { userLang } = require("../i18n/data")


// uri : "mongodb+srv://<user>:<password>@<cluster-url>?retryWrites=true&w=majority";

class Database {
    constructor(uri, databaseName) {
        this.client = new MongoClient(
            uri, {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                },
            }
        );
        this.databaseName = databaseName;
        this.userCollection = 'users';
    }

    async connect() {
        try {
            await this.client.connect();
            logger.log('info', 'Connected to the database.');

            const result = await this.client.db(this.databaseName).collection(
                this.userCollection).find({ lang: { $exists: true } }).toArray();

            result.forEach(user => {
                userLang[user.userID] = user.lang;
            });

        } catch (error) {
            logger.log('error', `Error during Database Connection: ${error}`);
            throw error; // You might want to throw the error to handle it elsewhere.
        }
    }
}


if (DATABASE.MONGODB_URI) {
    const database = new Database(DATABASE.MONGODB_URI, OWNER);
    (async () => {
        try {
            await database.connect();
        } catch (error) {
            DATABASE.MONGODB_URI = null;
        }
    })();

    module.exports = database;
}


