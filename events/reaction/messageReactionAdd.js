const { EmbedBuilder } = require("discord.js");
var config = require("../../config.js");
const client = require("../../index");
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'db.sqlite' });

client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}
  var reactionmsg = ` `;
  var reactionrole = ` `;
  var reactionemoji = ` `;
  const reactionrolearray = await db.get(`ticket.${reaction.message.guild.id}`);
  if(reactionrolearray != null){
    reactionrolearray.forEach(async (reactionx) => {
      if(reactionx == null) return;
      if(reactionx.message == reaction.message.id){
        reactionmsg = reactionx.message;
        reactionrole = reactionx.role;
        reactionemoji = reactionx.emoji;
      }
    });
    if(reaction.message.id == reactionmsg){
      if(reaction.emoji.name == reactionemoji){
        const member = reaction.message.guild.members.cache.get(user.id);
        const role = reaction.message.guild.roles.cache.get(reactionrole);
        member.roles.add(role);
      }
    }
  }
});