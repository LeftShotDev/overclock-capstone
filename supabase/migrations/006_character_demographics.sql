-- ============================================================
-- Migration 006: Character Demographics
-- Adds sex and ethnicity columns to the characters table
-- and populates them for the existing 16 characters.
-- ============================================================

-- 1. Add new columns
ALTER TABLE characters ADD COLUMN sex TEXT;
ALTER TABLE characters ADD COLUMN ethnicity TEXT;

-- 2. Populate existing characters

-- Explorer
UPDATE characters SET sex = 'Female', ethnicity = 'White'  WHERE id = 'frizzle';
UPDATE characters SET sex = 'Female', ethnicity = 'White'  WHERE id = 'jess_day';
UPDATE characters SET sex = 'Male',   ethnicity = 'Latino' WHERE id = 'evan_marquez';

-- Nurturer
UPDATE characters SET sex = 'Female', ethnicity = 'Black'  WHERE id = 'janine_teagues';
UPDATE characters SET sex = 'Male',   ethnicity = 'Asian'  WHERE id = 'uncle_iroh';
UPDATE characters SET sex = 'Male',   ethnicity = 'Asian'  WHERE id = 'jiraiya';

-- Mentor
UPDATE characters SET sex = 'Male',   ethnicity = 'Asian'  WHERE id = 'mr_miyagi';
UPDATE characters SET sex = 'Male',   ethnicity = 'Latino' WHERE id = 'gabe_iglesias';
UPDATE characters SET sex = 'Male',   ethnicity = 'White'  WHERE id = 'mr_feeny';

-- Mastery Coach
UPDATE characters SET sex = 'Male',   ethnicity = 'Latino' WHERE id = 'escalante';
UPDATE characters SET sex = 'Male',   ethnicity = 'Black'  WHERE id = 'coach_carter';
UPDATE characters SET sex = 'Male',   ethnicity = 'Asian'  WHERE id = 'all_might';
UPDATE characters SET sex = 'Male',   ethnicity = 'White'  WHERE id = 'coach_taylor';

-- Strategist
UPDATE characters SET sex = 'Female', ethnicity = 'Black'  WHERE id = 'annalise_keating';
UPDATE characters SET sex = 'Female', ethnicity = 'White'  WHERE id = 'mcgonagall';
UPDATE characters SET sex = 'Female', ethnicity = 'Black'  WHERE id = 'storm';
