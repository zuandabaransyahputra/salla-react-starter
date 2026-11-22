import { withThemeSentry } from '@salla.sa/twilight-theme-engine/sentry/server';
import handler from '@tanstack/react-start/server-entry';
import { THEME_ID } from './lib/theme';

export default withThemeSentry(handler, THEME_ID);
