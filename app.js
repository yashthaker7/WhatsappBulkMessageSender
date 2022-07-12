const { Client, NoAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const csv = require('csv-parser');

const message = fs.readFileSync("./message.txt", {encoding: 'utf-8'});
const contacts = [];

fs.createReadStream('contacts.csv')
.pipe(csv())
.on('data', function(data) {
    try {
        contacts.push(data.number); 
    } catch(err) {
        console.error(err);
    }
})
.on('end', () => {
    // console.log(contacts);
});

// let counter = { fails: 0, success: 0 }

/*
const SESSION_FILE_PATH = './whatsapp-session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({
    session: sessionCfg
});
*/

// equivalent to
const client = new Client({
    authStrategy: new NoAuth()
});

client.initialize();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

/*
client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});
*/

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Client is ready!');
    deploy_all();
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});


function deploy_all() {   

    for (const contact of contacts) {
        const final_number = (contact.length > 10) ? `${contact}@c.us` : `91${contact}@c.us`;
        
        client.isRegisteredUser(final_number).then(function(isRegistered) {
            if(isRegistered) {
                client.sendMessage(final_number, message).then(function(msg) {
                		console.log(`${contact} Sent`);
                		// counter.success++;
                	});
            } else {
                console.log(`${contact} Failed`);
                // counter.fails++;
            }
        });
    }
    // console.log(`Result: ${counter.success} sent, ${counter.fails} failed`);
}