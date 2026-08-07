// lib/pipeline/BaseProvider.js
// Wobl — Base class for content providers. TMDBProvider extends this.
// Defines the fetch() -> transform() contract every provider follows:
// fetch() pulls raw data from the external API, transform() converts it
// into rows matching the `items` table schema.

export class BaseProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Fetch raw data from the external API. Must be implemented by subclasses.
   * Returns whatever shape is convenient for that provider — transform()
   * is responsible for normalizing it into item rows.
   */
  async fetch() {
    throw new Error(`${this.name}: fetch() not implemented`);
  }

  /**
   * Convert raw fetched data into an array of objects matching the
   * `items` table schema. Must be implemented by subclasses.
   */
  transform(rawData) {
    throw new Error(`${this.name}: transform() not implemented`);
  }

  /**
   * Runs fetch() then transform() in sequence — the standard sync flow
   * a SyncEngine would call for any provider.
   */
  async run() {
    const raw = await this.fetch();
    return this.transform(raw);
  }
}
