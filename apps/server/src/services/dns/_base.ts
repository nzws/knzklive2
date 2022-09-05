export abstract class DNS {
  abstract createARecord(id: string, address: string): Promise<void>;
  abstract removeARecord(id: string): Promise<void>;
  abstract getARecord(id: string): Promise<string | null>;
  abstract listRecords(): Promise<Record<string, string>>;

  private getDomain(id: string) {
    return `${id}.don.nzws.me`;
  }
}
