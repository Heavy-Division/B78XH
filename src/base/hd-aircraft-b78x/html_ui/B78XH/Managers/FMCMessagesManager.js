class FMCMessagesManager {

	/**
	 * Returns number of FMC messages
	 * @returns {number}
	 */
	get numberOfMessages() {
		return this._dataHolder.numberOfMessages;
	}

	get lastMessage(){
		return this._dataHolder.messages[this._dataHolder.messages.length - 1];
	}

	constructor() {
		this._dataHolder = new FMCMessagesHolder();
	}

	/**
	 * Add new FMC message
	 * @param {FMCMessage} message
	 */
	addMessage(message){
		this._dataHolder.push(message)
	}

	/**
	 * Creates and returns new FMCMessage
	 * @param {String} title
	 * @param {String} text
	 * @param {Number} priority
	 */
	static createMessage(title, text, priority = 1000) {
		return new FMCMessage(title, text, priority)
	}

	/**
	 * Creates and shows FMCMessage
	 * @param {String} title
	 * @param {String} text
	 * @param {Number} priority
	 */
	showMessage(title, text, priority = 1000){
		this.addMessage(new FMCMessage(title, text, priority));
	}

	/**
	 * Removes last message
	 */
	removeLastMessage(){
		this._dataHolder.pop();
	}
}