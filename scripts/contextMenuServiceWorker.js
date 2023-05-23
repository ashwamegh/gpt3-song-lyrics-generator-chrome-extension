const sendMessage = (content) => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const activeTab = tabs[0].id;

		chrome.tabs.sendMessage(
			activeTab,
			{ message: 'inject', content },
			{},
			(response) => {
				if (!response || response.status === 'failed') {
					console.log('injection failed.');
				}
			}
		);
	});
};

// Function to get + decode API key
const getKey = () => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(['openai-key'], (result) => {
			if (result['openai-key']) {
				const decodedKey = atob(result['openai-key']);
				resolve(decodedKey);
			}
			else reject(null)
		});
	});
}

const generate = async (prompt) => {
	// Get your API key from storage
	const key = await getKey();
	const url = 'https://api.openai.com/v1/completions';

	const completionResponse = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify({
			model: 'text-davinci-003',
			prompt: prompt,
			max_tokens: 1250,
			temperature: 0.7,
		}),
	});

	// Select the top choice and send back
	const completion = await completionResponse.json();
	return completion.choices.pop();
}

const generateCompletionAction = async (info) => {
	if (info) {
		try {
			// Send mesage with generating text (this will be like a loading indicator)
			sendMessage('generating...');

			const { selectionText } = info;
			const basePromptPrefix = `
		Write me a detailed background story for a song with the context below.
		
		Song Context:`;
			const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);

			sendMessage('wait for a moment...');


			// Add your second prompt here
			const secondPromptBrief = "Take the song context and background story of the song below and generate a song title and song lyrics written in the style of Arijit Singh. And add deep meaningful words in the lyrics."

			const secondPromptMeta = `Song Context: ${selectionText}\n\n` + `Song Background Story: ${baseCompletion.text.trim()}\n\n` + `Song Title:`

			const secondPrompt = `${secondPromptBrief}\n\n${secondPromptMeta}`

			// Call your second prompt
			const secondPromptCompletion = await generate(secondPrompt);

			sendMessage("almost done...");

			setTimeout(() => {
				// Send the output when we're all done
				sendMessage(secondPromptMeta + secondPromptCompletion.text);
			}, 1000)

		} catch (error) {
			console.log(error);

			// Add this here as well to see if we run into any errors!
			sendMessage(error.toString());
		}
	}
}

// Add this in scripts/contextMenuServiceWorker.js
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'context-run',
		title: 'Generate song lyrics',
		contexts: ['selection'],
	});
});

// Add listener
chrome.contextMenus.onClicked.addListener(generateCompletionAction);