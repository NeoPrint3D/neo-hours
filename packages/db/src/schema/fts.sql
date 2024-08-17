--> statement-breakpoint
CREATE VIRTUAL TABLE activity_name_fts USING fts5(name, content='activities');
--> statement-breakpoint
CREATE VIRTUAL TABLE activity_description_fts USING fts5(description, content='activities');
--> statement-breakpoint
CREATE VIRTUAL TABLE member_name_fts USING fts5(display_name, content='organization_members');
--> statement-breakpoint
CREATE TRIGGER activity_name_ai AFTER INSERT ON activities
BEGIN
  INSERT INTO activity_name_fts(rowid, name) VALUES (new.rowid, new.name);
END;
--> statement-breakpoint
CREATE TRIGGER activity_description_ai AFTER INSERT ON activities
BEGIN
  INSERT INTO activity_description_fts(rowid, description) VALUES (new.rowid, new.description);
END;
--> statement-breakpoint
CREATE TRIGGER activity_name_ad AFTER DELETE ON activities
BEGIN
  INSERT INTO activity_name_fts(activity_name_fts, rowid, name) VALUES ('delete', old.rowid, old.name);
END;
--> statement-breakpoint
CREATE TRIGGER activity_description_ad AFTER DELETE ON activities
BEGIN
  INSERT INTO activity_description_fts(activity_description_fts, rowid, description) VALUES ('delete', old.rowid, old.description);
END;
--> statement-breakpoint
CREATE TRIGGER activity_name_au AFTER UPDATE ON activities
BEGIN
  INSERT INTO activity_name_fts(activity_name_fts, rowid, name) VALUES ('delete', old.rowid, old.name);
  INSERT INTO activity_name_fts(rowid, name) VALUES (new.rowid, new.name);
END;
--> statement-breakpoint
CREATE TRIGGER activity_description_au AFTER UPDATE ON activities
BEGIN
  INSERT INTO activity_description_fts(activity_description_fts, rowid, description) VALUES ('delete', old.rowid, old.description);
  INSERT INTO activity_description_fts(rowid, description) VALUES (new.rowid, new.description);
END;
--> statement-breakpoint
CREATE TRIGGER member_name_ai AFTER INSERT ON organization_members
BEGIN
  INSERT INTO member_name_fts(rowid, display_name) VALUES (new.rowid, new.display_name);
END;
--> statement-breakpoint
CREATE TRIGGER member_name_ad AFTER DELETE ON organization_members
BEGIN
  INSERT INTO member_name_fts(member_name_fts, rowid, display_name) VALUES ('delete', old.rowid, old.display_name);
END;
--> statement-breakpoint
CREATE TRIGGER member_name_au AFTER UPDATE ON organization_members
BEGIN
  INSERT INTO member_name_fts(member_name_fts, rowid, display_name) VALUES ('delete', old.rowid, old.display_name);
  INSERT INTO member_name_fts(rowid, display_name) VALUES (new.rowid, new.display_name);
END;