import request from 'supertest';
import app from '../../index';

describe('Health Check Endpoint', () => {
  beforeAll(() => {
    // Caso o servidor precise de inicialização antes dos testes
  });

  it('should return welcome message', async () => {
    const response = await request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(typeof response.body.message).toBe('string');
    expect(response.body.message).toBe('Welcome to AIki API');
  });
});
