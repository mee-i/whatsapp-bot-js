const { Client, LocalAuth } = require("whatsapp-web.js");
const { Config, FunctionCommand } = require("./config.js");
const fs = require("fs")
const path = require("path");
var colors = require("colors");
var qrcode = require("qrcode-terminal");

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
	console.log("Received a message: ".data, msg.body.info);
	if (!msg.hasMedia) {
		const parts = msg.body.split(" ");
		const IsCommand = () => {
			return Config.prefix.some((p) => parts[0].startsWith(p));
		};
		const args = parts.shift();

		if (IsCommand()) {
			const CommandWithoutPrefix = parts[0].slice(1);
			Object.keys(FunctionCommand).forEach((menuname) => {
				if (FunctionCommand[menuname][CommandWithoutPrefix]) {
					const Func = FunctionCommand[menuname][CommandWithoutPrefix];
					const Params = getParameterNames(Func);
					const FuncParameterLength = Params.length - 2;
					if (args.length < FuncParameterLength) {
						msg.reply("Need more parameters");
					} else {
						if (FuncParameterLength === 1 && args.length > 1) {
							args = [args.join(" ")];
						}

						try {
							Func(sock, msg, ...args);
						} catch (error) {
							client.sendMessage(Config.owner + "@s.whatsapp.net", `[ERROR REPORT]
                            Command: *${msg.body}*
                            Menu: *${menuname}*
                            Error: _${error.message}_
                            `);
						}
					}
				}
			});
		}
	}
});

fs.readdir("./modules/", (err, files) => {
	if (err) {
		console.error("Error reading the directory:", err);
		return;
	}

	// Menjalankan setiap file JavaScript
	files.forEach((file) => {
		const filePath = "./modules/" + file;
		if (path.extname(file) === ".js") {
			console.log("Loading %s", filePath);
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
	});
});

client.initialize();
