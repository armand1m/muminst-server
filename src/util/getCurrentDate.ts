/**
 * Returns the current date formatted as dd/mm/yyyy
 */
export const getCurrentDate = () =>
  new Date().toJSON().slice(0, 10).split('-').reverse().join('/');
