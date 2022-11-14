import request from 'supertest';
import app from '../app';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

describe('App Test', () => {
  const headers = {
    'API-KEY': process.env.API_KEY
  };

  test('GET /random-url should return 404', (done) => {
    request(app).get('/reset').set(headers).expect(404, done);
  });

  test('GET root route should return 200', (done) => {
    request(app).get('/').set(headers).expect(200, done);
  });

  test('GET with no API_KEY return 401 ', (done) => {
    request(app).get('/').expect(401, done);
  });
});
