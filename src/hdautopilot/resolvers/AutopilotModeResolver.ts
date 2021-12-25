import {MCPDirector} from '../directors/MCPDirector';
import {Queue} from '../../hdsdk';
import {AutomaticAutopilotDirector} from '../directors/AutomaticAutopilotDirector';
import {FMAResolver} from "./FMAResolver";

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
	private fmaResolver: FMAResolver;

	constructor(mcpDirector: MCPDirector, automaticDirector: AutomaticAutopilotDirector, fmaResolver: FMAResolver) {
		this.mcpDirector = mcpDirector;
		this.automaticDirector = automaticDirector;
		this.fmaResolver = fmaResolver
	}

	private resolveMode() {

	}

	private updateFMA(){
		this.fmaResolver.update();
	}
}

export enum AutopilotModeType {
	LATERAL,
	VERTICAL,
	THRUST,
	SPEED
}
