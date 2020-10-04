require('dotenv').config()
const NoodleJS = require('noodle.js');

const client = new NoodleJS({
    url: process.env.MUMBLE_URL,
    name: process.env.NAME
});
 
client.connect();

setTimeout(() => {
    // console.log(client.channels.array()[2])
    console.log(client.user.channel)
    // client.user.channel = client.channels.array()[2]
}, 3000);


export const mumbleClient = {

}