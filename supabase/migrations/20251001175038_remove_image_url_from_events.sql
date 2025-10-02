-- Remove image_url column from events table
alter table events drop column if exists image_url;
