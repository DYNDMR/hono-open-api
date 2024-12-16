CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`done` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
