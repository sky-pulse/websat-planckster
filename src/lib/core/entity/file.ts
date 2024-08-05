import { z } from 'zod';

export const LocalFileSchema = z.object({
    type: z.literal('local'),
    path: z.string(),
});

export type LocalFile = z.infer<typeof LocalFileSchema>;

export const RemoteFileSchema = z.object({
    type: z.literal('remote'),
    provider: z.string(),
    path: z.string(),
});

export type RemoteFile = z.infer<typeof RemoteFileSchema>;

export const FileSchema = z.discriminatedUnion("type", [LocalFileSchema, RemoteFileSchema]);
