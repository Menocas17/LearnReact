CREATE TABLE "bookmark" (
	"user_id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"block" integer NOT NULL,
	"excerpt" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;