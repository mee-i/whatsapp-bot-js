const { FunctionCommand } = require("./config");
const fs = require("fs");
const path = require("path");

async function LoadModules(client) {
    return new Promise((resolve, reject) => {
        Object.keys(FunctionCommand).forEach((key) => {
            delete FunctionCommand[key];
        });

        fs.readdir("./modules/", (err, files) => {
            if (err) {
                console.error("Error reading the directory:".error, err);
                return reject(err);
            }

            files.forEach((file) => {
                try {
                    const filePath = "./modules/" + file;
                    delete require.cache[require.resolve(filePath)];
                    if (path.extname(file) === ".js") {
                        console.log("Loading %s".debug, filePath);
                        const lib = require(filePath);
                        let MenuName = "";
                        let disableMenu = [];

                        // Memeriksa apakah lib.Config ada dan mengatur nama menu jika tersedia
                        if (lib.Config) {
                            if (lib.Config.menu) MenuName = lib.Config.menu;
                            if (lib.Config.disableMenu) disableMenu = lib.Config.disableMenu;
                            delete lib.Config;
                        }

                        if (!FunctionCommand[MenuName]) {
                            FunctionCommand[MenuName] = {};
                        }

                        Object.keys(lib).forEach((key) => {
                            if (!disableMenu.includes(key)) {
                                FunctionCommand[MenuName][key] = lib[key];
                            }
                        });
                    }
                } catch (e) {
                    client.sendMessage(Config.owner + "@s.whatsapp.net", `[ERROR REPORT]
LoadModules failed
Error: _${e.message}_`);
                }
            });
            resolve();
        });
    });
}

module.exports = {
    LoadModules
}