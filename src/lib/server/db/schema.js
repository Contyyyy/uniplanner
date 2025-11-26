import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	profilePicture: text('profile_picture'),
	hasSeenTour: integer('has_seen_tour', { mode: 'boolean' }).default(false),
	hasSeenScheduleTour: integer('has_seen_schedule_tour', { mode: 'boolean' }).default(false),
	hasSeenAssessmentsTour: integer('has_seen_assessments_tour', { mode: 'boolean' }).default(false),
	hasSeenProgressTour: integer('has_seen_progress_tour', { mode: 'boolean' }).default(false)
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const courses = sqliteTable('courses', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	name: text('name').notNull(),
	code: text('code').notNull(),
	color: text('color').notNull(),
	location: text('location'),
	dayOfWeek: text('day_of_week'),
	startTime: text('start_time'),
	endTime: text('end_time'),
	type: text('type').default('class'), // 'class' or 'activity'
	isPrivate: integer('is_private', { mode: 'boolean' }).default(false),
	isRecurring: integer('is_recurring', { mode: 'boolean' }).default(true),
	specificDate: integer('specific_date', { mode: 'timestamp' }), // For non-recurring items
	notes: text('notes')
});

export const tasks = sqliteTable('tasks', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	courseId: text('course_id').references(() => courses.id),
	title: text('title').notNull(),
	description: text('description'),
	dueDate: integer('due_date', { mode: 'timestamp' }),
	completed: integer('completed', { mode: 'boolean' }).default(false),
	isPrivate: integer('is_private', { mode: 'boolean' }).default(false)
});

export const assessments = sqliteTable('assessments', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	courseId: text('course_id').references(() => courses.id),
	title: text('title').notNull(),
	type: text('type').notNull(),
	date: integer('date', { mode: 'timestamp' }),
	location: text('location'),
	weight: integer('weight'),
	grade: integer('grade'),
	completed: integer('completed', { mode: 'boolean' }).default(false),
	isPrivate: integer('is_private', { mode: 'boolean' }).default(false)
});

export const friends = sqliteTable('friends', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	friendId: text('friend_id')
		.notNull()
		.references(() => user.id),
	status: text('status').notNull(), // 'pending', 'accepted'
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const attendance = sqliteTable('attendance', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	courseId: text('course_id')
		.notNull()
		.references(() => courses.id),
	date: integer('date', { mode: 'timestamp' }).notNull(),
	status: text('status').notNull() // 'present', 'absent'
});

export const studySessions = sqliteTable('study_sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	courseId: text('course_id').references(() => courses.id),
	startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
	duration: integer('duration').notNull() // in minutes
});

export const courseResources = sqliteTable('course_resources', {
	id: text('id').primaryKey(),
	courseId: text('course_id')
		.notNull()
		.references(() => courses.id),
	title: text('title').notNull(),
	url: text('url').notNull()
});

export const oauthAccounts = sqliteTable('oauth_accounts', {
	providerId: text('provider_id').notNull(),
	providerUserId: text('provider_user_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	pk: text('pk').primaryKey().$defaultFn(() => crypto.randomUUID())
});

export const notifications = sqliteTable('notifications', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	type: text('type').notNull(), // 'schedule_share'
	data: text('data', { mode: 'json' }), // JSON string
	read: integer('read', { mode: 'boolean' }).default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const scheduleShares = sqliteTable('schedule_shares', {
	id: text('id').primaryKey(),
	senderId: text('sender_id')
		.notNull()
		.references(() => user.id),
	recipientId: text('recipient_id')
		.notNull()
		.references(() => user.id),
	weekStartDate: integer('week_start_date', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
