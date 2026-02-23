const { validateSignup, validateUserCreate } = require('../../server/middleware/validate');

function createRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe('validate middleware', () => {
  it('accepts valid signup payload', () => {
    const req = {
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      }
    };
    const res = createRes();
    const next = jest.fn();

    validateSignup(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.email).toBe('test@example.com');
  });

  it('rejects weak admin-created user password', () => {
    const req = {
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
        role: 'admin'
      }
    };
    const res = createRes();
    const next = jest.fn();

    validateUserCreate(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.code).toBe('WEAK_PASSWORD');
  });
});
