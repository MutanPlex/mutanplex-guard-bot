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
  },
  {
    name: "ban",
    description: "Ban to user",
    options: [{
        name: "user",
        description: "User to ban",
        type: 6,
        required: true
      },
      {
        name: "reason",
        description: "Reason to ban",
        type: 3,
        required: true
      }]
  },
  {
    name: "unban",
    description: "Unban to user",
    options: [{
        name: "user",
        description: "User to unban",
        type: 3,
        required: true
      }]
  },
  {
    name: "kick",
    description: "Kick to user",
    options: [{
        name: "user",
        description: "Kick to user",
        type: 6,
        required: true
      },
      {
        name: "reason",
        description: "Reason to kick",
        type: 3,
        required: true
      }]
  },
];

// REGISTER SLASH COMMANDS
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await console.log(db.table("commandban"));
    await console.log(db.table("banlog"));
    await console.log(db.table("kicklog"));
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

  if(interaction.commandName === 'ban'){
    if(interaction.member.permissions.has("BAN_MEMBERS")) {
      const user = interaction.options.getUser('user');
      const reason = user.tag + " - " + interaction.options.getString('reason') + " - " + interaction.user.id + " - " + interaction.user.tag;
      const member = interaction.guild.members.cache.get(user.id);
      if(member == interaction.member) {
        return await interaction.reply({ content: "You can't ban yourself.", ephemeral: true });
      }
      if(member == interaction.guild.fetchOwner()) {
        return await interaction.reply({ content: "You can't ban server owner.", ephemeral: true });
      }
      if(member == client.user) {
        return await interaction.reply({ content: "You can't ban me.", ephemeral: true });
      }
      if(member == config.ownerid) {
        return await interaction.reply({ content: "You can't ban my owner.", ephemeral: true });
      }
      if(member == interaction.guild.members.cache.get(config.clientid)) {
        return await interaction.reply({ content: "You can't ban my client.", ephemeral: true });
      }
      if(member){
        const guildbancountarray = await db.get(`banlog.${user}`);
        var guildbancount = 0; 
        if(guildbancountarray != null) {
          guildbancountarray.forEach(async (ban) => {
            guildbancount = guildbancount + 1;
          });
        }
        await db.push(`banlog.${user}`, {ban: `Banned by <@${interaction.user.id}>`, reason, guildbancount: guildbancount + 1});
        await member.ban({ reason: reason });
        await interaction.reply({ content: `**${user.tag}** banned from server.`, ephemeral: true });
        console.log(`` + user.tag + ` banned from ` + interaction.guild.name + ` by ` + interaction.user.tag + ``);
      }else{
        await interaction.reply({ content: `<@${user.id}> not on server`, ephemeral: true });
      }
    }else{
      await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
    }
  }
  if(interaction.commandName === 'unban'){
    
    if(interaction.member.permissions.has("BAN_MEMBERS")) {
      const userx = interaction.options.getString('user');
      try {
        let user = await interaction.guild.members.unban(userx);
        await interaction.reply({ content: `**${user}** unbanned from server.`, ephemeral: true });
        console.log(`` + user + ` unbanned from ` + interaction.guild.name + ` by ` + interaction.user.tag + ``);
      } catch (error) {
        await interaction.reply({ content: `**<@${userx}>** not banned from server.`, ephemeral: true });
      }
    }else{
      await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
    }
  }
  if(interaction.commandName === 'command-ban'){
    const intuser = interaction.user.id;
    if(intuser != config.ownerid){
      return await interaction.reply({content: "You are not owner of this bot!", ephemeral: true});
    }
    if(interaction.options.getMember('user').user.id != null){
      const user = interaction.options.getMember('user').user.id;
      var bancounter = 0;
      const banned = await db.get(`commandban.${user}`);
      if(banned) {
        banned.forEach(async (ban) => {
          bancounter = bancounter + 1;
        });
      }
      const reason = interaction.options.getString('reason') + " - " + interaction.user.id + " - " + interaction.user.tag;
      const banunban = interaction.options.getBoolean('ban-unban');
      if(bancounter % 2 == 1){
        if(banunban == true){
          console.log(`` + interaction.user.tag + ` tried to ban ` + user + ` but already banned.`);
          return await interaction.reply({content: "User is already banned from using slash commands!", ephemeral: true});
        }else{
          await db.push(`commandban.${user}`, { reason: reason, bancounter: bancounter + 1});
          await interaction.reply({content: "User unbanned from using slash commands!", ephemeral: true});
          console.log(`` + interaction.options.getMember('user').user.tag + ` unbanned from using slash commands by ` + interaction.user.tag + ``);
        }
      }else{
        if(banunban == true){
          await db.push(`commandban.${user}`, { reason: reason, bancounter: bancounter + 1});
          await interaction.reply({content: "User banned from using slash commands!", ephemeral: true});
          console.log(`` + interaction.options.getMember('user').user.tag + ` banned from using slash commands by ` + interaction.user.tag + ``);
        }else{
          console.log(`` + interaction.user.tag + ` tried to unban ` + user + ` but not banned.`);
          return await interaction.reply({content: "User is not banned from using slash commands!", ephemeral: true});
        }
      }
    }
    
    
  }
  if(interaction.commandName === 'kick'){
    if(interaction.member.permissions.has("KICK_MEMBERS")) {
      const user = interaction.options.getUser('user');
      const reason = user.tag + " - " + interaction.options.getString('reason') + " - " + interaction.user.id + " - " + interaction.user.tag;
      const member = interaction.guild.members.cache.get(user.id);
      if(member == interaction.member) {
        return await interaction.reply({ content: "You can't kick yourself.", ephemeral: true });
      }
      if(member == interaction.guild.fetchOwner()) {
        return await interaction.reply({ content: "You can't kick server owner.", ephemeral: true });
      }
      if(member == client.user) {
        return await interaction.reply({ content: "You can't kick me.", ephemeral: true });
      }
      if(member == config.ownerid) {
        return await interaction.reply({ content: "You can't kick my owner.", ephemeral: true });
      }
      if(member == interaction.guild.members.cache.get(config.clientid)) {
        return await interaction.reply({ content: "You can't kick my client.", ephemeral: true });
      }
      if(member){
        const guildkickcountarray = await db.get(`kicklog.${user}`);
        var guildkickcount = 0; 
        if(guildkickcountarray != null) {
          guildkickcountarray.forEach(async (kick) => {
            guildkickcount = guildkickcount + 1;
          });
        }
        await db.push(`kicklog.${user}`, {kick: `Kicked by <@${interaction.user.id}>`, reason, guildkickcount: guildkickcount + 1});
        await member.kick({ reason: reason });
        await interaction.reply({ content: `**${user.tag}** kicked from server.`, ephemeral: true });
        console.log(`` + user.tag + ` kicked from ` + interaction.guild.name + ` by ` + interaction.user.tag + ``);
      }else{
        await interaction.reply({ content: `<@${user.id}> not on server`, ephemeral: true });
      }
    }else{
      await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
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