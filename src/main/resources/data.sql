-- Update existing notes to have default values for new fields
UPDATE notes SET is_favorite = false WHERE is_favorite IS NULL;