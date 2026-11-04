// Strips MongoDB operator keys starting with '$' or containing '.' from request body and params
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
      } else {
        value[key] = clean(value[key]);
      }
    }
  }
  return value;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) clean(req.body);
  if (req.params) clean(req.params);
  next();
};

module.exports = sanitizeInput;
