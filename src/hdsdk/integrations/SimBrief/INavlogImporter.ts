import {HDNavlogInfo} from './HDNavlog/HDNavlogInfo';
import {HDFix} from './HDNavlog/HDFix';
import {HDOrigin} from './HDNavlog/HDOrigin';
import {HDDestination} from './HDNavlog/HDDestination';
import {HDFuel} from './HDNavlog/HDFuel';
import {HDWeights} from './HDNavlog/HDWeights';

export interface INavlogImporter {
	execute();

	getInfo(): HDNavlogInfo;

	getFixes(): HDFix[];

	getOrigin(): HDOrigin;

	getDestination(): HDDestination;

	getFuel(): HDFuel;

	getWeights(): HDWeights;

}