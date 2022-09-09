const { EmbedBuilder, Embed } = require("discord.js");
var config = require("../../config.js");
const client = require("../../index.js");
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'db.sqlite' });
const moment = require("moment");

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
    if(interaction.commandName === 'reactionrole'){
      if(interaction.member == interaction.guild.fetchOwner()) {
        return await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
      const message = interaction.options.getString('message');
      const role = interaction.options.getRole('role');
      const emoji = interaction.options.getString('emoji');
      if(message && role && emoji){
        const msg = await interaction.channel.messages.fetch(message);
        if(msg){
          await msg.react(emoji);
          await db.push(`reactionrole.${interaction.guild.id}`, { message ,role: role.id, emoji: emoji });
          await interaction.reply({ content: `Reaction role added to message.`, ephemeral: true });
          console.log(`Reaction role added to message by ` + interaction.user.tag + ``);
        }else{
          await interaction.reply({ content: `Message not found.`, ephemeral: true });
        }
      }else{
        await interaction.reply({ content: `Missing arguments.`, ephemeral: true });
      }
    }
    if(interaction.commandName === 'removereactionrole'){
      if(interaction.member == interaction.guild.fetchOwner()) {
        return await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
      const message = interaction.options.getString('message');
      const role = interaction.options.getRole('role');
      const emoji = interaction.options.getString('emoji');
      var counter = 0;
      if(message && role && emoji){
        const msg = await interaction.channel.messages.fetch(message);
        const reactionrolearray = await db.get(`reactionrole.${interaction.guild.id}`);
        reactionrolearray.forEach(async (reactionrole) => {
          if(reactionrole != null){
            if(reactionrole.message == message && reactionrole.role == role.id && reactionrole.emoji == emoji){
              return;
            }
          }
          counter = counter + 1;
        });
        if(msg){
          await db.delete(`reactionrole.${interaction.guild.id}[${counter}]`);
          await interaction.reply({ content: `Reaction role removed from message.`, ephemeral: true });
          console.log(`Reaction role removed from message by ` + interaction.user.tag + ``);
        }else{
          await interaction.reply({ content: `Message not found.`, ephemeral: true });
        }
      }else{
        await interaction.reply({ content: `Missing arguments.`, ephemeral: true });
      }
    }
    if(interaction.commandName === 'reactionrolelist'){
      if(interaction.member == interaction.guild.fetchOwner()) {
        return await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
      const reactionrolearray = await db.get(`reactionrole.${interaction.guild.id}`);
      var reactionrolelist = "";
      if(reactionrolearray != null){
        reactionrolearray.forEach(async (reactionrole) => {
          if(reactionrole != null){
            reactionrolelist = reactionrolelist + `Message: <#${reactionrole.message}>\nRole: <@&${reactionrole.role}>\nEmoji: ${reactionrole.emoji}\n\n`;
          }
        });
      }
      if(reactionrolelist == ""){
        reactionrolelist = "No reaction roles found.";
      }
      await interaction.reply({ content: reactionrolelist, ephemeral: true });
    }
    if(interaction.commandName === 'reactionroleclear'){
      if(interaction.member == interaction.guild.fetchOwner()) {
        return await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
      const reactionrolearray = await db.get(`reactionrole.${interaction.guild.id}`);
      reactionrolearray.forEach(async (reactionrole) => {
        if(reactionrole != null){
          await db.delete(`reactionrole.${interaction.guild.id}`);
        }
      });
      await interaction.reply({ content: `Reaction roles cleared.`, ephemeral: true });
      console.log(`Reaction roles cleared by ` + interaction.user.tag + ``);
    }
    if(interaction.commandName === 'addrole'){
      if(interaction.member.permissions.has("MANAGE_ROLES")) {
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const member = interaction.guild.members.cache.get(user.id);
        if(member == interaction.member) {
          return await interaction.reply({ content: "You can't add role to yourself.", ephemeral: true });
        }
        if(member == interaction.guild.fetchOwner()) {
          return await interaction.reply({ content: "You can't add role to server owner.", ephemeral: true });
        }
        if(member == client.user) {
          return await interaction.reply({ content: "You can't add role to me.", ephemeral: true });
        }
        if(member == config.ownerid) {
          return await interaction.reply({ content: "You can't add role to my owner.", ephemeral: true });
        }
        if(member == interaction.guild.members.cache.get(config.clientid)) {
          return await interaction.reply({ content: "You can't add role to my client.", ephemeral: true });
        }
        if(member){
          await member.roles.add(role);
          await db.push(`rolelog.${user}`, {role: `Added role <@&${role.id}> by <@${interaction.user.id}>`});
          await interaction.reply({ content: `**${role.name}** role added to **${user.tag}**.`, ephemeral: true });
          console.log(`` + role.name + ` role added to ` + user.tag + ` by ` + interaction.user.tag + ``);
        }else{
          await interaction.reply({ content: `<@${user.id}> not on server`, ephemeral: true });
        }
      }else{
        await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
    }
    if(interaction.commandName === 'removerole'){
      if(interaction.member.permissions.has("MANAGE_ROLES")) {
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const member = interaction.guild.members.cache.get(user.id);
        if(member == interaction.member) {
          return await interaction.reply({ content: "You can't remove role from yourself.", ephemeral: true });
        }
        if(member == interaction.guild.fetchOwner()) {
          return await interaction.reply({ content: "You can't remove role from server owner.", ephemeral: true });
        }
        if(member == client.user) {
          return await interaction.reply({ content: "You can't remove role from me.", ephemeral: true });
        }
        if(member == config.ownerid) {
          return await interaction.reply({ content: "You can't remove role from my owner.", ephemeral: true });
        }
        if(member == interaction.guild.members.cache.get(config.clientid)) {
          return await interaction.reply({ content: "You can't remove role from my client.", ephemeral: true });
        }
        if(member){
          await member.roles.remove(role);
          await db.push(`rolelog.${user}`, {role: `Removed role <@&${role.id}> by <@${interaction.user.id}>`});
          await interaction.reply({ content: `**${role.name}** role removed from **${user.tag}**.`, ephemeral: true });
          console.log(`` + role.name + ` role removed from ` + user.tag + ` by ` + interaction.user.tag + ``);
        }else{
          await interaction.reply({ content: `<@${user.id}> not on server`, ephemeral: true });
        }
      }else{
        await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
    }
    if(interaction.commandName === 'rolelog'){
      if(interaction.member.permissions.has("MANAGE_ROLES")) {
        const user = interaction.options.getString('user');
        const member = interaction.guild.members.cache.get(user);
        const rolelog = await db.get(`rolelog.${member}`);
        if(rolelog){
          var rolelogtext = '';
          rolelog.forEach(async (role) => {
            rolelogtext = rolelogtext + role.role + '\n';
          });
          await interaction.reply({ content: `**Role log for <@${member.id}>**: \n\n` + rolelogtext, ephemeral: true });
        }else{
          await interaction.reply({ content: `**Role log for <@${member.id}>**: \n\nNo role log found.`, ephemeral: true });
        }
      }else{
        await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
    }
    if(interaction.commandName === 'voicemute'){
      if(interaction.member.permissions.has("MUTE_MEMBERS")) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason');
        const nowtime = new Date();
        const dates = moment(nowtime).format('DD MM YYYY, hh:mm:ss');
        if(member == interaction.member) {
          return await interaction.reply({ content: "You can't mute yourself.", ephemeral: true });
        }
        if(member == interaction.guild.fetchOwner()) {
          return await interaction.reply({ content: "You can't mute server owner.", ephemeral: true });
        }
        if(member == client.user) {
          return await interaction.reply({ content: "You can't mute me.", ephemeral: true });
        }
        if(member == config.ownerid) {
          return await interaction.reply({ content: "You can't mute my owner.", ephemeral: true });
        }
        if(member == interaction.guild.members.cache.get(config.clientid)) {
          return await interaction.reply({ content: "You can't mute my client.", ephemeral: true });
        }
        if(member){
          if(member.voice.channel){
            await member.voice.setMute(true);
            await db.push(`voicelog.${user.id}`, {voice: `Muted by <@${interaction.user.id}> for reason: ${reason} Date: ${dates}`});
            await interaction.reply({ content: `**${user.tag}** muted.`, ephemeral: true });
            console.log(user.tag + ` muted by ` + interaction.user.tag + ` for reason: ` + reason + ` Date: ` + dates);
          }else{
            await interaction.reply({ content: `<@${user.id}> not in voice channel`, ephemeral: true });
          }
        }else{
          await interaction.reply({ content: `<@${user.id}> not on server`, ephemeral: true });
        }
      }else{
        await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
    }
    if(interaction.commandName === 'voiceunmute'){
      if(interaction.member.permissions.has("MUTE_MEMBERS")) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason');
        const nowtime = new Date();
        const dates = moment(nowtime).format('DD MM YYYY, hh:mm:ss');
        if(member == interaction.member) {
          return await interaction.reply({ content: "You can't unmute yourself.", ephemeral: true });
        }
        if(member == interaction.guild.fetchOwner()) {
          return await interaction.reply({ content: "You can't unmute server owner.", ephemeral: true });
        }
        if(member == client.user) {
          return await interaction.reply({ content: "You can't unmute me.", ephemeral: true });
        }
        if(member == config.ownerid) {
          return await interaction.reply({ content: "You can't unmute my owner.", ephemeral: true });
        }
        if(member == interaction.guild.members.cache.get(config.clientid)) {
          return await interaction.reply({ content: "You can't unmute my client.", ephemeral: true });
        }
        if(member){
          if(member.voice.channel){
            await member.voice.setMute(false);
            await db.push(`voicelog.${user.id}`, {voice: `Unmuted by <@${interaction.user.id}> for reason: ${reason} Date: ${dates}`});
            await interaction.reply({ content: `**${user.tag}** unmuted.`, ephemeral: true });
            console.log(user.tag + ` unmuted by ` + interaction.user.tag +  ` reason: ` + reason + ` date: ` + dates);
          }else{
            await interaction.reply({ content: `<@${user.id}> not in voice channel`, ephemeral: true });
          }
        }else{
          await interaction.reply({ content: `<@${user.id}> not on server`, ephemeral: true });
        }
      }else{
        await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
    }
    if(interaction.commandName === 'voicekick'){
      if(interaction.member.permissions.has("MOVE_MEMBERS")) {
        const user = interaction.options.getUser('user');
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
          if(member.voice.channel){
            await member.voice.disconnect();
            await db.push(`voicelog.${user}`, {voice: `Kicked by <@${interaction.user.id}>`});
            await interaction.reply({ content: `**${user.tag}** kicked.`, ephemeral: true });
            console.log(`` + user.tag + ` kicked by ` + interaction.user.tag + ``);
          }else{
            await interaction.reply({ content: `<@${user.id}> not in voice channel`, ephemeral: true });
          }
        }else{
          await interaction.reply({ content: `<@${user.id}> not on server`, ephemeral: true });
        }
      }else{
        await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
    }
    if(interaction.commandName === 'voicelog'){
      const user = interaction.options.getString('user');
      const member = interaction.guild.members.cache.get(user).user;
      const voicelog = await db.get(`voicelog.${user}`);
      if(voicelog == null){
        return await interaction.reply({ content: `<@${user}> not have any voice log`, ephemeral: true });
      }else{
        var loglist = "";
        voicelog.forEach(log => {
          loglist += log.voice + "\n";
        });
        const embed = new Embed({
          title: `Voice log of ${member.tag}`,
          description: loglist,
          thumbnail: ({ url: member.displayAvatarURL() }),
          color: 0x00ff00,
          timestamp: new Date(),
          footer: {
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          },
        });
        await interaction.reply({ embeds: [embed] });
      }
      
    }
    if(interaction.commandName === 'voicemoveall'){
      if(!interaction.member.permissions.has("MOVE_MEMBERS")) {
        return await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
      const channel = interaction.options.getChannel('channel');
      if(!channel) {
        return await interaction.reply({ content: "Please specify a channel.", ephemeral: true });
      }
      if(!channel.type == 'GUILD_VOICE') {
        return await interaction.reply({ content: "Please specify a voice channel.", ephemeral: true });
      }
      if(channel){
        if(interaction.member.voice.channel){
          var userlist = "";
          const members = interaction.member.voice.channel.members;
          for (const [memberID, member] of members) {
            if(channel.type == 'GUILD_VOICE') {
              await member.voice.setChannel(channel);
              userlist += member.user.tag + ", ";
            }
          }
          if(channel.type == 'GUILD_VOICE') {
            await interaction.reply({ content: `${userlist} moved to **${channel.name}**.`, ephemeral: true });
            await db.push(`voicemovelog.${user}`, {voice: `Moved to **${channel.name}** by <@${interaction.user.id}>`});
            console.log(`${userlist} moved to **${channel.name}** by ` + interaction.user.tag + ``);
          }else{
            await interaction.reply({ content: "Please specify a voice channel.", ephemeral: true });
          }
        }else{
          await interaction.reply({ content: `You not in voice channel`, ephemeral: true });
        }
      }else{
        await interaction.reply({ content: `Channel not found`, ephemeral: true });
      }
    }
    if(interaction.commandName === 'voicemove'){
      if(!interaction.member.permissions.has("MOVE_MEMBERS")) {
        return await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
      const user = interaction.options.getUser('user');
      const member = interaction.guild.members.cache.get(user.id);
      const channel = interaction.options.getChannel('channel');
      if(member == interaction.member) {
        return await interaction.reply({ content: "You can't move yourself.", ephemeral: true });
      }
      if(member == interaction.guild.fetchOwner()) {
        return await interaction.reply({ content: "You can't move server owner.", ephemeral: true });
      }
      if(member == client.user) {
        return await interaction.reply({ content: "You can't move me.", ephemeral: true });
      }
      if(member == config.ownerid) {
        return await interaction.reply({ content: "You can't move my owner.", ephemeral: true });
      }
      if(member == interaction.guild.members.cache.get(config.clientid)) {
        return await interaction.reply({ content: "You can't move my client.", ephemeral: true });
      }
      if(!member){
        return await interaction.reply({ content: `<@${user.id}> not on server`, ephemeral: true });
      }
      if(!member.voice.channel){
        return await interaction.reply({ content: `<@${user.id}> not in voice channel`, ephemeral: true });
      }
      if(channel == member.voice.channel){
        return await interaction.reply({ content: `<@${user.id}> already in **${channel.name}**`, ephemeral: true });
      }
      if(channel == null){
        return await interaction.reply({ content: `Channel not found.`, ephemeral: true });
      }
      if(channel.type != "GUILD_VOICE"){
        return await interaction.reply({ content: `Channel not voice channel.`, ephemeral: true });
      }
      await member.voice.setChannel(channel);
      await db.push(`voicemovelog.${user}`, {voice: `Moved to <#${channel.id}> by <@${interaction.user.id}>`});
      await interaction.reply({ content: `**${user.tag}** moved to **${channel.name}**.`, ephemeral: true });
      console.log(`` + user.tag + ` moved to ` + channel.name + ` by ` + interaction.user.tag + ``);
    }
    if(interaction.commandName === 'voicemovelog'){
      if(!interaction.member.permissions.has("MOVE_MEMBERS")) {
        return await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
      }
      const user = interaction.options.getString('user');
      const member = interaction.guild.members.cache.get(user);
      if(!member){
        return await interaction.reply({ content: `<@${member.id}> not on server`, ephemeral: true });
      }
      const voicemovelog = await db.get(`voicemovelog.${user}`);
      if(!voicemovelog){
        return await interaction.reply({ content: `<@${member.id}> not have any voice move log`, ephemeral: true });
      }else{
        var loglist = "";
        voicemovelog.forEach(log => {
          loglist += log.voice + "\n";
          });
        const embed = new Embed({
          title: `Voice move log of ${member.user.tag}`,
          description: loglist,
          color: 0x00ff00,
          timestamp: new Date(),
          footer: {
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          },
        });
        await interaction.reply({ embeds: [embed] });
      }
      
    }
  });