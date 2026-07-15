CREATE TABLE `announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`title` text NOT NULL,
	`title_hebrew` text,
	`content` text NOT NULL,
	`content_hebrew` text,
	`schedule_rules` text,
	`priority` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`start_date` text,
	`end_date` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `announcements_org_idx` ON `announcements` (`org_id`);--> statement-breakpoint
CREATE TABLE `display_objects` (
	`id` text PRIMARY KEY NOT NULL,
	`style_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`pos_x` integer NOT NULL,
	`pos_y` integer NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`layer` integer DEFAULT 0 NOT NULL,
	`font_family` text DEFAULT 'David Libre' NOT NULL,
	`font_size` integer DEFAULT 16 NOT NULL,
	`font_bold` integer DEFAULT false NOT NULL,
	`font_italic` integer DEFAULT false NOT NULL,
	`fore_color` text DEFAULT '#000000' NOT NULL,
	`back_color` text DEFAULT 'transparent' NOT NULL,
	`language` text DEFAULT 'hebrew' NOT NULL,
	`text_align` text DEFAULT 'center' NOT NULL,
	`vertical_align` text DEFAULT 'middle' NOT NULL,
	`line_height` real,
	`background_mode` text DEFAULT 'transparent' NOT NULL,
	`background_image` text,
	`background_gradient` text,
	`background_texture` text,
	`frame_id` text,
	`frame_thickness` real DEFAULT 0 NOT NULL,
	`scrolling_enabled` integer DEFAULT false NOT NULL,
	`scrolling_direction` text DEFAULT 'up' NOT NULL,
	`scrolling_speed` integer DEFAULT 60 NOT NULL,
	`content` text,
	`schedule_rules` text,
	`schedule_group_visibility` text,
	`visible` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`style_id`) REFERENCES `styles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `display_objects_style_idx` ON `display_objects` (`style_id`);--> statement-breakpoint
CREATE TABLE `edit_locks` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`user_id` text NOT NULL,
	`locked_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `edit_locks_orgId_unique` ON `edit_locks` (`org_id`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`file_path` text NOT NULL,
	`schedule_rules` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `media_org_idx` ON `media` (`org_id`);--> statement-breakpoint
CREATE TABLE `memorials` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`hebrew_name` text NOT NULL,
	`english_name` text,
	`hebrew_family_name` text,
	`hebrew_ben_bat` text,
	`relationship` text,
	`donor_info` text,
	`hebrew_year` integer,
	`hebrew_month` integer NOT NULL,
	`hebrew_day` integer NOT NULL,
	`hebrew_adar` integer DEFAULT 0 NOT NULL,
	`civil_date` integer,
	`is_yahrzeit` integer DEFAULT true NOT NULL,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `memorials_org_idx` ON `memorials` (`org_id`);--> statement-breakpoint
CREATE TABLE `minyan_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`hebrew_name` text NOT NULL,
	`type` text NOT NULL,
	`base_zman` text,
	`fixed_time` text,
	`offset` integer DEFAULT 0 NOT NULL,
	`earliest` text,
	`latest` text,
	`round_to` integer DEFAULT 5 NOT NULL,
	`round_direction` text DEFAULT 'nearest' NOT NULL,
	`room` text,
	`day_of_week_mask` text DEFAULT '1111111' NOT NULL,
	`schedule_group_ids` text,
	`details` text,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `minyan_schedules_org_idx` ON `minyan_schedules` (`org_id`);--> statement-breakpoint
CREATE TABLE `org_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'editor' NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `org_invites_token_unique` ON `org_invites` (`token`);--> statement-breakpoint
CREATE INDEX `org_invites_org_idx` ON `org_invites` (`org_id`);--> statement-breakpoint
CREATE INDEX `org_invites_email_idx` ON `org_invites` (`email`);--> statement-breakpoint
CREATE TABLE `org_memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`org_id` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `org_memberships_user_org_uq` ON `org_memberships` (`user_id`,`org_id`);--> statement-breakpoint
CREATE INDEX `org_memberships_org_idx` ON `org_memberships` (`org_id`);--> statement-breakpoint
CREATE TABLE `orgs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`latitude` real DEFAULT 0 NOT NULL,
	`longitude` real DEFAULT 0 NOT NULL,
	`elevation` real DEFAULT 0 NOT NULL,
	`timezone` text DEFAULT 'Asia/Jerusalem' NOT NULL,
	`in_israel` integer DEFAULT true NOT NULL,
	`dialect` text DEFAULT 'Ashkenazi' NOT NULL,
	`candle_lighting_minutes` integer DEFAULT 18 NOT NULL,
	`shabbat_end_type` text DEFAULT 'degrees' NOT NULL,
	`shabbat_end_value` real DEFAULT 8.5 NOT NULL,
	`rabbeinu_tam_minutes` integer DEFAULT 72 NOT NULL,
	`am_pm_format` integer DEFAULT false NOT NULL,
	`settings` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orgs_slug_unique` ON `orgs` (`slug`);--> statement-breakpoint
CREATE TABLE `schedule_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`hebrew_name` text NOT NULL,
	`color` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`auto_activation_rules` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_built_in` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `schedule_groups_org_idx` ON `schedule_groups` (`org_id`);--> statement-breakpoint
CREATE TABLE `screens` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`assigned_style_id` text,
	`style_schedules` text,
	`is_active` integer DEFAULT true NOT NULL,
	`resolution` text DEFAULT '1920x1080' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_style_id`) REFERENCES `styles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `screens_org_idx` ON `screens` (`org_id`);--> statement-breakpoint
CREATE TABLE `sponsors` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`type` text NOT NULL,
	`sponsor_name` text NOT NULL,
	`hebrew_text` text,
	`english_text` text,
	`hebrew_date` text,
	`civil_date` integer,
	`is_recurring` integer DEFAULT false NOT NULL,
	`recurrence_rule` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sponsors_org_idx` ON `sponsors` (`org_id`);--> statement-breakpoint
CREATE TABLE `styles` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`background_color` text DEFAULT '#0f172a' NOT NULL,
	`background_mode` text DEFAULT 'solid' NOT NULL,
	`background_image` text,
	`background_gradient` text,
	`background_texture` text,
	`background_frame_id` text,
	`background_frame_thickness` real DEFAULT 1,
	`canvas_width` integer DEFAULT 1920 NOT NULL,
	`canvas_height` integer DEFAULT 1080 NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`activation_rules` text DEFAULT '[]' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `styles_org_idx` ON `styles` (`org_id`);--> statement-breakpoint
CREATE TABLE `sync_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`token_hash` text NOT NULL,
	`last_seen_at` integer,
	`revoked_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sync_devices_tokenHash_unique` ON `sync_devices` (`token_hash`);--> statement-breakpoint
CREATE INDEX `sync_devices_org_idx` ON `sync_devices` (`org_id`);--> statement-breakpoint
CREATE TABLE `sync_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`table_name` text NOT NULL,
	`record_id` text NOT NULL,
	`operation` text NOT NULL,
	`data` text NOT NULL,
	`timestamp` integer NOT NULL,
	`synced` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sync_logs_org_idx` ON `sync_logs` (`org_id`);--> statement-breakpoint
CREATE INDEX `sync_logs_synced_idx` ON `sync_logs` (`synced`);--> statement-breakpoint
CREATE TABLE `tukachinsky_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text,
	`hebrew_month` integer NOT NULL,
	`hebrew_day` integer NOT NULL,
	`note_hebrew` text NOT NULL,
	`note_english` text,
	`category` text NOT NULL,
	`is_baseline` integer DEFAULT false NOT NULL,
	`is_hidden` integer DEFAULT false NOT NULL,
	`baseline_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tukachinsky_notes_org_idx` ON `tukachinsky_notes` (`org_id`);--> statement-breakpoint
CREATE INDEX `tukachinsky_notes_date_idx` ON `tukachinsky_notes` (`hebrew_month`,`hebrew_day`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_user_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`is_super_admin` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerkUserId_unique` ON `users` (`clerk_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `zmanim_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`zman_type` text NOT NULL,
	`authority` text NOT NULL,
	`degrees_below` real,
	`fixed_minutes` integer,
	`earliest` text,
	`latest` text,
	`round_to` integer,
	`offset` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `orgs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `zmanim_configs_org_zman_uq` ON `zmanim_configs` (`org_id`,`zman_type`);