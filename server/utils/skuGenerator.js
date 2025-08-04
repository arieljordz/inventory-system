
export const generateSKU = ({ name, category = '', variant = '', size = '' }) => {
  const slug = (text) =>
    text
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '-')     // replace spaces with dashes
      .replace(/[^A-Z0-9\-]/g, ''); // remove special characters

  const parts = [
    slug(category),
    slug(name.toString().slice(0, 5)), // get first 5 characters
    slug(variant),
    slug(size),
    Date.now().toString().slice(-5) // to help with uniqueness
  ].filter(Boolean); // remove empty strings

  return parts.join('-');
};
