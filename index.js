const saveKey = () => {
	const input = document.getElementById("key_input");

	if (input) {
		const { value } = input

		//  Encode String
		const encodedString = btoa(value);

		// Save to Chromium Local Storage
		chrome.storage.local.set({ 'openai-key': encodedString }, () => {
			document.getElementById('key_needed').style.display = 'none'
			document.getElementById('key_entered').style.display = 'block'
		})
	}
}

const changeKey = () => {
	document.getElementById('key_needed').style.display = 'block';
	document.getElementById('key_entered').style.display = 'none';
};

const checkForKey = () => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(['openai-key'], (result) => {
			resolve(result['openai-key']);
		});
	});
};

document.getElementById('save_key_button').addEventListener('click', saveKey);
document
	.getElementById('change_key_button')
	.addEventListener('click', changeKey);

// Check for key in local storage
checkForKey().then((response) => {
	if (response) {
		document.getElementById('key_needed').style.display = 'none';
		document.getElementById('key_entered').style.display = 'block';
	}
});