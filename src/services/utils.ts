import * as queryString from 'query-string';

export function makeQuery(obj: object) {
  const ret = queryString.stringify(obj);
  return ret ? `?${ret}` : '';
}