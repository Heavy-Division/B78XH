Include.addScript("/JS/dataStorage.js");

const HeavyDataStorage = {};

HeavyDataStorage.storagePrefix = 'HEAVY_B78XH_';

HeavyDataStorage.get = function (_key, _default) {
	return GetStoredData(HeavyDataStorage.storagePrefix + _key) || _default || false;
};

HeavyDataStorage.load = function (_key, _default) {
	return this.get(_key, _default);
};

HeavyDataStorage.set = function (_key, _data) {
	SetStoredData(HeavyDataStorage.storagePrefix + _key, _data);
};

HeavyDataStorage.store = function (_key, _data) {
	this.set(_key, _data);
};

HeavyDataStorage.delete = function (_key) {
	DeleteStoredData(HeavyDataStorage.storagePrefix + _key);
};

HeavyDataStorage.remove = function (_key) {
	this.delete(_key);
};

HeavyDataStorage.search = function (_key, _printLog = false) {
	try {
		var Storage = GetDataStorage();
		if (Storage) {
			var values = Storage.searchData(_key);
			if(_printLog){
				for (var i = 0; i < values.length; i++) {
					console.log(i + ' : ' + values[i].key + ' : ' + values[i].data);
				}
			}
			return values;
		}
	}
	catch (error) {
		return null;
	}
	return null;
};

HeavyDataStorage.find = function (_key, _printLog = false) {
	return this.search(_key, _printLog);
};