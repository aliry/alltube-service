import request from 'supertest';
import app from '../app';

describe('App Test', () => {
  test('GET /random-url should return 404', (done) => {
    request(app).get('/reset').expect(404, done);
  });

  test('GET root route should return 200', (done) => {
    request(app).get('/').expect(200, done);
  });
});
