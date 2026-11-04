const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

// "" ya null aaye toh undefined maan lo
const optional = (schema) => z.preprocess(
  (v) => (v === '' || v === null ? undefined : v),
  schema.optional()
);

// Paisa whole rupees me
const rupees = z.coerce.number().int('Whole rupees only').positive().max(1000000);

const httpUrl = z.string().trim().max(500).refine(
  (u) => /^https?:\/\//i.test(u),
  'Must start with http:// or https://'
);

module.exports = { z, objectId, optional, rupees, httpUrl };
