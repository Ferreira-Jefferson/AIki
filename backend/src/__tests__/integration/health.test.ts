import request from 'supertest';
import { app } from '../../index';

describe('Health Check Endpoint', () => {
  it('should return welcome message', async () => {
    const response = await request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      message: 'Welcome to AIki API'
    });
  });
}); 