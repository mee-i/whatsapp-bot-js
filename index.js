const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const { Config, FunctionCommand } = require("./config.js");
const { Chat, getParameterNames } = require("./utilities/utilities.js");
const figlet = require("figlet");
var colors = require("colors");
var qrcode = require("qrcode-terminal");
const { LoadModules } = require("./load-modules");


colors.setTheme({
	silly: "rainbow",
	input: "grey",
	verbose: "cyan",
	prompt: "grey",
	info: "green",
	data: "grey",
	help: "cyan",
	warn: "yellow",
	debug: "blue",
	error: "red",
});

const IsCommand = (body) => {
    return Config.prefix.some((p) => body.startsWith(p));
};

const client = new Client({
	authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
	// Generate and scan this code with your phone
	console.log("QR RECEIVED", qr);
	qrcode.generate(qr, { small: true });
});

client.on("remote_session_saved", () => {
	// Do Stuff...
	console.log("Session saved".info);
});

client.on("ready", () => {
	console.log("Client is ready!".info);
});

client.on("message_create", async (msg) => {
    if (msg.fromMe)
        return;
    const chat = await msg.getChat();
	if (!msg.hasMedia) {
        console.log(`[${chat.name.help}][${colors.help(`+${Chat(msg).getNumber()}`)}]: ${msg.body.info}`);
		if (IsCommand(msg.body)) {
            let args = msg.body.split(" ");
			const CommandWithoutPrefix = args[0].slice(1);
            if (CommandWithoutPrefix == "reloadmenu") {
                await LoadModules(client);
                msg.reply("All modules reloaded successfully.");
                return;
            }
            args.shift();
			Object.keys(FunctionCommand).forEach((menuname) => {
				if (FunctionCommand[menuname][CommandWithoutPrefix]) {
					const Func = FunctionCommand[menuname][CommandWithoutPrefix];
					const Params = getParameterNames(Func);
					const FuncParameterLength = Params.length - 1;
					if (args.length < FuncParameterLength) {
						msg.reply("Need more parameters");
					} else {
						if (FuncParameterLength === 1 && args.length > 1) {
							args = [args.join(" ")];
						}

						try {
							Func(msg, ...args);
						} catch (error) {
							client.sendMessage(Config.owner + "@s.whatsapp.net", `[ERROR REPORT]
Command: *${msg.body}*
Menu: *${menuname}*
Error: _${error.message}_`);
						}
					}
				}
			});
		}
	}
});

(async () => {
    try {
        console.log("Loading modules...");
        await LoadModules(client); // Menunggu semua module selesai di-load
        console.log("All modules loaded successfully.");

        // Setelah module selesai di-load, inisialisasi bot
        console.log(figlet.textSync("MeeI Whatsapp Bot").help);
        console.log('Starting Bot...');
        client.initialize();
    } catch (error) {
        console.error("Failed to load modules:", error);
    }
})();