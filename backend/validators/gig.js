const { z, optional, rupees } = require('./common');

const milestoneInput = z.object({
  title: z.string().trim().min(1).max(100),
  amount: rupees,
  description: z.string().trim().max(1000).default(''),
  dueDate: optional(z.coerce.date())
}); // status client se NAHI aata

const createGigSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: optional(z.string().trim().max(5000)),
  category: optional(z.string().trim().max(60)),
  budget: optional(z.coerce.number().int().min(0).max(1000000)),
  skillsRequired: z.union([
    z.array(z.string().trim().min(1).max(40)).max(20),
    z.string().max(500)
  ]).optional(),
  locationType: z.enum(['remote', 'onsite', 'hybrid']).default('remote'),
  experienceLevel: z.enum(['Entry', 'Intermediate', 'Expert']).default('Intermediate'),
  duration: optional(z.string().trim().max(40)),
  deadline: optional(z.coerce.date()),
  coordinates: z.tuple([
    z.coerce.number().min(-180).max(180),
    z.coerce.number().min(-90).max(90)
  ]).optional(),
  address: optional(z.string().trim().max(200)),
  milestones: z.array(milestoneInput).max(20).default([]),
  documents: z.array(z.string().trim().max(500)).max(10).default([]),
  status: z.enum(['draft', 'open']).default('open')
}).superRefine((d, ctx) => {
  if (d.status === 'draft') return; // draft me kam checks
  const add = (path, message) =>
    ctx.addIssue({ code: 'custom', path: [path], message });
  if (!d.description || d.description.length < 10) {
    add('description', 'Minimum 10 characters');
  }
  if (!d.category) add('category', 'Please select a category');
  if (!d.budget) add('budget', 'Budget must be more than 0');
});

module.exports = { createGigSchema };
