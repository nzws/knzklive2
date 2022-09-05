export abstract class Compute {
  abstract create(): Promise<void>;
  abstract remove(id: string): Promise<void>;
  abstract list(): Promise<string | null>;
}
