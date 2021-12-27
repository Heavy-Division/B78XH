import {MCPDirector} from '../directors/MCPDirector';
import {Queue} from '../../hdsdk';
import {AutomaticAutopilotDirector} from '../directors/AutomaticAutopilotDirector';
import {FMAResolver} from './FMAResolver';

export class AutopilotModeResolver {
	public get armedVerticalMode() {
		return this._armedVerticalMode;
	}

	public get armedLateralMode() {
		return this._armedLateralMode;
	}

	public get armedThrustMode() {
		return this._armedThrustMode;
	}

	public get armedSpeedMode() {
		return this._armedSpeedMode;
	}

	public get activatedVerticalMode() {
		return this._activatedVerticalMode;
	}

	public get activatedLateralMode() {
		return this._activatedLateralMode;
	}

	public get activatedThrustMode() {
		return this._activatedThrustMode;
	}

	public get activatedSpeedMode() {
		return this._activatedSpeedMode;
	}

	private _armedVerticalMode;
	private _armedLateralMode;
	private _armedThrustMode;
	private _armedSpeedMode;

	private _activatedVerticalMode;
	private _activatedLateralMode;
	private _activatedThrustMode;
	private _activatedSpeedMode;

	/**
	 * TODO: This is temporary fix. Should be event based.
	 * @type {MCPDirector}
	 */
	public mcpDirector: MCPDirector;
	private automaticDirector: AutomaticAutopilotDirector;
	private fmaResolver: FMAResolver;

	constructor(mcpDirector: MCPDirector, automaticDirector: AutomaticAutopilotDirector, fmaResolver: FMAResolver) {
		this.mcpDirector = mcpDirector;
		this.automaticDirector = automaticDirector;
		this.fmaResolver = fmaResolver;
	}

	private resolveMode() {
		this.updateFMA();
	}

	public update() {
		this.mcpDirector.processPending();
		this.automaticDirector.update();
		this.propagateMCPModes();
		this.resolveMode();
	}

	private propagateMCPModes() {
		this._activatedLateralMode = this.mcpDirector.activatedLateralMode;
		this._activatedVerticalMode = this.mcpDirector.activatedVerticalMode;
		this._activatedSpeedMode = this.mcpDirector.activatedSpeedMode;
		this._activatedThrustMode = this.mcpDirector.activatedThrustMode;

		this._armedLateralMode = this.mcpDirector.armedLateralMode;
		this._armedVerticalMode = this.mcpDirector.armedVerticalMode;
		this._armedSpeedMode = this.mcpDirector.armedSpeedMode;
		this._armedThrustMode = this.mcpDirector.armedThrustMode;
	}

	private updateFMA() {
		this.fmaResolver.update();
	}
}

export enum AutopilotModeType {
	LATERAL,
	VERTICAL,
	THRUST,
	SPEED
}
