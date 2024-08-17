CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text,
	`updated_at` text,
	`name` text NOT NULL,
	`description` text,
	`scheduled_start_datetime` text NOT NULL,
	`scheduled_end_datetime` text,
	`hours` integer NOT NULL,
	`location` text,
	`organization_period_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`contact_verification_info` text NOT NULL,
	`is_published` integer DEFAULT false,
	`last_reminder_sent_at` text,
	FOREIGN KEY (`organization_period_id`) REFERENCES `organization_periods`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `activity_attendances` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`organization_member_id` text NOT NULL,
	`status` text DEFAULT 'pending',
	`hours` real NOT NULL,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_member_id`) REFERENCES `organization_members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organization_members` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` text,
	`updated_at` text,
	`display_name` text NOT NULL,
	`role` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'pending',
	`additional_info` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organization_periods` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text,
	`updated_at` text,
	`organization_id` text NOT NULL,
	`hour_requirement` integer NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`additional_info` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`slug` text NOT NULL,
	`join_code` text,
	`created_at` text,
	`updated_at` text,
	`is_public` integer DEFAULT true,
	`additional_info` text DEFAULT '{"type":"consistent","details":{}}' NOT NULL,
	`require_membership_approval` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text,
	`email` text NOT NULL,
	`created_at` text,
	`verified_at` text,
	`finished_onboarding` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `act_scheduled_date_index` ON `activities` (`scheduled_start_datetime`);--> statement-breakpoint
CREATE INDEX `act_organization_period_id_index` ON `activities` (`organization_period_id`);--> statement-breakpoint
CREATE INDEX `act_organization_id_index` ON `activities` (`organization_id`);--> statement-breakpoint
CREATE INDEX `acta_activity_id_index` ON `activity_attendances` (`activity_id`);--> statement-breakpoint
CREATE INDEX `acta_organization_member_id_index` ON `activity_attendances` (`organization_member_id`);--> statement-breakpoint
CREATE INDEX `orgm_member_user_id_index` ON `organization_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `orgm_member_organization_id_index` ON `organization_members` (`organization_id`);--> statement-breakpoint
CREATE INDEX `orgp_organization_id_index` ON `organization_periods` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_join_code_unique` ON `organizations` (`join_code`);--> statement-breakpoint
CREATE INDEX `org_slug_index` ON `organizations` (`slug`);--> statement-breakpoint
CREATE INDEX `ses_user_id_index` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `usr_email_index` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `verification_tokens_token_unique` ON `verification_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `vft_token_index` ON `verification_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `vft_user_id_index` ON `verification_tokens` (`user_id`);