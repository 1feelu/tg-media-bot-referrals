# 🤖 Telegram Media Bot

### 📜 Description

This Telegram bot provides users with the ability to:

- 📸 Retrieve random photos
- 🎬 Retrieve random videos
- 💰 Manage bonus balances and referral systems

It supports media management through admin privileges and stores data in MongoDB.

---

## 🚀 Features

- **Channel Subscription**: Requires subscription to a specific Telegram channel for bot access.
- **Referral System**: Earn bonuses by inviting friends.
- **Media Retrieval**: Users can exchange bonuses for photos or videos.
- **Media Uploads**: Admin can upload photos and videos via chat.
- **Daily Bonuses**: All users’ balances are updated daily.

---

## 🛠️ Installation and Setup

### 1. Clone the repository

git clone https://github.com/USERNAME/PROJECT_NAME.git
cd PROJECT_NAME

### 2. Install dependencies

npm install

### 3. Configure environment variables

Create a `.env` file in the root directory and populate it with the following data:

```
BOT_TOKEN=your_bot_token
BOT_USERNAME=bot_username
MONGO_URI=your_mongo_uri
DB_NAME=database_name
CHANNEL_ID=telegram_channel_id
CHANNEL_USERNAME=telegram_channel_username
ADMIN_ID=admin_id
```

### 4. Start the bot

node index.js

---

## 📋 Usage Instructions

- **Users**:

  1. Subscribe to the channel using the provided button.
  2. Use the menu commands to retrieve photos and videos.
  3. Invite friends to earn bonuses.

- **Administrators**:
  - Send photos or videos in the chat to upload them to the database.

---

## 📦 Project Structure

```
├── services/
│   ├── db.js            # Database connection
│   ├── userService.js   # User-related logic
├── config.js            # Project configuration
├── index.js             # Main bot file
```

---

## 🛡️ License

This project is distributed under the MIT License.

---

Feel free to suggest any changes or additions! 😊
