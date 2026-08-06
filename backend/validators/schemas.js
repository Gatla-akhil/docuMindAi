const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const chatQuestionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty').max(1000)
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional()
});

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  mimeType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});

const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = req.method === 'GET' ? req.query : req.body;
    schema.parse(dataToValidate);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
};

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  chatQuestionSchema,
  updateProfileSchema,
  searchSchema,
  validate
};
