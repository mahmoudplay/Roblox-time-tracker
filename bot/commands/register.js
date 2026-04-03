const BaseSlashCommand = require('../utils/BaseSlashCommand')
const { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, LabelBuilder, TextInputStyle, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Embed } = require('discord.js')
const { getAverageColor } = require('fast-average-color-node'); 
const accountsEmbed = require('../utils/accountsEmbed');
const verifyUser = require('../utils/verfiyUser');
const { RobloxUsers } = require('../schemas/usersSchema');
const timeTracker = require('../schemas/timeSchema');


module.exports = class CreateTimeTrackerSlashCommand extends BaseSlashCommand {
    constructor(){
        super('register')
    }

    async run(client, interaction) {
        const colorRange = await getAverageColor(interaction.guild.iconURL());

        const registerEmbed = new EmbedBuilder()
        .setTitle("`#` Roblox Time Tracker  `|` متتبع روبلوكس")
        .setColor(colorRange.hex)
        .setDescription("`-` **كيف تسجل في ثلاث خطوات** `:`\n \n `-` **اضغط علي زر `سجل` وسجل اسمك بروبلوكس** \n `-` **ادخل الماب وابدا العب, كل دقيقة بيتحسبلك روبكس** \n `-` **لما تخلص اضغط علي `سحب` لتسحب الروبكس**")
        .setFooter({ text: "ينحسب الروبكس عند خروجك من الماب وينضاف تلقائيا لحسابك " })
        .setTimestamp();

        const btns = new ActionRowBuilder().setComponents( 
            new ButtonBuilder()
            .setLabel('سجل')
            .setCustomId('register_btn')
            .setEmoji('📝')
            .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
            .setLabel('سحب')
            .setCustomId('withdraw')
            .setEmoji('💸')
            .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
            .setLabel('رصيدي')
            .setCustomId('robux')
            .setEmoji('💲')
            .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
            .setLabel('رابط الماب')
            .setURL('https://www.npmjs.com/package/node-fetch#installation')
            .setStyle(ButtonStyle.Link)
        );

        interaction.reply({ content: `تم النشر ✅`, flags: MessageFlags.Ephemeral })
        await client.channels.cache.get(interaction.channelId).send({embeds: [registerEmbed], components: [btns] })

    }

    async runBtn(client, interaction) {
        if (interaction.customId === "register_btn") {
            interaction.reply(await accountsEmbed(interaction, interaction.user.id))
        }

        if(interaction.customId === "add_acc"){
            let dis = await RobloxUsers.findOne({ user_id: interaction.user.id })

            if(dis.accounts.length < 2){
                 const modal = new ModalBuilder().setCustomId('nameModel').setTitle('ٍتسجيل الاسم');

                const nameInput = new TextInputBuilder()
                    .setCustomId('nameInput')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('مثل: mahmoudplay')
                    .setMinLength(3);
                    
                const nameLabel = new LabelBuilder()
                    .setLabel("اسمك بي روبلوكس")
                    .setTextInputComponent(nameInput);

                modal.addLabelComponents(nameLabel);

                await interaction.showModal(modal);
            }else{
                interaction.reply({ content: `**لقد وصلت للحد الاقصي من عدد الحسابات**`, flags: MessageFlags.Ephemeral })
            }
        }

        if(interaction.customId === "rm_acc"){
            const disUser = await RobloxUsers.findOne({ user_id: interaction.user.id })

            if(disUser.accounts.length > 0){
                const accountsSelect = new StringSelectMenuBuilder()
                .setCustomId(`rm_acc_select`)
                .setPlaceholder('اختر الحساب/ات')
                .setMinValues(1)
                .setMaxValues(disUser.accounts.length)
                .addOptions(
                    disUser.accounts.map(acc => {
                        return new StringSelectMenuOptionBuilder()
                        .setLabel(acc.roblox_username)
                        .setValue(`${acc.roblox_userId}`)
                    })
                );

                const row = new ActionRowBuilder()
                .addComponents(accountsSelect);

                await interaction.reply({
                    components: [row],
                    flags: MessageFlags.Ephemeral
                });
            }else interaction.reply({ content: `😔 **لا توجد حسابات**`, flags: MessageFlags.Ephemeral })
        }

        if(interaction.customId === 'withdraw'){
            const disUser = await RobloxUsers.findOne({ user_id: interaction.user.id })
            const colorRange = await getAverageColor(interaction.guild.iconURL());

            const robUsers = await Promise.all(
                disUser.accounts.map(async acc => {
                    const robUser = await timeTracker.findOne({ userId: acc.roblox_userId });
                    if (robUser) {
                        const funds = Math.floor(robUser.funds);
                        robUser.funds = 0;
                        await robUser.save()
                        return funds;
                    }

                    return 0;
                })
            );

            const robux = robUsers.reduce((total, funds) => total + funds, 0);

            if(robux > 10){
                const withdrawEmbed = new EmbedBuilder()
                .setTitle(`**تم سحب \`${robux}\` روبكس من حساباتك**`)
                .setColor(colorRange.hex)

                interaction.reply({ embeds: [withdrawEmbed], flags: MessageFlags.Ephemeral })
            }else interaction.reply({ content: `😔 **ليس لديك ما يكفي للسحب**`, flags: MessageFlags.Ephemeral })
            
        }

        if(interaction.customId === 'robux'){
            const disUser = await RobloxUsers.findOne({ user_id: interaction.user.id })
            const colorRange = await getAverageColor(interaction.guild.iconURL());

            const robUsers = await Promise.all(
                disUser.accounts.map(acc => timeTracker.findOne({ userId: acc.roblox_userId }))
            );

            const robux = robUsers.reduce((total, robUser) => {
            if (robUser) return total + Math.floor(robUser.funds);
                return total;
            }, 0);

            const accounts = disUser.accounts.length || 0;
        
            let accountsList;
        
            if (accounts > 0) {
                accountsList = await Promise.all(
                    disUser.accounts.map(async (acc, index) => {
                        const rbxUser = await timeTracker.findOne({ userId: acc.roblox_userId });
        
                        return `${index + 1}- ${acc.roblox_username} - ${
                            rbxUser ? `\`${rbxUser.funds}\`` : 'لم يدخل الماب'
                        }`;
                    })
                );
            } else {
                accountsList = ['لا توجد حسابات 😔'];
            }

            const robuxEmbed = new EmbedBuilder()
            .setTitle(`**رصيدك الحالي هو: \`${robux}\`**`)
            .setColor(colorRange.hex)
            .setDescription(accountsList.join('\n'));

            interaction.reply({ embeds: [robuxEmbed], flags: MessageFlags.Ephemeral })
            
        }
    }

    async runSelect(client, interaction){
        if(interaction.customId === `rm_acc_select`){
            let disUser = await RobloxUsers.findOne({ user_id: interaction.user.id })
            let accs = interaction.values

            if(disUser.accounts.length > 0){
                disUser.accounts = disUser.accounts.filter(
                    user => !accs.includes(user.roblox_userId.toString())
                );

                await disUser.save(disUser.accounts)

                interaction.reply({ content: `**تمت إزالة الحساب**`, flags: MessageFlags.Ephemeral })
            }else interaction.reply({ content: `😔 **لا توجد حسابات**`, flags: MessageFlags.Ephemeral })
        }
    }

    async runModel(client, interaction){
        if(interaction.customId === "nameModel") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            let roblox_name = interaction.fields.getTextInputValue('nameInput');
            let roblox_data = await verifyUser(roblox_name);

            if(!roblox_data || roblox_data.data.length === 0) {
                return interaction.editReply({ content: `الاسم غير موجود ❌` });
            }

            let disAcc = await RobloxUsers.findOne({ user_id: interaction.user.id });

            let newAcc = {
                roblox_username: roblox_data.data[0].name,
                roblox_userId: roblox_data.data[0].id
            };

            disAcc.accounts.push(newAcc);
            await disAcc.save();

            interaction.editReply(await accountsEmbed(interaction, interaction.user.id))
        }
    }

    getSlashCommandJSON(){
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Send register embed')
        .toJSON()
    }
}