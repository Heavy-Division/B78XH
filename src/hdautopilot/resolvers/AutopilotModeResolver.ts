import {MCPDirector} from '../directors/MCPDirector';
import {Queue} from '../../hdsdk';
import {AutomaticAutopilotDirector} from '../directors/AutomaticAutopilotDirector';

export class AutopilotModeResolver {

	private _resolveQueue = new Queue();

	private _armedVerticalMode;
	private _armedLateralMode;
	private _armedThrustMode;
	private _armedSpeedMode;

	private _activatedVerticalMode;
	private _activatedLateralMode;
	private _activatedThrustMode;
	private _activatedSpeedMode;

	private mcpDirector: MCPDirector;
	private automaticDirector: AutomaticAutopilotDirector;

	constructor(mcpDirector: MCPDirector, automaticDirector: AutomaticAutopilotDirector) {
		this.mcpDirector = mcpDirector;
		this.automaticDirector = automaticDirector;
	}

	private resolveMode() {

	}
}

export enum AutopilotModeType {
	LATERAL,
	VERTICAL,
	THRUST,
	SPEED
}