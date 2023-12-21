const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js")
const fs = require('fs');
const Anime_Images = require('anime-images-api')
const axios = require('axios')
const API = new Anime_Images()
const https = require('https');
const qrcode = require("qrcode-terminal")
console.log("initializing")
const client = new Client({
	authStrategy: new LocalAuth(),
	takeoverOnConflict: true,
	puppeteer: {
        executablePath: '/usr/bin/google-chrome-stable',
    }
})

client.on("qr", (qr) => {
	console.log("qring")
	qrcode.generate(qr, { small: true })
	console.log("qred")
})

client.on("ready", () => {
	console.log("server is running")
})

client.on("message_create", async (message) => {
	// Return if a message is not an actual chat but a status
	if (message.from === "status@broadcast") return

	// Get the chat the message belongs to and return if it is not a group chat
	const chat = await message.getChat()
	if (!chat.isGroup) return

	console.log("Group chat:", chat.name)

	let result = ""

	// check if a participant of the group prompts the bot with "/everyone"
	if (message.body === "/everyone"){
	// Get a list of members in the group chat
	const participants = await chat.participants
	let partic = {}

	// check if the sender is an Admin
	for (const participant of participants) {
		if (!(participant.id._serialized === message._data.id.participant)) continue
		partic = participant
		break
	}
	if (!partic.isAdmin) return
	let contacts = []
	// get the contact details of each participant
	for (const participant of participants) {
		const contact = await client.getContactById(participant.id._serialized)
		// excluding the bot itself
		const botContact = await message.getContact()
		// const botNumber = botContact.number
		// console.log(botContact)
		// if (contact.id.user === botContact.id.user) continue
		console.log("started everyone", contacts)
		contacts.push(contact)
		result += `@${contact.name} `
	}
	// send message to group chat and mention everyone
	chat.sendStateTyping()
	chat.sendMessage("", { mentions: contacts, sendSeen: false })
	// chat.sendMessage(result)

	chat.clearState()
}

	if (message.body === '/quote') {
		axios.get('https://api.quotable.io/quotes/random')
		.then((quotes) => {
			console.log(quotes.data)
			const quote = quotes.data[0]
			const author = quote.author
			const content = quote.content
			chat.sendMessage(`Quote: ${content} -${author}`)
		})
		.catch((error) => {
			console.error(error)

		})
	}

	if (message.body === '/leader-quote'){
		axios.get("https://api.api-ninjas.com/v1/quotes?category=leadership", {
			headers: {
				'X-Api-Key': 'njDYG76guOh1EZec+GnTvg==sVv5HD0IxXCdI2gl'
			  },
		})
          .then((quote) => {
			console.log(quote)
			const quotec = quote.data[0].author
			const quotecont = quote.data[0].quote
			chat.sendMessage(`Anime Quote:
${quotecont}	
-${quotec}`)
		  });
	}

	if (message.body === '/waifu') {
		axios.get('https://api.waifu.pics/sfw/waifu')
			.then(async (pic) => {
				console.log(pic)
				const url = await MessageMedia.fromUrl(pic.data.url);

				chat.sendMessage(url, {
					caption: 'meme',
				})
			});
	}

	if (message.body === '/hug') {
		axios.get('https://api.otakugifs.xyz/gif?reaction=hug&format=gif')
			.then(async (pic) => {
				console.log(pic);
				const url = await MessageMedia.fromUrl(pic.data.url);
	
				// Check if there is a quoted message
				if (message.hasQuotedMsg) {
					const quotedMsg = await message.getQuotedMessage();
					const huggedPerson = quotedMsg.author || quotedMsg.from;
					const mauthor = message.author.split('@')
					const mauthor2 = `@+${mauthor[0]}`
					const mfrom = message.to.split('@')
					const mfrom2 = `@+${mfrom}`
	
					// Reply with the hug GIF and mention the person who sent the quoted message
					chat.sendMessage(url, {
						caption: `${mauthor2} hugged ${mfrom2}`
					});
				} else {
					// If no quoted message, send the hug response to the current chat
					chat.sendMessage(url, {
						caption: 'Hug time!'
					});
				}
			})
			.catch((error) => {
				console.error(error);
				chat.sendMessage('Error fetching hug GIF.');
			});
	}
	
	

	if (message.body === '/joke'){
		axios.get('https://api.api-ninjas.com/v1/jokes?limit=1', {
			headers: {
				'X-Api-Key': 'njDYG76guOh1EZec+GnTvg==sVv5HD0IxXCdI2gl'
			  },
		})
		.then(async (jok) => {
			console.log(jok)
			const joke = jok.data[0].joke
			chat.sendMessage(`Joke: ${joke}`)
		})
	}

	if (message.body === '/cuddle') {
		axios.get('https://api.waifu.pics/sfw/cuddle')
			.then(async (pic) => {
				console.log(pic);
	
				// Check if the received media is a GIF
				if (pic.data.url.endsWith('.gif')) {
					const gifBuffer = await axios.get(pic.data.url, { responseType: 'arraybuffer' });
					const url = new MessageMedia('image/gif', gifBuffer.data.toString('base64'));
					console.log(gifBuffer)
	
					chat.sendMessage(url, {
						caption: 'meme',
						sendVideoAsGif: true
					});
				} else {
					// If it's not a GIF, handle it as an image
					const url = await MessageMedia.fromUrl(pic.data.url);
					console.log('Not a gif')
					chat.sendMessage(url, {
						caption: 'meme',
					});
				}
			});
	}
	if (message.body === '/waifu-n'){
		fetch('https://api.waifu.pics/nsfw/neko')
		.then((response) => {
			if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
			}
			return response.json();
		})
		.then(async (data) => {
			const url = await MessageMedia.fromUrl(data.url);
			chat.sendMessage(url, {
			caption: 'NSFW'
			});
		})
		.catch((error) => {
			console.error('Error fetching NSFW neko:', error);
		});

	}
	if (message.body === '/husbando'){
		fetch(`https://nekos.best/api/v2/husbando`)
			.then((response) => response.json())
			.then(async (pic) => {
				console.log(pic.results[0].url)
				const url = await MessageMedia.fromUrl(pic.results[0].url)
				chat.sendMessage(url, {
					caption: '.'
				})
			})
	}

	if (message.body === '/anime-rec'){
		const animes = []
		fetch('https://api.animethemes.moe/anime')
		.then((response) => response.json())
		.then(async (anime) => {
			for (let i = 0; i < 5 && i < anime.length; i++) {
				const animea = anime[i]
				// Log or process each anime recommendation
				chat.sendMessage(`Recommendation ${i + 1}: ${animea.name}
				Description: ${animea.synopsis}
				Year: ${animea.year}`)
				console.log(anime[i])
				animes.push()
	  
				// You can send the anime recommendation as a message or perform other actions
				// Example: chat.sendMessage(`Recommendation ${i + 1}: ${anime.name}`);
			  }

		})
	}

	if (message.body === '/anime-img'){
		axios.get(`https://api.nekosapi.com/v3/images`)
		.then(async (data) => {
			const randomnum = getRandomNumber(1, 100)
			console.log(data)
			console.log(data.items[randomnum].image_url)
			const url = await MessageMedia.fromUrl(data.items[randomnum].image_url)
			chat.sendMessage(url, {
				caption: '.',
			})
		})
	}

	if (message.body === '/contact-name') {
		try {
			const contact = await message.to
			console.log(contact);
			
			const contactName = contact.pushname; // Get the name from the contact object
			
			chat.sendMessage(`Contact name: ${contactName}`);
		} catch (error) {
			console.error("Error fetching contact:", error);
			chat.sendMessage("Error fetching contact.");
		}
	}

	if (message.body === '!quoteinfo' && message.hasQuotedMsg) {
        const quotedMsg = await message.getQuotedMessage();

        quotedMsg.reply(`
            ID: ${quotedMsg.id._serialized}
            Type: ${quotedMsg.type}
            Author: ${quotedMsg.author || quotedMsg.from}
            Timestamp: ${quotedMsg.timestamp}
            Has Media? ${quotedMsg.hasMedia}
        `);
    }
})

client.on('group_join', (notification) => {
	// User has joined or been added to the group.
	const participant = notification.id.participant;
	const participantWithoutSuffix = participant.split('@')[0];
	const welcomeMessage = '\n' + `Please introduce yourself and 3 of your favourite animes`;

	const chat = notification.getChat()
	console.log('join', participantWithoutSuffix);
	console.log('Joined', chat.name)
	notification.reply(`Welcome @+${participantWithoutSuffix}${welcomeMessage}`);
  });
	

  function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
  }

client.initialize()
