export declare class HeavyDataStorage {
    /**
     * Data storage KEY prefix
     * @type {string}
     * @private
     */
    private static storagePrefix;
    /**
     * Loads data from data storage
     * @param {string} _key
     * @param {string | number | boolean | null} _default
     * @returns {string | number | boolean}
     */
    static get(_key: string, _default?: string | number | boolean | null): string | number | boolean;
    /**
     * Loads data from data storage (get alias)
     * @param {string} _key
     * @param {string | number | boolean | null} _default
     * @returns {string | number | boolean}
     */
    static load(_key: string, _default?: string | number | boolean | null): string | number | boolean;
    /**
     * Stores data to data storage
     * @param {string} _key
     * @param {string | number | boolean} _data
     */
    static set(_key: string, _data: string | number | boolean): void;
    /**
     * Stores data to data storage (set alias)
     * @param {string} _key
     * @param {string | number | boolean} _data
     */
    static store(_key: string, _data: string | number | boolean): void;
    /**
     * Removes data from data storage
     * @param {string} _key
     */
    static delete(_key: string): void;
    /**
     * Removes data from data storage (delete alias)
     * @param {string} _key
     */
    static remove(_key: string): void;
    /**
     * Finds data in data storage
     * @param {string} _key
     * @param {boolean} _printLog
     * @returns {any}
     */
    static search(_key: string, _printLog?: boolean): any;
    /**
     * Finds data in data storage (search alias)
     * @param {string} _key
     * @param {boolean} _printLog
     * @returns {any}
     */
    static find(_key: string, _printLog?: boolean): any;
}
