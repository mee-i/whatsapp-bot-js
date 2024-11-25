
const { Config } = require("../config");

function Chat(msg) {
    const getNumber = () => {
        return msg.author ? msg.author.replace("@c.us", "") : msg.from.replace("@c.us", "");
    };

    return {
        getPhone,
        IsOwner: () => {
            return Config.owner === getNumber();
        },
        IsAdmin: () => {
            return Config.admin.includes(getNumber());
        }
    };
};

function getParameterNames(fn) {
    const functionString = fn.toString();
    const result = functionString.match(/\(([^)]*)\)/);
    return result ? result[1].split(',').map(param => param.trim()) : [];
}

module.exports = {
    Chat,
    getParameterNames
}