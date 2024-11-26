export function parsePayloadSchema(schema: unknown): Record<string, unknown> {
  if (schema && typeof schema === 'string') {
    try {
      return JSON.parse(schema);
    } catch (error) {
      throw new Error('Invalid JSON string provided for payload schema');
    }
  }

  if (schema && typeof schema === 'object') {
    return schema as Record<string, unknown>;
  }

  throw new Error('Payload schema must be either a valid JSON string or an object');
}
