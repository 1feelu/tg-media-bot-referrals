const { Telegraf, Markup } = require('telegraf')
const { bot: botConfig, telegram, admin } = require('./config')
const cron = require('node-cron')
const { connectDB, getCollection } = require('./services/db')
const {
	getUser,
	updateUserBalance,
	createUser,
	addReferral,
} = require('./services/userService')
require('dotenv').config()

const BOT_TOKEN = botConfig.token
const CHANNEL_ID = telegram.channelId
const ADMIN_ID = admin.id

const bot = new Telegraf(BOT_TOKEN)

;(async () => {
	try {
		await connectDB()
		console.log('Готово к работе с MongoDB.')

		bot.launch()
		console.log('Бот запущен!')
	} catch (error) {
		console.error('Ошибка при подключении к MongoDB:', error)
		process.exit(1)
	}
})()

async function isSubscribed(ctx) {
	try {
		const member = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id)
		return ['member', 'administrator', 'creator'].includes(member.status)
	} catch {
		return false
	}
}

bot.start(async ctx => {
	const userId = ctx.from.id
	const username = ctx.from.username || ctx.from.first_name
	const referral = ctx.startPayload

	let user = await getUser(userId)
	if (!user) {
		await createUser(userId, username, referral)
		if (referral) await addReferral(referral)
	}

	await ctx.reply(
		`Привет, ${username}! 🎉\nПожалуйста, подпишитесь на наш канал 📲:\n`,
		Markup.inlineKeyboard([
			Markup.button.url('Подписаться 👍', `https://t.me/devvvvvchannel`),
			Markup.button.callback('Проверить подписку ✅', 'check_subscription'),
		])
	)
})

bot.action('check_subscription', async ctx => {
	const userId = ctx.from.id
	const username = ctx.from.username || ctx.from.first_name

	const subscribed = await isSubscribed(ctx)
	if (subscribed) {
		await ctx.reply(
			`✅ Привет, ${username}! Вы успешно подписаны на наш канал.`
		)
		await ctx.reply(
			'Меню 📋:',
			Markup.keyboard([
				['📸 Получить фото', '🎬 Получить видео'],
				['ℹ️ Информация'],
			]).resize()
		)
	} else {
		await ctx.reply(
			`❌ Привет, ${username}! Пожалуйста, подпишитесь на канал, чтобы продолжить.`
		)
	}
})

bot.command('menu', async ctx => {
	if (await isSubscribed(ctx)) {
		await ctx.reply(
			'Меню 📋:',
			Markup.keyboard([
				['📸 Получить фото', '🎬 Получить видео'],
				['ℹ️ Информация'],
			]).resize()
		)
	} else {
		await ctx.reply(
			'❗ Пожалуйста, подпишитесь на канал, чтобы использовать бот.'
		)
	}
})

bot.hears('ℹ️ Информация', async ctx => {
	const user = await getUser(ctx.from.id)
	const referralLink = `https://t.me/${botConfig.username}?start=${ctx.from.id}`
	await ctx.reply(
		`🔹 Ваш баланс: ${user.balance} бонусов\n🔹 Приглашено друзей: ${user.referrals}\n🔗 Ваша реферальная ссылка: ${referralLink}`
	)
})

async function addMedia(type, url) {
	const mediaCollection = await getCollection('media')
	await mediaCollection.insertOne({ type, url, createdAt: new Date() })
}

async function getRandomMedia(type) {
	const mediaCollection = await getCollection('media')
	const media = await mediaCollection
		.aggregate([{ $match: { type } }, { $sample: { size: 1 } }])
		.toArray()
	return media.length > 0 ? media[0].url : null
}

bot.on('photo', async ctx => {
	if (ctx.from.id.toString() === ADMIN_ID.toString()) {
		const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id
		const file = await ctx.telegram.getFile(fileId)
		const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`

		await addMedia('photo', fileUrl)

		console.log(
			`Администратор ${ctx.from.id} отправил фото. Ссылка на файл: ${fileUrl}`
		)
		await ctx.reply('Фото успешно загружено!')
	} else {
		await ctx.reply('Только администратор может загружать медиафайлы.')
	}
})

// Обработка загрузки видео от администратора
bot.on('video', async ctx => {
	if (ctx.from.id.toString() === ADMIN_ID.toString()) {
		const fileId = ctx.message.video.file_id
		const file = await ctx.telegram.getFile(fileId)
		const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`

		await addMedia('video', fileUrl)

		console.log(
			`Администратор ${ctx.from.id} отправил видео. Ссылка на файл: ${fileUrl}`
		)
		await ctx.reply('Видео успешно загружено!')
	} else {
		await ctx.reply('Только администратор может загружать медиафайлы.')
	}
})

bot.hears('📸 Получить фото', async ctx => {
	const user = await getUser(ctx.from.id)
	if (user.balance >= 1) {
		const photo = await getRandomMedia('photo')
		if (photo) {
			await updateUserBalance(ctx.from.id, -1)
			await ctx.replyWithPhoto({ url: photo })
		} else {
			await ctx.reply('❌ Фото пока нет.')
		}
	} else {
		await ctx.reply('💸 Недостаточно бонусов.')
	}
})

bot.hears('🎬 Получить видео', async ctx => {
	const user = await getUser(ctx.from.id)
	if (user.balance >= 2) {
		const video = await getRandomMedia('video')
		if (video) {
			await updateUserBalance(ctx.from.id, -2)
			await ctx.replyWithVideo({ url: video })
		} else {
			await ctx.reply('❌ Видео пока нет.')
		}
	} else {
		await ctx.reply('💸 Недостаточно бонусов.')
	}
})

cron.schedule('0 0 * * *', async () => {
	console.log('Добавляем ежедневные бонусы...')
	await updateUserBalance(null, 20)
	console.log('Бонусы обновлены.')
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
