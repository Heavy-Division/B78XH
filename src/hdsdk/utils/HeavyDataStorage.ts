export class HeavyDataStorage {
	/**
	 * Data storage KEY prefix
	 * @type {string}
	 * @private
	 */
	private static storagePrefix: string = 'HEAVY_B78XH_';

	/**
	 * Loads data from data storage
	 * @param {string} _key
	 * @param {string | number | boolean | null} _default
	 * @returns {string | number | boolean}
	 */
	public static get(_key: string, _default: string | number | boolean | null = null): string | number | boolean {
		return GetStoredData(this.storagePrefix + _key) || _default || false;
	}

	/**
	 * Loads data from data storage (get alias)
	 * @param {string} _key
	 * @param {string | number | boolean | null} _default
	 * @returns {string | number | boolean}
	 */
	public static load(_key: string, _default: string | number | boolean | null = null): string | number | boolean {
		return this.get(_key, _default);
	}

	/**
	 * Stores data to data storage
	 * @param {string} _key
	 * @param {string | number | boolean} _data
	 */
	public static set(_key: string, _data: string | number | boolean): void {
		SetStoredData(this.storagePrefix + _key, _data);
	}

	/**
	 * Stores data to data storage (set alias)
	 * @param {string} _key
	 * @param {string | number | boolean} _data
	 */
	public static store(_key: string, _data: string | number | boolean): void {
		this.set(_key, _data);
	}

	/**
	 * Removes data from data storage
	 * @param {string} _key
	 */
	public static delete(_key: string): void {
		DeleteStoredData(this.storagePrefix + _key);
	}

	/**
	 * Removes data from data storage (delete alias)
	 * @param {string} _key
	 */
	public static remove(_key: string): void {
		this.delete(_key);
	}

	/**
	 * Finds data in data storage
	 * @param {string} _key
	 * @param {boolean} _printLog
	 * @returns {any}
	 */
	public static search(_key: string, _printLog: boolean = false): any {
		try {
			let Storage = GetDataStorage();
			if (Storage) {
				let values = Storage.searchData(_key);
				if (_printLog) {
					for (let i = 0; i < values.length; i++) {
						console.log(i + ' : ' + values[i].key + ' : ' + values[i].data);
					}
				}
				return values;
			}
		} catch (error) {
			return null;
		}
		return null;
	}

	/**
	 * Finds data in data storage (search alias)
	 * @param {string} _key
	 * @param {boolean} _printLog
	 * @returns {any}
	 */
	public static find(_key: string, _printLog: boolean = false): any {
		return this.search(_key, _printLog);
	}
}