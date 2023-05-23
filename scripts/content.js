console.log("Initiated Content Script")

// Declare new function
const insert = (content) => {
	// Find Calmly editor input section
	const elements = document.getElementsByClassName('droid');
	if (elements.length === 0) {
		return;
	}

	const editor = elements[0];

	// Grab the first p tag so we can replace it with our injection
	const pToRemove = editor.childNodes;
	pToRemove.forEach(p => p.remove())

	const generatedContent = content.split('\n');

	// Wrap in p tags
	generatedContent.forEach((content) => {
		const p = document.createElement('p');

		if (content === '') {
			const br = document.createElement('br');
			p.appendChild(br);
		} else {
			p.textContent = content;
		}

		// Insert into HTML one at a time
		editor.appendChild(p);
	});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.message === 'inject') {
		const { content } = request;
		console.log(content);
		// Call this insert function
		const result = insert(content);

		// If something went wrong, send a failed status
		if (!result) {
			sendResponse({ status: 'failed' });
		}

		sendResponse({ status: 'success' });
	} else sendResponse({ status: 'failed' });
});