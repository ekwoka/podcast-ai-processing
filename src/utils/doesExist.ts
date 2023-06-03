import { access, constants } from 'fs';

export const doesExist = (filePath: string) =>
  new Promise((res) => access(filePath, constants.R_OK, (err) => res(!err)));
