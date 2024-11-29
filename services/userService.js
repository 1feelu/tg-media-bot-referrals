const { getCollection } = require('./db')

async function getUser(userId) {
	return await getCollection('users').findOne({ userId })
}

async function createUser(userId, username, referral) {
	await getCollection('users').insertOne({
		userId,
		username,
		balance: 20,
		referrals: 0,
		referral,
	})
}

async function updateUserBalance(userId, amount) {
	const query = userId ? { userId } : {}
	await getCollection('users').updateMany(query, { $inc: { balance: amount } })
}

async function addReferral(referrerId) {
	await getCollection('users').updateOne(
		{ userId: parseInt(referrerId) },
		{ $inc: { referrals: 1, balance: 4 } }
	)
}

module.exports = { getUser, createUser, updateUserBalance, addReferral }
