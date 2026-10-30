const { z } = require('zod');

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const slug = z.string().trim().min(1).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const schemas = {
  register: z.object({ name: z.string().trim().min(2).max(100), email, password: z.string().min(8).max(128) }),
  login: z.object({ email, password: z.string().min(1).max(128) }),
  gameQuery: z.object({
    q: z.string().trim().max(120).optional(),
    category: z.string().trim().max(70).optional(),
    status: z.enum(['released', 'upcoming', 'delisted']).optional(),
    featured: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
    limit: z.coerce.number().int().min(1).max(100).default(100),
    offset: z.coerce.number().int().min(0).max(10000).default(0),
  }),
  gameSlug: z.object({ slug }),
  userGameSlug: z.object({ slug }),
  review: z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(2000).default('') }),
  contact: z.object({
    name: z.string().trim().min(2).max(100),
    email,
    subject: z.string().trim().min(3).max(160),
    message: z.string().trim().min(10).max(5000),
  }),
};

module.exports = { schemas };
