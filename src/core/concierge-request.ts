import { z } from 'zod';
import { ProposalRefSchema } from './partial';

export const ClientCapabilitiesSchema = z.object({
  supportsAdaptationDelta: z.boolean(),
  supportsMoodSnapshot: z.boolean(),
  supportsMemoryHint: z.boolean(),
});
export type ClientCapabilities = z.infer<typeof ClientCapabilitiesSchema>;

export const ConciergeRequestSchema = z.object({
  sessionId: z.string(), // anon_<uuid>
  turnId: z.string(),
  type: z.enum(['compose', 'refine']),
  input: z.object({
    rawInput: z.string().min(1),
    priorProposalRef: ProposalRefSchema.optional(),
    compareSet: z.array(z.string()).max(3).optional(),
  }),
  cancelPriorTurn: z.boolean().optional(),
  clientCapabilities: ClientCapabilitiesSchema,
});
export type ConciergeRequest = z.infer<typeof ConciergeRequestSchema>;
