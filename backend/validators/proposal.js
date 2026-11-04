const { z, objectId, rupees } = require('./common');

const createProposalSchema = z.object({
  gigId: objectId,
  coverLetter: z.string().trim().min(15).max(5000),
  bidAmount: rupees,
  estimatedTime: z.string().trim().min(1).max(60)
});

const proposalStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected'])
});

const idParams = z.object({ id: objectId });

module.exports = {
  createProposalSchema,
  proposalStatusSchema,
  idParams
};
