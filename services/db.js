const { mongo } = require('../config')
const { MongoClient } = require('mongodb')

let db

async function connectDB() {
	try {
		const client = new MongoClient(mongo.uri, {})
		await client.connect()
		db = client.db(mongo.dbName)
		console.log('Успешно подключено к MongoDB')
	} catch (error) {
		console.error('Ошибка подключения к MongoDB:', error)
		process.exit(1)
	}
}

function getCollection(collectionName) {
	if (!db)
		throw new Error('База данных не подключена. Сначала вызовите connectDB().')
	return db.collection(collectionName)
}

module.exports = { connectDB, getCollection }
