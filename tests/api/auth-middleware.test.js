const jwt = require('jsonwebtoken');
const auth = require('../../server/middleware/auth');

describe('auth middleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test_secret';
  });

  it('rejects when token is missing', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('normalizes role to lowercase on success', () => {
    const token = jwt.sign({ userId: 1, role: 'Admin' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user.role).toBe('admin');
    expect(next).toHaveBeenCalled();
  });
});
