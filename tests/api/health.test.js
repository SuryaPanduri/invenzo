let request;

try {
  request = require('supertest');
} catch (err) {
  request = null;
}

jest.mock('../../server/db', () => ({
  query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] })
}));

const app = require('../../server/app');

const describeIfSupertest = request ? describe : describe.skip;

describeIfSupertest('Health endpoints', () => {
  it('returns live status', async () => {
    const response = await request(app).get('/health/live');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns ready status', async () => {
    const response = await request(app).get('/health/ready');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
