require('dotenv').config()

module.exports = {
	bot: {
		token: process.env.BOT_TOKEN, // Токен бота
		username: process.env.BOT_USERNAME, // Юзернейм бота
	},
	mongo: {
		uri: process.env.MONGO_URI, // URI для подключения к MongoDB
		dbName: process.env.DB_NAME, // Название базы данных
	},
	telegram: {
		channelId: process.env.CHANNEL_ID, // ID телеграм-канала
		channelUsername: process.env.CHANNEL_USERNAME, // Юзернейм телеграм-канала
	},
	admin: {
		id: process.env.ADMIN_ID, // ID администратора
	},
}
