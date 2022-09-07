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
const slashCommands = [
  {
    name: "blep",
    type: 1,
    description: "Send a random adorable animal photo",
    options: [
        {
            name: "animal",
            description: "The type of animal",
            type: 3,
            required: true,
            choices: [
                {
                    name: "Dog",
                    value: "animal_dog"
                },
                {
                    name: "Cat",
                    value: "animal_cat"
                },
                {
                    name: "Penguin",
                    value: "animal_penguin"
                }
            ]
        },
        {
            name: "only_smol",
            description: "Whether to show only baby animals",
            type: 5,
            required: false
        }
    ]
  },
  {
    name: "command-ban",
    description: "Command ban to user",
    options: [{
        name: "user",
        description: "User to ban",
        type: 6,
        required: true
      },
      {
        name: "ban-unban",
        description: "Ban or unban",
        type: 5,
        required: true,
      },
      {
        name: "reason",
        description: "Reason to ban",
        type: 3,
        required: true
      }
    ]
  }
];

// REGISTER SLASH COMMANDS
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await console.log(db.table("commandban"));
    await rest.put(Routes.applicationCommands(config.clientid), { body: slashCommands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// SLASH COMMAND RETURN
client.on('interactionCreate', async interaction => {
  const user = interaction.user.id;
  const banned = await db.get(`commandban.${user}`);
  if(!interaction.isChatInputCommand()){
    return;
  }
  if(banned) {
    return interaction.reply({ content: "You are banned from using slash commands.", ephemeral: true });
  }

  if(interaction.commandName === 'blep'){
      await interaction.reply('Blep! :3');
  }
  if(interaction.commandName === 'command-ban'){
    if(interaction.user.id != config.ownerid){
      await interaction.reply({content: "You are not owner of this bot!", ephemeral: true});
    }else{
      if(interaction.options.getMember('user').user.id != null){
        const user = interaction.options.getMember('user').user.id;
        var bancounter = await db.get(`commandban.${user}.bancounter`);
        if(bancounter == null){
          bancounter = 1;
        }
        const banned = await db.get(`commandban.${user}.banunban`);
        const reason = "\n" + bancounter + ") " + interaction.options.getString('reason');
        const banunban = interaction.options.getBoolean('ban-unban');
        console.log(banned);
        if(banned == true){
          if(banunban == true){
            await db.set(`commandban.${user}.reason`, await db.get(`commandban.${user}.reason`) + " " + reason);
            await interaction.reply({content: `<@${interaction.options.getMember('user').user.id}> already banned! \nReasons: ${await db.get(`commandban.${user}.reason`)}`, ephemeral: true});
          }else{
            await db.set(`commandban.${user}.banunban`, false);
            await interaction.reply({content : `<@${interaction.options.getMember('user').user.id}> unbanned!`, ephemeral : true});
          }
        }else{
          await db.set(`commandban.${user}`, {banunban, reason, bancounter: bancounter + 1});
          await interaction.reply({content : `<@${interaction.options.getMember('user').user.id}> banned`, ephemeral : true});
        }
      }
    }
    
  }
  /*
    only user see this message 
    await interaction.reply({content : 'Running command ban command', ephemeral : true});
  */
});

client.login(config.token).catch(e => {
  console.log("The Bot Token You Entered Into Your Project Is Incorrect Or Your Bot's INTENTS Are OFF!")
})