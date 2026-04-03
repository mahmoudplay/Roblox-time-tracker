const path = require('path');
const fs = require('fs/promises');
const ascii = require('ascii-table');

let table = new ascii("Commands");
table.setHeading('Command', 'Load status')

async function registerCommands(client, dir = '') {
    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    for(const file of files){
        const stat = await fs.lstat(path.join(filePath, file))
        if(stat.isDirectory())
            await registerCommands(client, path.join(dir, file));

        if(file.endsWith('.js')){
            try {
                const Command = require(path.join(filePath, file));
                const cmd = new Command();
                client.slashCommands.set(cmd.name, cmd);
                table.addRow(file, '✅')
            }catch(err){
                table.addRow(file, '❌ -> Error')
                console.log(err)
            }
        }
    }
    await console.log(table.toString());
}

module.exports = {
    registerCommands,
};