const { MessageMedia } = require('whatsapp-web.js');
const { Config, FunctionCommand } = require("../config");
const { getParameterNames } = require("../utilities/utilities");

async function menu(msg) {
    const now = new Date();
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    let menu = `*MeeI Bot Menu!*
_Halo,_ *${msg._data.notifyName}*
${formattedDate}

Ketik /menu atau /help untuk menampilkan list menu!
List Menu:
`;
    Object.keys(FunctionCommand).forEach(menuname => {
        menu += `*[ ${menuname} ]*\n`
        Object.keys(FunctionCommand[menuname]).forEach(cmd => {
            const Params = getParameterNames(FunctionCommand[menuname][cmd]);
            Params.shift();
            Params.shift();
            menu += `- *${Config.prefix[0] + cmd}*`;
            Params.forEach(element => {
                menu += `<${element}>`;
            });
            menu += "\n";
        });
        menu += "\n";
    });
    const media = await MessageMedia.fromFilePath('media/MeeI-Bot.png');
    await msg.reply(media, msg.from, { caption: menu});
}

module.exports = {
    menu
};