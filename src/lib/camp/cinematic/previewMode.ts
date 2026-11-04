// Build-time opt-in only: a normal build cannot select the demonstration database.
export const CAMP_PREVIEW = import.meta.env.VITE_CAMP_PREVIEW === 'true';
export const CAMP_PREVIEW_DB = 'LevelMeUpCampCinematicPreview';
