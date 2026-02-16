import { z } from "zod";

// ── User Profile ──────────────────────────────────────────────
export const UserRoleSchema = z.enum(["guest", "player", "ambassador", "scientist", "admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserProfileSchema = z.object({
    id: z.string(),
    username: z.string().nullable(),
    avatar_url: z.string().nullable(),
    email: z.string().nullable(),
    role: UserRoleSchema,
    level: z.number().int().min(1).max(50),
    xp: z.number().int().min(0),
    reputation: z.number().int().min(0),
    streak_days: z.number().int().min(0),
    streak_freezes: z.number().int().min(0),
    last_check_in: z.string().nullable(),
    total_sightings: z.number().int().min(0),
    total_missions: z.number().int().min(0),
    assigned_regions: z.string().nullable(),
    notifications_enabled: z.number().int(),
    leaderboard_visible: z.number().int(),
    theme: z.string(),
    region: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    is_anonymous: z.number().int().optional().default(0),
    created_at: z.string(),
    last_active: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ── Sighting ──────────────────────────────────────────────────
export const SightingTypeSchema = z.enum(["garbage", "floating", "wildlife", "coral"]);
export type SightingType = z.infer<typeof SightingTypeSchema>;

export const SightingStatusSchema = z.enum(["pending", "approved", "flagged", "removed"]);

export const CreateSightingSchema = z.object({
    type: SightingTypeSchema,
    subcategory: z.string().min(1),
    description: z.string().min(1).max(500),
    severity: z.number().int().min(1).max(5),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
    bleach_percent: z.number().min(0).max(100).optional(),
    water_temp: z.number().optional(),
    depth: z.number().min(0).optional(),
    image_key: z.string().optional(),
    ai_analysis: z.string().optional(),
});

export type CreateSighting = z.infer<typeof CreateSightingSchema>;

export const SightingSchema = z.object({
    id: z.number(),
    user_id: z.string(),
    type: SightingTypeSchema,
    subcategory: z.string(),
    description: z.string(),
    severity: z.number(),
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().nullable(),
    image_key: z.string().nullable(),
    bleach_percent: z.number().nullable(),
    water_temp: z.number().nullable(),
    depth: z.number().nullable(),
    mission_id: z.number().nullable(),
    validated: z.number(),
    validation_count: z.number(),
    status: SightingStatusSchema,
    flag_reason: z.string().nullable(),
    ai_analysis: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    user_name: z.string().optional(),
});

export type Sighting = z.infer<typeof SightingSchema>;

// ── Badge ─────────────────────────────────────────────────────
export const BadgeCategorySchema = z.enum(["milestone", "mission", "streak", "specialty", "community", "seasonal"]);
export const BadgeRaritySchema = z.enum(["common", "uncommon", "rare", "epic", "legendary"]);

export const BadgeSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    category: BadgeCategorySchema,
    rarity: BadgeRaritySchema,
    icon: z.string(),
    requirement_type: z.string(),
    requirement_value: z.number(),
    is_hidden: z.number(),
    created_at: z.string(),
});

export type Badge = z.infer<typeof BadgeSchema>;

export const UserBadgeSchema = z.object({
    id: z.number(),
    user_id: z.string(),
    badge_id: z.number(),
    earned_at: z.string(),
    // Joined fields
    name: z.string().optional(),
    description: z.string().optional(),
    category: BadgeCategorySchema.optional(),
    rarity: BadgeRaritySchema.optional(),
    icon: z.string().optional(),
});

export type UserBadge = z.infer<typeof UserBadgeSchema>;

// ── Activity Log ──────────────────────────────────────────────
export const ActivityLogSchema = z.object({
    id: z.number(),
    user_id: z.string(),
    type: z.string(),
    description: z.string(),
    xp_earned: z.number(),
    metadata: z.string().nullable(),
    created_at: z.string(),
});

export type ActivityLog = z.infer<typeof ActivityLogSchema>;

// ── XP Calculation Helpers ────────────────────────────────────
export function calculateLevel(xp: number): number {
    let level = 1;
    let remaining = xp;

    // Level 1-10: 100 XP per level
    for (let i = 1; i <= 10 && remaining >= 100; i++) {
        remaining -= 100;
        level = i + 1;
    }

    // Level 11-25: 200 XP per level
    for (let i = 11; i <= 25 && remaining >= 200; i++) {
        remaining -= 200;
        level = i + 1;
    }

    // Level 26-50: 500 XP per level
    for (let i = 26; i <= 50 && remaining >= 500; i++) {
        remaining -= 500;
        level = i + 1;
    }

    return Math.min(level, 50);
}

export function xpForNextLevel(currentLevel: number): number {
    if (currentLevel < 10) return 100;
    if (currentLevel < 25) return 200;
    return 500;
}

export function xpProgressInLevel(xp: number, level: number): { current: number; required: number } {
    let consumed = 0;

    // XP consumed for levels 1-10
    for (let i = 1; i < Math.min(level, 11); i++) {
        consumed += 100;
    }
    // XP consumed for levels 11-25
    for (let i = 11; i < Math.min(level, 26); i++) {
        consumed += 200;
    }
    // XP consumed for levels 26-50
    for (let i = 26; i < Math.min(level, 51); i++) {
        consumed += 500;
    }
    const currentInLevel = xp - consumed;
    const required = xpForNextLevel(level);
    return { current: currentInLevel, required };
}

// ── Missions ──────────────────────────────────────────────────
export const MissionStatusSchema = z.enum(["upcoming", "active", "completed", "cancelled"]);
export type MissionStatus = z.infer<typeof MissionStatusSchema>;

export const MissionDifficultySchema = z.number().int().min(1).max(5);

export const MissionSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    location_name: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    start_time: z.string(),
    end_time: z.string(),
    organizer_id: z.string(),
    difficulty: MissionDifficultySchema,
    max_participants: z.number().nullable(),
    status: MissionStatusSchema,
    image_url: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Mission = z.infer<typeof MissionSchema>; // Added Mission type

export const CreateMissionSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    location_name: z.string().min(3).max(100),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    difficulty: MissionDifficultySchema,
    max_participants: z.number().int().min(1).optional(),
    image_url: z.string().url().optional(),
});

export type CreateMission = z.infer<typeof CreateMissionSchema>;

export const MissionParticipantStatusSchema = z.enum(["rsvp", "checked_in", "cancelled"]);
export type MissionParticipantStatus = z.infer<typeof MissionParticipantStatusSchema>;

export const MissionParticipantSchema = z.object({
    mission_id: z.number(),
    user_id: z.string(),
    status: MissionParticipantStatusSchema,
    checked_in_at: z.string().nullable(),
    xp_awarded: z.number(),
    created_at: z.string(),
    // Join fields
    username: z.string().optional(),
    avatar_url: z.string().nullable().optional(),
});

export type MissionParticipant = z.infer<typeof MissionParticipantSchema>;

export const MissionChatMessageSchema = z.object({
    id: z.number(),
    mission_id: z.number(),
    user_id: z.string(),
    message: z.string(),
    created_at: z.string(),
    // Join fields
    username: z.string().optional(),
    avatar_url: z.string().nullable().optional(),
});

export type MissionChatMessage = z.infer<typeof MissionChatMessageSchema>;

export const MissionImpactReportSchema = z.object({
    mission_id: z.number(),
    total_trash_weight: z.number().min(0),
    trash_bags_count: z.number().int().min(0),
    participants_count: z.number().int().min(0),
    duration_minutes: z.number().int().min(0),
    notes: z.string().nullable(),
    created_at: z.string(),
});

export type MissionImpactReport = z.infer<typeof MissionImpactReportSchema>;

export const CreateImpactReportSchema = z.object({
    total_trash_weight: z.number().min(0),
    trash_bags_count: z.number().int().min(0),
    participants_count: z.number().int().min(0),
    duration_minutes: z.number().int().min(0),
    notes: z.string().optional(),
});

export type CreateImpactReport = z.infer<typeof CreateImpactReportSchema>;

