import Ajv, { JSONSchemaType } from 'ajv';

const ajv = new Ajv({ coerceTypes: true });

type Returns = {
  valid: boolean;
  errors: string;
};

export const validate = <T>(schema: JSONSchemaType<T>, data: T): Returns => {
  const valid = ajv.validate(schema, data);

  return {
    valid,
    errors: ajv.errorsText()
  };
};

export const validateWithType = <T>(
  schema: JSONSchemaType<T>,
  data: unknown
): data is T => {
  const { valid } = validate<T>(schema, data as T);

  return valid;
};
