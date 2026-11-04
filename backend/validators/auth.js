const { z } = require('./common');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  username: z.string().trim().min(3).max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and _')
    .optional(),
  email: z.string().trim().toLowerCase().max(254)
    .email('Please add a valid email'),
  password: z.string().min(12).max(128),
  role: z.enum(['client', 'freelancer']).default('freelancer')
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email(),
  password: z.string().min(1).max(128)
});

module.exports = { registerSchema, loginSchema };
