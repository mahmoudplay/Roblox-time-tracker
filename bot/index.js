require('dotenv').config();
const { Client, Routes, GatewayIntentBits, Collection, REST, MessageFlags } = require('discord.js');
const { registerCommands } = require('./utils/registry');
const { Buttons } = require('./schemas/buttonSchema');
const { mongodbConnection } = require('./controller/mongoConn');

const { TOKEN, CLIENT_ID, MONGODB_LINK } = process.env
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ], rest: { version: '10' }})


const rest = new REST({ version: '10' }).setToken(TOKEN);

client.on('clientReady', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})



client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const cmd = client.slashCommands.get(interaction.commandName);
    
    if (!cmd) {
      return interaction.reply({ content: 'ليس لهذا الامر تشغيل.', flags: MessageFlags.Ephemeral });
    }

    const isOwner = interaction.user.id === interaction.guild.ownerId;

    if (cmd._owner) {
      if (!isOwner) return interaction.reply({ content: noPermMsg, flags: MessageFlags.Ephemeral });
      return cmd.run(client, interaction);
    }

    return cmd.run(client, interaction);
  }
  else if (interaction.isButton()) {
    let commandCheck = await Buttons.findOne({btn_customId: interaction.customId})

    let commandName = commandCheck ? commandCheck.commandName : interaction.message.interaction?.commandName;
    const cmd = client.slashCommands.get(commandName);

    if (cmd && typeof cmd.runBtn === 'function') {
      return cmd.runBtn(client, interaction);
    } else {
      return interaction.reply({ content: 'ليس لهذا الزر امر تشغيل.', flags: MessageFlags.Ephemeral });
    }
  } else if (interaction.isAnySelectMenu()) {
    let commandCheck = await Buttons.findOne({btn_customId: interaction.customId})

    let commandName = commandCheck ? commandCheck.commandName : interaction.message.interaction?.commandName;
    const cmd = client.slashCommands.get(commandName);

    if (cmd && typeof cmd.runSelect === 'function') {
      return cmd.runSelect(client, interaction);
    } else {
      return interaction.reply({ content: 'ليس لهذه الاختيارات تشغيل.', flags: MessageFlags.Ephemeral });
    }
  }
  else if (interaction.isModalSubmit()) {
    let commandCheck = await Buttons.findOne({btn_customId: interaction.customId})

    let commandName = commandCheck ? commandCheck.commandName : interaction.message.interaction?.commandName;
    const cmd = client.slashCommands.get(commandName);

    if (cmd && typeof cmd.runModel === 'function') {
      return cmd.runModel(client, interaction);
    } else {
      return interaction.reply({ content: 'ليس لهذا الموديل تشغيل.', flags: MessageFlags.Ephemeral });
    }
  }
});

async function main() {
    try{
        client.slashCommands = new Collection();
        await registerCommands(client, '../commands');
        
        const slashCommandsJson = client.slashCommands.map((cmd) => {
            return cmd.getSlashCommandJSON()
        })

        await rest.put(Routes.applicationCommands(CLIENT_ID), {
            body: slashCommandsJson
        });

        const registeredSlashCommands = await rest.get(
            Routes.applicationCommands(CLIENT_ID)
        );

        await client.login(TOKEN);
        console.log('Successfully reloaded application (/) commands.');

        (async () => {
            await mongodbConnection(MONGODB_LINK)
        })()

    }catch(err){
        console.log(err)
    }
}

main();