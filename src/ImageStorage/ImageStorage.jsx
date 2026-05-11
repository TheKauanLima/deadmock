import {del, get, keys, set} from 'idb-keyval';
import {createContext} from 'preact';

const ImageStorageContext = createContext(null);

/** @typedef {'portrait' | 'icon'} ImageStorageType */
/** @typedef {{type: ImageStorageType, file: Blob, key?: string, timestamp?: number}} ImageStorageRecord */

/**
 * @param {Blob} file
 * @returns {Promise<string>}
 */
const convertToDataUrl = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
};

class ImageCache {
  /** @type {Record<string, Promise<ImageStorageRecord>>} */
  data;

  constructor() {
    this.data = {};
  }

  /**
   * @param {ImageStorageRecord} obj
   * @returns {Promise<string>}
   */
  store(obj) {
    obj.key = crypto.randomUUID();
    obj.timestamp = Date.now();
    this.data[obj.key] = Promise.resolve(obj);
    return set(obj.key, obj).then(() => obj.key);
  }

  /**
   * @param {string} key
   * @returns {Promise<ImageStorageRecord>}
   */
  retrieve(key) {
    if (this.data[key]) {
      return this.data[key];
    }
    return get(key).then((obj) => {
      if (!obj) {
        throw new Error(`file data not found for key: ${key}`);
      }
      return obj;
    });
  }

  remove(key) {
    return del(key).then(() => delete this.data[key]);
  }

  list() {
    return keys();
  }
}

// Provides a view of a subset of the cache, files of the given 'type' (i.e.
// icon or portrait images).
class Substorage {
  /** @type {ImageStorageType} */
  _type;
  /** @type {ImageCache} */
  _cache;

  /**
   * @param {ImageStorageType} type
   * @param {ImageCache} cache
   */
  constructor(type, cache) {
    this._type = type;
    this._cache = cache;
  }

  /**
   * @param {Blob} file
   * @returns {Promise<string>}
   */
  store(file) {
    return this._cache.store({type: this._type, file});
  }

  /**
   * @param {string} id
   * @returns {Promise<string>}
   */
  retrieve(id) {
    return this._cache.retrieve(id).then((obj) => {
      if (obj.type !== this._type) {
        throw new Error(`expected file of type ${this._type} but found ${obj.type}`);
      }
      return convertToDataUrl(obj.file);
    });
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  remove(id) {
    return this._cache.remove(id);
  }

  /**
   * @returns {Promise<string[]>}
   */
  list() {
    return this._cache.list().then((ids) => {
      return Promise.all(ids.map((id) => this._cache.retrieve(id))).then((objs) => {
        return ids.filter((id, i) => objs[i].type === this._type);
      });
    });
  }
}

class ImageStorage {
  constructor() {
    this._cache = new ImageCache();
    this.portrait = new Substorage('portrait', this._cache);
    this.icon = new Substorage('icon', this._cache);
  }
}

export {ImageStorage, ImageStorageContext, convertToDataUrl};
