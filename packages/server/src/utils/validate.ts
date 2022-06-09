import Ajv, { JSONSchemaType } from 'ajv';

const ajv = new Ajv();

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
