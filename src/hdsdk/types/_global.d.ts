/**
 * Returns data storage
 * @returns {any}
 * @constructor
 */
declare function GetDataStorage(): any;

/**
 * Gets data from data store
 * @param {string} _key
 * @returns {any}
 * @constructor
 */
declare function GetStoredData(_key: string): any;

/**
 * Sets data to data store
 * @param {string} _key
 * @param {string | number | boolean} _data
 * @returns {any}
 * @constructor
 */
declare function SetStoredData(_key: string, _data: string | number | boolean): any;

/**
 * Deletes data from data store
 * @param {string} _key
 * @returns {any}
 * @constructor
 */
declare function DeleteStoredData(_key: string): any;