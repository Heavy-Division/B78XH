import {Handler} from './Handler';
import {Level} from '../levels/level';
//import * as io from 'socket.io-client';

import {io} from '../../node_modules/socket.io-client';

export class SocketIOHandler implements Handler {
	private socket: any;

	constructor(server: any, port: number) {
		this.socket = io('http://' + server + ':' + port + '/', {
			auth: {
				token: 'msfs'
			},
			transports: ['websocket']
		});
	}

	public log(message: string, level: Level): void {
		switch (level) {
			case Level.none:
			case Level.debug:
			case Level.info:
			case Level.warning:
			case Level.error:
			case Level.fatal:
				this.socket.emit('log', JSON.stringify({message: message, level: Level[level]}));
				break;

		}
	}

}
