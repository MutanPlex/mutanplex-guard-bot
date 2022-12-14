const { Client, GatewayIntentBits, Partials, REST, Routes } = require("discord.js");
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'db.sqlite' });

const config = require("./config.js");
const rest = new REST({ version: "10" }).setToken(config.token);

const client = new Client({
  partials: [
    Partials.Message, // for message
    Partials.Channel, // for text channel
    Partials.GuildMember, // for guild member
    Partials.Reaction, // for message reaction
    Partials.GuildScheduledEvent, // for guild events
    Partials.User, // for discord user
    Partials.ThreadMember, // for thread member
  ],
  intents: [
    GatewayIntentBits.Guilds, // for guild related things
    GatewayIntentBits.GuildMembers, // for guild members related things
    GatewayIntentBits.GuildBans, // for manage guild bans
    GatewayIntentBits.GuildEmojisAndStickers, // for manage emojis and stickers
    GatewayIntentBits.GuildIntegrations, // for discord Integrations
    GatewayIntentBits.GuildWebhooks, // for discord webhooks
    GatewayIntentBits.GuildInvites, // for guild invite managing
    GatewayIntentBits.GuildVoiceStates, // for voice related things
    GatewayIntentBits.GuildPresences, // for user presence things
    GatewayIntentBits.GuildMessages, // for guild messages things
    GatewayIntentBits.GuildMessageReactions, // for message reactions things
    GatewayIntentBits.GuildMessageTyping, // for message typing things
    GatewayIntentBits.DirectMessages, // for dm messages
    GatewayIntentBits.DirectMessageReactions, // for dm message reaction
    GatewayIntentBits.DirectMessageTyping, // for dm message typinh
    GatewayIntentBits.MessageContent, // enable if you need message content things
  ],
});
module.exports = client;

require("./events/message.js")
require("./events/ready.js")


// SLASH COMMAND DESCRIPTIONS
const slashCommands = require("./events/slashcommands/slashdesc.json");

// REGISTER SLASH COMMANDS
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await console.log(db.table("commandban"));
    await console.log(db.table("banlog"));
    await console.log(db.table("kicklog"));
    await console.log(db.table("reactionrole"));
    await console.log(db.table("rolelog"));
    await console.log(db.table("voicelog"));
    await rest.put(Routes.applicationCommands(config.clientid), { body: slashCommands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// SLASH COMMAND RETURN
require("./events/slashcommands/interactionCreate.js")
require("./events/reaction/messageReactionAdd.js")
require("./events/reaction/messageReactionRemove.js")


client.login(config.token).catch(e => {
  console.log("The Bot Token You Entered Into Your Project Is Incorrect Or Your Bot's INTENTS Are OFF!")
})