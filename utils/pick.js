// Copy only the allowed keys that are present in the object
module.exports = (obj = {}, keys = []) => {
  const out = {};
  for (const key of keys) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
};
