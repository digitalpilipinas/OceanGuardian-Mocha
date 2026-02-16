import { Hono } from "hono";
import { authMiddleware } from "../middleware";
import { getTursoClient } from "../db";
import type { UserProfile } from "@/shared/types";
import { checkAndAwardBadges } from "./gamification";

const app = new Hono<{ Bindings: Env; Variables: { user: UserProfile | null } }>();

// Helper to get YYYY-MM-DD
const toDateString = (date: Date) => date.toISOString().split("T")[0];

// ── Daily Quiz Routes ─────────────────────────────────────────

// GET /api/learning/quiz/daily - Get 5 random questions for the day
app.get("/api/learning/quiz/daily", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);
    const todayStr = toDateString(new Date());

    // Check if user has already completed quiz today
    const statsResult = await db.execute({
        sql: "SELECT last_quiz_date FROM user_quiz_stats WHERE user_id = ?",
        args: [user.id],
    });

    const alreadyCompleted = statsResult.rows.length > 0 && statsResult.rows[0].last_quiz_date === todayStr;

    // Fetch 5 random questions
    // In a real app, might want to seed this by date to ensure same questions for everyone
    const questionsResult = await db.execute({
        sql: "SELECT id, question, options, category, difficulty FROM quiz_questions ORDER BY RANDOM() LIMIT 5",
        args: [],
    });

    const questions = questionsResult.rows.map(q => ({
        ...q,
        options: JSON.parse(q.options as string),
    }));

    return c.json({
        questions,
        alreadyCompleted,
    });
});

// POST /api/learning/quiz/submit - Submit quiz answers
app.post("/api/learning/quiz/submit", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { answers } = await c.req.json<{ answers: { questionId: number, selectedOptionIndex: number }[] }>();
    const db = getTursoClient(c.env);
    const todayStr = toDateString(new Date());

    // 1. Calculate Score
    let correctCount = 0;
    let earnedXp = 0;
    const results = [];

    for (const answer of answers) {
        const qResult = await db.execute({
            sql: "SELECT correct_answer, explanation FROM quiz_questions WHERE id = ?",
            args: [answer.questionId],
        });

        if (qResult.rows.length === 0) continue;
        const question = qResult.rows[0];
        const isCorrect = Number(question.correct_answer) === answer.selectedOptionIndex;

        if (isCorrect) {
            correctCount++;
            earnedXp += 5; // 5 XP per correct answer
        }

        results.push({
            questionId: answer.questionId,
            isCorrect,
            correctAnswer: Number(question.correct_answer),
            explanation: question.explanation,
        });
    }

    // 2. Update Quiz Stats & Streak
    // Fetch stats again to be safe
    const statsResult = await db.execute({
        sql: "SELECT streak_days, last_quiz_date FROM user_quiz_stats WHERE user_id = ?",
        args: [user.id],
    });

    let streak = 0;
    let lastQuizDate = null;
    let streakBonus = 0;

    if (statsResult.rows.length > 0) {
        streak = Number(statsResult.rows[0].streak_days);
        lastQuizDate = statsResult.rows[0].last_quiz_date;
    }

    let isFirstTimeToday = true;
    if (lastQuizDate === todayStr) {
        isFirstTimeToday = false;
        earnedXp = 0; // No XP for repeats
    } else {
        // Calculate Streak
        if (lastQuizDate) {
            const lastDate = new Date(lastQuizDate as string);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1; // 1 day diff is ideal

            if (diffDays === 1) {
                streak++;
            } else {
                streak = 1; // Reset or start new
            }
        } else {
            streak = 1;
        }

        // Streak Bonus (every 7 days)
        if (streak > 0 && streak % 7 === 0) {
            streakBonus = 50;
            earnedXp += streakBonus;
        }
    }

    // 3. Persist Updates
    if (isFirstTimeToday) {
        await db.executeMultiple(`
            INSERT INTO user_quiz_stats (user_id, streak_days, last_quiz_date, total_xp_earned, quizzes_completed, perfect_scores)
            VALUES ('${user.id}', ${streak}, '${todayStr}', ${earnedXp}, 1, ${correctCount === 5 ? 1 : 0})
            ON CONFLICT(user_id) DO UPDATE SET
                streak_days = ${streak},
                last_quiz_date = '${todayStr}',
                total_xp_earned = total_xp_earned + ${earnedXp},
                quizzes_completed = quizzes_completed + 1,
                perfect_scores = perfect_scores + ${correctCount === 5 ? 1 : 0};
            
            UPDATE user_profiles SET xp = xp + ${earnedXp} WHERE id = '${user.id}';
            
            INSERT INTO activity_log (user_id, type, description, xp_earned, metadata)
            VALUES ('${user.id}', 'quiz', 'Completed Daily Quiz', ${earnedXp}, '${JSON.stringify({ correct: correctCount, bonus: streakBonus })}');
        `);
    }

    // 4. Check Badges
    const newBadges = await checkAndAwardBadges(db, user.id);

    return c.json({
        correctCount,
        totalQuestions: answers.length,
        earnedXp,
        streak,
        streakBonus,
        results,
        newBadges,
    });
});

// ── User Quiz Stats ───────────────────────────────────────────
app.get("/api/learning/stats", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);
    const result = await db.execute({
        sql: "SELECT * FROM user_quiz_stats WHERE user_id = ?",
        args: [user.id],
    });

    return c.json(result.rows[0] || { streak_days: 0, total_xp_earned: 0, quizzes_completed: 0 });
});

// ── Fact Library Routes ───────────────────────────────────────

app.get("/api/learning/facts", async (c) => {
    const db = getTursoClient(c.env);
    const { search, category } = c.req.query();

    let sql = "SELECT * FROM facts";
    const args: any[] = [];
    const conditions = [];

    if (search) {
        conditions.push("(content LIKE ? OR tags LIKE ?)");
        args.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
        conditions.push("category = ?");
        args.push(category);
    }

    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY RANDOM() LIMIT 20"; // Limit for performance

    const result = await db.execute({ sql, args });
    return c.json(result.rows);
});

// ── Lessons Routes ────────────────────────────────────────────

app.get("/api/learning/lessons", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);

    // Get all lessons
    const lessonsResult = await db.execute({ sql: "SELECT id, title, slug, description, unlock_level, xp_reward, cover_image FROM lessons ORDER BY unlock_level ASC", args: [] });

    // Get user progress
    const progressResult = await db.execute({
        sql: "SELECT lesson_id FROM user_lessons WHERE user_id = ?",
        args: [user.id]
    });
    const completedIds = new Set(progressResult.rows.map(r => Number(r.lesson_id)));

    // Get user level for locking
    const profileResult = await db.execute({
        sql: "SELECT level FROM user_profiles WHERE id = ?",
        args: [user.id]
    });
    const userLevel = Number(profileResult.rows[0]?.level || 1);

    const lessons = lessonsResult.rows.map(l => ({
        ...l,
        isCompleted: completedIds.has(Number(l.id)),
        isLocked: userLevel < Number(l.unlock_level),
    }));

    return c.json({ lessons });
});

app.get("/api/learning/lessons/:slug", authMiddleware, async (c) => {
    const split = c.req.path.split("/");
    const slug = split[split.length - 1]; // basic param extraction
    const db = getTursoClient(c.env);

    const result = await db.execute({
        sql: "SELECT * FROM lessons WHERE slug = ?",
        args: [slug],
    });

    if (result.rows.length === 0) return c.json({ error: "Lesson not found" }, 404);
    return c.json(result.rows[0]);
});

app.post("/api/learning/lessons/:id/complete", authMiddleware, async (c) => {
    const user = c.get("user");
    const split = c.req.path.split("/");
    const id = split[split.length - 2]; // extract ID

    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);

    // Verify lesson exists & reward
    const lessonResult = await db.execute({ sql: "SELECT xp_reward FROM lessons WHERE id = ?", args: [id] });
    if (lessonResult.rows.length === 0) return c.json({ error: "Lesson not found" }, 404);

    const xpReward = Number(lessonResult.rows[0].xp_reward);

    try {
        await db.executeMultiple(`
            INSERT INTO user_lessons (user_id, lesson_id, xp_awarded) VALUES ('${user.id}', ${id}, ${xpReward});
            UPDATE user_profiles SET xp = xp + ${xpReward} WHERE id = '${user.id}';
            INSERT INTO activity_log (user_id, type, description, xp_earned) 
            VALUES ('${user.id}', 'lesson', 'Completed Lesson', ${xpReward});
        `);

        const newBadges = await checkAndAwardBadges(db, user.id);

        return c.json({ success: true, xpEarned: xpReward, newBadges });
    } catch (e) {
        // Likely unique constraint violation if already completed
        return c.json({ success: false, message: "Already completed" });
    }
});

export default app;
