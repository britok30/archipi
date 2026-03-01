import shortid from 'shortid';

export class IDBroker {
  static acquireID(): string {
    return shortid.generate();
  }
}

export default IDBroker;
