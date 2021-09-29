class FMCMessagesHolder {
	/**
	 * Return all messages
	 * @returns {[FMCMessage]}
	 */
	get messages() {
		return this._messages;
	}

	/**
	 * Return number of stored messages
	 * @returns {number}
	 */
	get numberOfMessages() {
		return this._messages.length;
	}

	/**
	 * Constructor
	 */
	constructor() {
		this._messages = [];
	}

	/**
	 * Push message into messages array
	 * @param {FMCMessage} message
	 */
	push(message) {
		this._messages.push(message);
	}

	/**
	 * Alias of push(message) function
	 * @param  {FMCMessage} message
	 */
	add(message) {
		this.push(message);
	}

	/**
	 * Alias of push(message) function
	 * @param  {FMCMessage} message
	 */
	store(message) {
		this.push(message);
	}

	/**
	 * Removes the last message and returns that message
	 * @returns {FMCMessage}
	 */
	pop(){
		return this._messages.pop();
	}

	/**
	 * Purge all messages
	 */
	purge() {
		this._messages = [];
	}
}

class FMCMessage {
	/**
	 * Title of message
	 * @returns {String}
	 */
	get title() {
		return this._title;
	}

	/**
	 * Help window text
	 * @returns {String}
	 */
	get text() {
		return this._text;
	}

	/**
	 * Message priority
	 * @returns {Number}
	 */
	get priority() {
		return this._priority;
	}

	/**
	 * Constructor
	 * @param {String} title
	 * @param {String} text
	 * @param {Number} priority
	 */
	constructor(title, text, priority = 1000) {
		this._title = title;
		this._text = text;
		this._priority = priority;
	}
}