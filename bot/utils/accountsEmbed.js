const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js')
const { getAverageColor } = require('fast-average-color-node'); 
const { RobloxUsers } = require("../schemas/usersSchema");
const timeTracker = require('../schemas/timeSchema');
const formatTime = require('./formatTime');

async function getTime(userId){
    const acc = await timeTracker.findOne({ userId })
    
    if(acc){
        return acc.time;
    }else {
        return false;
    }
}

async function accountsEmbed(interaction, id){
    let robloxUser = await RobloxUsers.findOne({ user_id: id });

    if(!robloxUser){
        const findUser = await interaction.guild.members.fetch(id).catch(() => null);
        robloxUser = new RobloxUsers({ username: findUser.user.username, user_id: findUser.user.id, accounts: []})
        await robloxUser.save();
    }

    const accounts = robloxUser.accounts.length || 0;
    const colorRange = await getAverageColor(interaction.guild.iconURL());

    let accountsList;

    if (accounts > 0) {
        accountsList = await Promise.all(
            robloxUser.accounts.map(async (acc, index) => {
                const time = await getTime(acc.roblox_userId);

                return `${index + 1}- ${acc.roblox_username} - ${
                    time ? formatTime(time) : 'لم يدخل الماب بعد'
                }`;
            })
        );
    } else {
        accountsList = ['لا توجد حسابات 😔'];
    }

    const accountsEmbed = new EmbedBuilder()
    .setTitle('**الحسابات المسجلة**')
    .setColor(colorRange.hex)
    .setDescription(
        `\`-\` عدد الحسابات المسجلة \`:\` **${accounts}/2** \n\n ${accountsList.join('\n')}`
    );

    const buttons = [
        new ButtonBuilder()
        .setLabel('اضافة حساب')
        .setCustomId('add_acc')
        .setStyle(ButtonStyle.Success)
    ];

    if (accounts > 0) {
        buttons.push(
            new ButtonBuilder()
            .setLabel('إزالة حساب')
            .setCustomId('rm_acc')
            .setStyle(ButtonStyle.Danger)
        );
    }

    const btns = new ActionRowBuilder().addComponents(buttons);

    return { embeds: [accountsEmbed], components: [btns], flags: MessageFlags.Ephemeral }
}

module.exports = accountsEmbed